'use client'

import { useState, useTransition, useCallback, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, RouteCard, SearchInput, Divider } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import type { RouteListItem, Tag, RouteContentType, RouteDetail } from '@/types/api'
import { getRoutes, getTags, getRouteById } from '@/features/routes/actions'
import { Map } from 'lucide-react'

const ROUTE_TYPES: { label: string; value: RouteContentType | '' }[] = [
  { label: 'All Types', value: '' },
  { label: 'Official', value: 'Official' },
  { label: 'Community', value: 'Community' },
]

const DEFAULT_MAP_CENTER: [number, number] = [30.7133, 36.8969]
const DEFAULT_MAP_ZOOM = 10

const PREVIEW_LINE_SOURCE = 'search-preview-line-source'
const PREVIEW_STOPS_SOURCE = 'search-preview-stops-source'
const PREVIEW_LINE_LAYER = 'search-preview-line-layer'
const PREVIEW_STOPS_LAYER = 'search-preview-stops-layer'

type PreviewMapSource = {
  setData: (data: unknown) => void
}

type PreviewMap = {
  addControl: (control: unknown, position?: string) => void
  on: (event: string, cb: () => void) => void
  once: (event: string, cb: () => void) => void
  remove: () => void
  isStyleLoaded: () => boolean
  getSource: (id: string) => PreviewMapSource | undefined
  addSource: (id: string, source: unknown) => void
  getLayer: (id: string) => unknown
  addLayer: (layer: unknown) => void
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  fitBounds: (bounds: [[number, number], [number, number]], options?: { padding?: number; maxZoom?: number }) => void
}

function routeToCardData(route: RouteListItem): RouteCardData {
  return {
    id: route.id,
    title: route.title,
    description: route.description ?? undefined,
    image: route.thumbnailUrl ?? undefined,
    rating: route.averageRating > 0 ? route.averageRating : undefined,
    contentType: route.contentType,
    isOfficial: route.contentType === 'Official',
  }
}

function decodePolyline(encoded: string): Array<[number, number]> {
  const points: Array<[number, number]> = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let result = 0
    let shift = 0
    let byte = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lat += deltaLat

    result = 0
    shift = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lng += deltaLng

    points.push([lng / 1e5, lat / 1e5])
  }

  return points
}

export default function SearchPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState('')
  const [activeTagId, setActiveTagId] = useState<string | null>(null)
  const [routeType, setRouteType] = useState<RouteContentType | ''>('')
  const [tags, setTags] = useState<Tag[]>([])
  const [results, setResults] = useState<RouteListItem[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [previewRouteId, setPreviewRouteId] = useState<string | null>(null)

  const [previewRouteDetails, setPreviewRouteDetails] = useState<Record<string, RouteDetail>>({})
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null)
  const [previewMapError, setPreviewMapError] = useState<string | null>(null)

  const previewMapContainerRef = useRef<HTMLDivElement | null>(null)
  const previewMapRef = useRef<PreviewMap | null>(null)

  useEffect(() => {
    getTags(100).then(setTags).catch(() => {})
  }, [])

  const fetchResults = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await getRoutes({
          search: search || undefined,
          tagIds: activeTagId ? [activeTagId] : undefined,
          type: routeType ? routeType.toLowerCase() as 'official' | 'community' | 'sponsored' : undefined,
          pageSize: 20,
        })
        setResults(res.data)
        setTotalResults(res.totalRecords)
      } catch {
        setResults([])
        setTotalResults(0)
      }
    })
  }, [search, activeTagId, routeType])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  useEffect(() => {
    if (results.length === 0) {
      setPreviewRouteId(null)
      return
    }
    if (previewRouteId && !results.some((route) => route.id === previewRouteId)) {
      setPreviewRouteId(null)
    }
  }, [results, previewRouteId])

  const ensurePreviewDetail = useCallback(async (routeId: string) => {
    if (!routeId || previewRouteDetails[routeId] || previewLoadingId === routeId) return
    setPreviewLoadingId(routeId)
    try {
      const detail = await getRouteById(routeId)
      setPreviewRouteDetails((prev) => ({ ...prev, [routeId]: detail }))
    } catch {
    } finally {
      setPreviewLoadingId((current) => (current === routeId ? null : current))
    }
  }, [previewRouteDetails, previewLoadingId])

  const previewRoute = useMemo(
    () => (previewRouteId ? results.find((route) => route.id === previewRouteId) ?? null : null),
    [previewRouteId, results],
  )

  const previewRouteDetail = previewRoute ? previewRouteDetails[previewRoute.id] : null

  useEffect(() => {
    if (previewRoute) {
      void ensurePreviewDetail(previewRoute.id)
    }
  }, [previewRoute, ensurePreviewDetail])

  const tryInitPreviewMap = useCallback(async () => {
    if (!previewMapContainerRef.current || previewMapRef.current) return

    try {
      if (!document.querySelector('link[data-maplibre-style="true"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css'
        link.dataset.maplibreStyle = 'true'
        document.head.appendChild(link)
      }

      const maplibre = await import('maplibre-gl')
      if (!previewMapContainerRef.current || previewMapRef.current) return

      const map = new maplibre.Map({
        container: previewMapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
      }) as unknown as PreviewMap

      map.addControl(new maplibre.NavigationControl(), 'top-right')

      map.on('load', () => {
        if (!map.getSource(PREVIEW_LINE_SOURCE)) {
          map.addSource(PREVIEW_LINE_SOURCE, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          })
        }

        if (!map.getLayer(PREVIEW_LINE_LAYER)) {
          map.addLayer({
            id: PREVIEW_LINE_LAYER,
            type: 'line',
            source: PREVIEW_LINE_SOURCE,
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#FF8C00', 'line-width': 3.5 },
          })
        }

        if (!map.getSource(PREVIEW_STOPS_SOURCE)) {
          map.addSource(PREVIEW_STOPS_SOURCE, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          })
        }

        if (!map.getLayer(PREVIEW_STOPS_LAYER)) {
          map.addLayer({
            id: PREVIEW_STOPS_LAYER,
            type: 'circle',
            source: PREVIEW_STOPS_SOURCE,
            paint: {
              'circle-radius': 5.5,
              'circle-color': '#FF8C00',
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': 1.5,
            },
          })
        }
      })

      previewMapRef.current = map
      setPreviewMapError(null)
    } catch {
      setPreviewMapError('Map preview could not be loaded.')
    }
  }, [])

  useEffect(() => {
    void tryInitPreviewMap()
  }, [tryInitPreviewMap])

  useEffect(() => {
    return () => {
      if (previewMapRef.current) {
        previewMapRef.current.remove()
      }
      previewMapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = previewMapRef.current
    if (!map) return

    const applyPreview = () => {
      const lineSource = map.getSource(PREVIEW_LINE_SOURCE)
      const stopsSource = map.getSource(PREVIEW_STOPS_SOURCE)
      if (!lineSource || !stopsSource) return

      if (!previewRoute) {
        lineSource.setData({
          type: 'FeatureCollection',
          features: [],
        })
        stopsSource.setData({
          type: 'FeatureCollection',
          features: [],
        })
        map.setCenter(DEFAULT_MAP_CENTER)
        map.setZoom(DEFAULT_MAP_ZOOM)
        return
      }

      const stopCoordinates = (previewRouteDetail?.stops ?? [])
        .filter((stop) => Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude))
        .map((stop) => [stop.longitude, stop.latitude] as [number, number])

      const polylineCoordinates = previewRouteDetail?.encodedPolyline
        ? decodePolyline(previewRouteDetail.encodedPolyline)
        : []

      const routeCoordinates = polylineCoordinates.length > 1 ? polylineCoordinates : stopCoordinates

      lineSource.setData({
        type: 'FeatureCollection',
        features: routeCoordinates.length > 1
          ? [{
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: routeCoordinates },
              properties: {},
            }]
          : [],
      })

      stopsSource.setData({
        type: 'FeatureCollection',
        features: stopCoordinates.map((coordinates, index) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates },
          properties: { order: index + 1 },
        })),
      })

      const fitCoordinates = routeCoordinates.length > 0 ? routeCoordinates : stopCoordinates

      if (fitCoordinates.length === 0) {
        if (
          previewRouteDetail
          && Number.isFinite(previewRouteDetail.centerLatitude)
          && Number.isFinite(previewRouteDetail.centerLongitude)
        ) {
          map.setCenter([previewRouteDetail.centerLongitude, previewRouteDetail.centerLatitude])
          map.setZoom(11)
        } else {
          map.setCenter(DEFAULT_MAP_CENTER)
          map.setZoom(DEFAULT_MAP_ZOOM)
        }
        return
      }

      let minLon = fitCoordinates[0][0]
      let minLat = fitCoordinates[0][1]
      let maxLon = fitCoordinates[0][0]
      let maxLat = fitCoordinates[0][1]

      for (const [lon, lat] of fitCoordinates) {
        if (lon < minLon) minLon = lon
        if (lat < minLat) minLat = lat
        if (lon > maxLon) maxLon = lon
        if (lat > maxLat) maxLat = lat
      }

      if (minLon === maxLon && minLat === maxLat) {
        map.setCenter([minLon, minLat])
        map.setZoom(13)
      } else {
        map.fitBounds(
          [
            [minLon, minLat],
            [maxLon, maxLat],
          ],
          { padding: 26, maxZoom: 13 },
        )
      }
    }

    if (!map.isStyleLoaded()) {
      map.once('load', applyPreview)
      return
    }
    applyPreview()
  }, [previewRoute, previewRouteDetail])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px minmax(0, 1fr) 320px',
        gap: '20px',
        alignItems: 'start',
      }}
    >
      <YStack gap="$5" $md={{ display: 'none' }}>
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">Filters</Text>
          <Text
            variant="caption"
            color="$primary"
            cursor="pointer"
            weight="semibold"
            onPress={() => {
              setActiveTagId(null)
              setRouteType('')
              setSearch('')
            }}
          >
            RESET ALL
          </Text>
        </XStack>

        <YStack gap="$2">
          <Text variant="label" color="$mutedForeground">Search</Text>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search routes..."
          />
        </YStack>

        <Divider />

        {tags.length > 0 && (
          <YStack gap="$2">
            <Text variant="label" color="$mutedForeground">Tags</Text>
            <YStack gap="$1">
              {tags.filter((t) => t.isActive).map((tag) => (
                <XStack
                  key={tag.id}
                  paddingVertical="$2"
                  paddingHorizontal="$3"
                  borderRadius="$3"
                  backgroundColor={activeTagId === tag.id ? '$ant50' : 'transparent'}
                  hoverStyle={{ backgroundColor: '$backgroundHover' }}
                  cursor="pointer"
                  onPress={() => setActiveTagId(activeTagId === tag.id ? null : tag.id)}
                  gap="$2"
                  alignItems="center"
                >
                  <Text
                    variant="body"
                    color={activeTagId === tag.id ? '$primary' : '$color'}
                    weight={activeTagId === tag.id ? 'semibold' : 'regular'}
                  >
                    {tag.name}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </YStack>
        )}

        <Divider />

        <YStack gap="$2">
          <Text variant="label" color="$mutedForeground">Route Type</Text>
          <YStack gap="$1.5">
            {ROUTE_TYPES.map((rt) => (
              <XStack
                key={rt.value || 'all'}
                gap="$2"
                alignItems="center"
                cursor="pointer"
                onPress={() => setRouteType(rt.value)}
              >
                <XStack
                  width={18}
                  height={18}
                  borderRadius="$full"
                  borderWidth={2}
                  borderColor={routeType === rt.value ? '$primary' : '$borderColor'}
                  alignItems="center"
                  justifyContent="center"
                >
                  {routeType === rt.value && (
                    <YStack width={10} height={10} borderRadius="$full" backgroundColor="$primary" />
                  )}
                </XStack>
                <Text variant="body">{rt.label}</Text>
              </XStack>
            ))}
          </YStack>
        </YStack>
      </YStack>

      <YStack minWidth={0} gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$2" alignItems="center">
            <Text variant="heading4" weight="bold">Results</Text>
            {!isPending && (
              <Text variant="body" muted>
                {totalResults > 0 ? `${totalResults} routes found` : 'No routes found'}
              </Text>
            )}
            {isPending && <Text variant="body" muted>Searching...</Text>}
          </XStack>
        </XStack>

        {results.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {results.map((route) => (
              <div
                key={route.id}
                onMouseEnter={() => {
                  setPreviewRouteId(route.id)
                  void ensurePreviewDetail(route.id)
                }}
                style={{
                  borderRadius: 14,
                  outline: previewRouteId === route.id ? '2px solid #EA580C' : '2px solid transparent',
                  outlineOffset: 0,
                  transition: 'outline-color 120ms ease',
                }}
              >
                <RouteCard
                  data={routeToCardData(route)}
                  onPress={() => router.push(`/routes/${route.id}`)}
                />
              </div>
            ))}
          </div>
        ) : !isPending ? (
          <YStack alignItems="center" justifyContent="center" padding="$10" gap="$3">
            <Map size={48} color="var(--color-mutedForeground)" strokeWidth={1.5} />
            <Text variant="heading4" muted align="center">No routes found</Text>
            <Text variant="body" muted align="center">Try adjusting your filters or search term.</Text>
          </YStack>
        ) : null}
      </YStack>

      <YStack minWidth={0} $md={{ display: 'none' }}>
        <YStack
          minHeight={260}
          backgroundColor="$muted"
          borderRadius="$4"
          borderWidth={2}
          borderStyle="dashed"
          borderColor="$borderColor"
          position="sticky"
          top={80}
          padding="$4"
          gap="$3"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              <Map size={18} color="var(--color-mutedForeground)" strokeWidth={1.7} />
              <Text variant="heading4" muted>Map Preview</Text>
            </XStack>
            {previewRouteId && (
              <Text variant="caption" color="$primary">Live Hover</Text>
            )}
          </XStack>

          <YStack
            backgroundColor="$backgroundStrong"
            borderRadius="$3"
            overflow="hidden"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <YStack height={150} backgroundColor="$backgroundHover" borderBottomWidth={1} borderColor="$borderColor" position="relative">
              <div
                ref={previewMapContainerRef}
                style={{ width: '100%', height: '100%' }}
                aria-label="Route map preview"
              />
              {previewMapError ? (
                <YStack
                  position="absolute"
                  inset={0}
                  alignItems="center"
                  justifyContent="center"
                  gap="$1.5"
                  backgroundColor="rgba(255,255,255,0.88)"
                >
                  <Map size={20} color="var(--color-mutedForeground)" strokeWidth={1.5} />
                  <Text variant="caption" muted>{previewMapError}</Text>
                </YStack>
              ) : null}
              {previewRoute && previewLoadingId === previewRoute.id ? (
                <YStack
                  position="absolute"
                  bottom="$2"
                  right="$2"
                  backgroundColor="rgba(0,0,0,0.55)"
                  borderRadius="$2"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                >
                  <Text variant="caption" color="#FFFFFF">Loading route map...</Text>
                </YStack>
              ) : null}
            </YStack>

            {previewRoute ? (
              <YStack padding="$3" gap="$1.5">
                <Text variant="label" color="$mutedForeground">Previewing route</Text>
                <Text variant="heading4" numberOfLines={2}>{previewRoute.title}</Text>
                {previewRoute.description && (
                  <Text variant="caption" muted numberOfLines={2}>{previewRoute.description}</Text>
                )}
                <XStack marginTop="$1.5" justifyContent="space-between" alignItems="center">
                  <Text variant="caption" muted>
                    {previewRoute.contentType} {previewRoute.averageRating > 0 ? `· ${previewRoute.averageRating.toFixed(1)}/5` : ''}
                  </Text>
                  <Text
                    variant="caption"
                    color="$primary"
                    cursor="pointer"
                    weight="semibold"
                    onPress={() => router.push(`/routes/${previewRoute.id}`)}
                  >
                    Open Route
                  </Text>
                </XStack>
              </YStack>
            ) : (
              <YStack
                alignItems="center"
                justifyContent="center"
                borderTopWidth={1}
                borderColor="$borderColor"
                gap="$2"
                padding="$4"
              >
                <Text variant="label" muted>Hover a route card</Text>
                <Text variant="caption" muted textAlign="center">
                  Map stays visible, route details appear here.
                </Text>
              </YStack>
            )}
          </YStack>
        </YStack>
      </YStack>
    </div>
  )
}
