'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, StatBox, RatingDisplay } from '@antapp/ui'
import type { RouteDetail } from '@/types/api'
import { Navigation, Bookmark, BookmarkCheck, Map, Star, GitFork, Pencil, Crown, X, CheckCircle, Sparkles, Ellipsis } from 'lucide-react'
import { SaveToCollectionModal } from '@/features/collections/save-to-collection-modal'
import { rateRoute, forkRoute, promoteRouteToOfficial } from '@/features/routes/actions'
import { loadMapLibre, runWhenBrowserIdle } from '@/lib/maplibre'

// ─── Star Rating Widget ───────────────────────────────────────────────────────

function StarRatingWidget({
  routeId,
  onRated,
}: {
  routeId: string
  onRated: (score: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [isSubmitting, startSubmit] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  const handleRate = (score: number) => {
    if (submitted) return
    setSelected(score)
    startSubmit(async () => {
      try {
        await rateRoute(routeId, score)
        setSubmitted(true)
        onRated(score)
      } catch {
        setSelected(0)
      }
    })
  }

  const active = hovered || selected

  if (submitted) {
    return (
      <XStack alignItems="center" gap="$2" padding="$3" backgroundColor="$success50" borderRadius="$3">
        <Star size={16} fill="var(--color-success500, #22C55E)" color="var(--color-success500, #22C55E)" />
        <Text variant="caption" color="$success500">Thanks! You rated this {selected}/5</Text>
      </XStack>
    )
  }

  return (
    <YStack gap="$2">
      <Text variant="label" color="$mutedForeground">Rate This Route</Text>
      <XStack gap="$1.5" alignItems="center">
        {[1, 2, 3, 4, 5].map((star) => (
          <XStack
            key={star}
            cursor={isSubmitting ? 'default' : 'pointer'}
            onPress={() => handleRate(star)}
            padding="$1"
            borderRadius="$2"

            onMouseEnter={() => !isSubmitting && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star
              size={28}
              fill={star <= active ? '#FF8C00' : 'transparent'}
              color={star <= active ? '#FF8C00' : 'var(--color-mutedForeground)'}
              strokeWidth={1.5}
            />
          </XStack>
        ))}
        {isSubmitting && <Text variant="caption" muted>Saving...</Text>}
      </XStack>
    </YStack>
  )
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

// ─── Main Component ───────────────────────────────────────────────────────────

function getBaseSpotName(stop: RouteDetail['stops'][number]) {
  return stop.spotName?.trim() || stop.name
}

function hasTitleOverride(stop: RouteDetail['stops'][number]) {
  const customTitle = stop.customTitle?.trim()
  if (!customTitle) return false
  return customTitle !== getBaseSpotName(stop)
}

function buildSpotHref(spotId: string, routeStopName: string) {
  const params = new URLSearchParams()
  params.set('fromRouteName', routeStopName)
  return `/spots/${spotId}?${params.toString()}`
}

export default function RouteDetailClient({
  route,
  isOwner = false,
  isAdmin = false,
}: {
  route: RouteDetail
  isOwner?: boolean
  isAdmin?: boolean
}) {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<unknown>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [shouldLoadMap, setShouldLoadMap] = useState(false)

  const polylineCoordinates = useMemo(() => {
    if (!route.encodedPolyline) return []
    try {
      return decodePolyline(route.encodedPolyline)
    } catch {
      return []
    }
  }, [route.encodedPolyline])

  const stopPoints = useMemo(
    () => route.stops
      .filter((stop) => Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude))
      .map((stop, index) => ({
        coordinates: [stop.longitude, stop.latitude] as [number, number],
        order: stop.order || index + 1,
        name: stop.name,
        spotId: stop.spotId,
      })),
    [route.stops],
  )

  const stopCoordinates = useMemo(
    () => stopPoints.map((point) => point.coordinates),
    [stopPoints],
  )

  const routeLineCoordinates = useMemo(
    () => (polylineCoordinates.length > 1 ? polylineCoordinates : stopCoordinates),
    [polylineCoordinates, stopCoordinates],
  )

  useEffect(() => runWhenBrowserIdle(() => setShouldLoadMap(true)), [])

  useEffect(() => {
    if (!shouldLoadMap) return

    let cancelled = false

    const initMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return

      try {
        const maplibre = await loadMapLibre()
        if (cancelled || !mapContainerRef.current || mapRef.current) return

        const hasCenter = Number.isFinite(route.centerLatitude) && Number.isFinite(route.centerLongitude)
        const map = new maplibre.Map({
          container: mapContainerRef.current,
          style: 'https://tiles.openfreemap.org/styles/liberty',
          center: hasCenter ? [route.centerLongitude, route.centerLatitude] : [30.7133, 36.8969],
          zoom: hasCenter ? 11 : 10,
        })

        map.addControl(new maplibre.NavigationControl(), 'top-right')

        map.on('load', () => {
          if (cancelled) return

          if (routeLineCoordinates.length > 1) {
            map.addSource('route-line', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: routeLineCoordinates,
                },
                properties: {},
              },
            })

            map.addLayer({
              id: 'route-line-layer',
              type: 'line',
              source: 'route-line',
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': '#FF8C00',
                'line-width': 4,
                'line-dasharray': [1.5, 1.5],
              },
            })
          }

          if (stopPoints.length > 0) {
            map.addSource('route-stops', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: stopPoints.map((stop) => ({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: stop.coordinates,
                  },
                  properties: {
                    order: stop.order,
                  },
                })),
              },
            })

            map.addLayer({
              id: 'route-stops-layer',
              type: 'circle',
              source: 'route-stops',
              paint: {
                'circle-radius': 8,
                'circle-color': '#FF8C00',
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 2,
              },
            })

            map.addLayer({
              id: 'route-stops-label-layer',
              type: 'symbol',
              source: 'route-stops',
              layout: {
                'text-field': ['to-string', ['get', 'order']],
                'text-size': 11,
                'text-font': ['Open Sans Semibold'],
                'text-allow-overlap': true,
                'text-ignore-placement': true,
              },
              paint: {
                'text-color': '#FFFFFF',
                'text-halo-color': '#C2410C',
                'text-halo-width': 1.25,
              },
            })
          }

          const fitCoordinates = routeLineCoordinates.length > 0 ? routeLineCoordinates : stopCoordinates

          if (fitCoordinates.length > 0) {
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
              map.setZoom(14)
            } else {
              map.fitBounds(
                [
                  [minLon, minLat],
                  [maxLon, maxLat],
                ],
                { padding: 40, maxZoom: 14 }
              )
            }
          }
        })

        mapRef.current = map
      } catch {
        if (!cancelled) {
          setMapError('Route map could not be loaded right now.')
        }
      }
    }

    void initMap()

    return () => {
      cancelled = true
      if (mapRef.current && typeof mapRef.current === 'object' && 'remove' in mapRef.current) {
        ; (mapRef.current as { remove: () => void }).remove()
      }
      mapRef.current = null
    }
  }, [route.centerLatitude, route.centerLongitude, routeLineCoordinates, shouldLoadMap, stopCoordinates, stopPoints])

  // Save state
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showCollectionModal, setShowCollectionModal] = useState(false)

  // Fork state
  const [isForking, startFork] = useTransition()
  const [forkError, setForkError] = useState<string | null>(null)
  const [hasForked, setHasForked] = useState(false)

  // Promote state
  const [isPromoting, startPromote] = useTransition()
  const [promoteError, setPromoteError] = useState<string | null>(null)
  const [isPromoted, setIsPromoted] = useState(route.contentType === 'Official')

  // Rating state
  const [displayRating, setDisplayRating] = useState(route.averageRating)

  // Tour Guide Mode state
  const [isTourMode, setIsTourMode] = useState(false)
  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const currentStop = route.stops[currentStopIndex] ?? route.stops[0]

  const handleSave = () => {
    if (isSaved) return
    setShowCollectionModal(true)
  }

  const handleFork = () => {
    if (isForking || hasForked) return
    setForkError(null)
    setHasForked(true)
    startFork(async () => {
      try {
        const forkedId = await forkRoute(route.id)
        router.push(`/routes/${forkedId}`)
      } catch (e) {
        setHasForked(false)
        setForkError((e as Error).message ?? 'Failed to fork route')
      }
    })
  }

  const handlePromote = () => {
    if (isPromoted) return
    setPromoteError(null)
    startPromote(async () => {
      try {
        await promoteRouteToOfficial(route.id)
        setIsPromoted(true)
      } catch (e) {
        setPromoteError((e as Error).message ?? 'Failed to promote route')
      }
    })
  }

  return (
    <YStack gap="$5" flex={1}>
      {/* Hero Banner */}
      <YStack
        backgroundColor="$ant900"
        borderRadius="$4"
        padding="$6"
        minHeight={240}
        justifyContent="flex-end"
        position="relative"
        overflow="hidden"
      >
        {route.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={route.thumbnailUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              opacity: 0.96,
            }}
          />
        )}
        <XStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.16) 0%, rgba(15,23,42,0.44) 100%)' }}
        />

        {/* Privacy Badge */}
        {isOwner && (
          <XStack
            position="absolute"
            top="$4"
            right="$4"
            backgroundColor="rgba(15,23,42,0.6)"
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            borderRadius="$2"
            gap="$1.5"
            alignItems="center"
          >
            {route.isPublic ? <Sparkles size={12} color="#4ADE80" /> : <Ellipsis size={12} color="#FBBF24" />}
            <Text variant="caption" color="#FFFFFF">{route.isPublic ? 'Public' : 'Draft'}</Text>
          </XStack>
        )}

        <YStack zIndex={1} gap="$3">
          <YStack gap="$1">
            <Text variant="heading1" color="#FFFFFF">{route.title}</Text>
            {route.originalAuthorName && (
              <XStack alignItems="center" gap="$2" marginTop="$1">
                <GitFork size={14} color="#FFFFFF" opacity={0.8} />
                <Text variant="caption" color="#FFFFFF" opacity={0.8}>Forked from {route.originalAuthorName}</Text>
              </XStack>
            )}
            {displayRating > 0 && (
              <XStack alignItems="center" gap="$3" flexWrap="wrap">
                <RatingDisplay value={displayRating} />
                <Text variant="caption" color="$ant200">{displayRating.toFixed(1)} avg rating</Text>
              </XStack>
            )}
          </YStack>

          <XStack gap="$2.5" flexWrap="wrap" marginTop="$1">
            <Button variant="solid" size="md" onPress={() => {
              if (route.stops.length > 0) {
                setCurrentStopIndex(0)
                setIsTourMode(true)
              } else {
                alert("This route has no stops.")
              }
            }}>
              <XStack alignItems="center" gap="$1.5">
                <Navigation size={16} color="#FFFFFF" />
                <Text variant="label" color="#FFFFFF">Start Navigation</Text>
              </XStack>
            </Button>

            <Button
              variant="outline"
              size="md"
              loading={isSaving}
              disabled={isSaved || isSaving}
              onPress={handleSave}

              style={{ backgroundColor: isSaved ? 'rgba(255,255,255,0.2)' : undefined }}
            >
              <XStack alignItems="center" gap="$1.5">
                {isSaved
                  ? <BookmarkCheck size={16} color="#FFFFFF" />
                  : <Bookmark size={16} color="currentColor" />
                }
                <YStack>
                  <XStack alignItems="center" gap="$1">
                    <Text variant="label" color={isSaved ? '#FFFFFF' : undefined}>
                      {isSaved ? 'In Collection' : 'Save to Collection'}
                    </Text>
                  </XStack>
                </YStack>
              </XStack>
            </Button>

            {isOwner && (
              <Button
                variant="ghost"
                size="md"
                onPress={() => router.push(`/routes/${route.id}/edit`)}

                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <XStack alignItems="center" gap="$1.5">
                  <Pencil size={16} color="#FFFFFF" />
                  <Text variant="label" color="#FFFFFF">Edit</Text>
                </XStack>
              </Button>
            )}

            {isAdmin && (
              <Button
                variant={isPromoted ? 'solid' : 'outline'}
                size="md"
                loading={isPromoting}
                disabled={isPromoted || isPromoting}
                onPress={handlePromote}

                style={{ backgroundColor: isPromoted ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.1)' }}
              >
                <XStack alignItems="center" gap="$1.5">
                  <Crown size={16} color={isPromoted ? '#4CAF50' : '#FFFFFF'} />
                  <Text variant="label" color={isPromoted ? '#4CAF50' : '#FFFFFF'}>
                    {isPromoted ? 'Official ✓' : 'Promote'}
                  </Text>
                </XStack>
              </Button>
            )}
          </XStack>

          {saveError && (
            <Text variant="caption" color="$error500">{saveError}</Text>
          )}
          {promoteError && (
            <Text variant="caption" color="$error500">{promoteError}</Text>
          )}
        </YStack>
      </YStack>

      {/* Stats Bar */}
      <XStack gap="$3" flexWrap="wrap">
        <StatBox value={`${route.stops.length}`} label="Stops" icon={<Map size={22} color="var(--color-primary)" />} />
        {displayRating > 0 && (
          <StatBox value={displayRating.toFixed(1)} label="Avg Rating" />
        )}
      </XStack>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', alignItems: 'start' }}>
        {/* Left Column */}
        <YStack flex={2} minWidth={400} gap="$5">
          {/* About */}
          {route.description && (
            <YStack gap="$2">
              <Text variant="heading3">About this route</Text>
              <Text variant="body" color="$mutedForeground" lineHeight="$7">{route.description}</Text>
            </YStack>
          )}

          {/* Route Map */}
          <YStack gap="$3">
            <Text variant="heading3">Interactive Route Map</Text>
            <YStack
              height={300}
              backgroundColor="$muted"
              borderRadius="$4"
              overflow="hidden"
            >
              <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '100%' }}
                aria-label="Interactive route map"
              />
              {mapError ? (
                <YStack
                  position="absolute"
                  inset={0}
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={2}
                  borderStyle="dashed"
                  borderColor="$borderColor"
                  gap="$2"
                >
                  <Map size={48} color="var(--color-mutedForeground)" strokeWidth={1.5} />
                  <Text variant="body" muted>{mapError}</Text>
                </YStack>
              ) : null}
            </YStack>
          </YStack>

          {/* Route Stops */}
          {route.stops.length > 0 && (
            <YStack gap="$3">
              <Text variant="heading3">Route Stops ({route.stops.length})</Text>
              <YStack gap="$3">
                {route.stops.map((stop, idx) => (
                  <XStack key={`${stop.spotId}-${stop.order}-${idx}`} gap="$3" alignItems="flex-start">
                    <YStack alignItems="center" gap="$1">
                      <XStack
                        width={36}
                        height={36}
                        borderRadius="$full"
                        backgroundColor="$primary"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text variant="label" color="#FFFFFF" fontSize="$4">{stop.order || idx + 1}</Text>
                      </XStack>
                      {idx < route.stops.length - 1 && (
                        <YStack width={2} height={44} backgroundColor="$borderColor" />
                      )}
                    </YStack>
                    <YStack
                      flex={1}
                      backgroundColor="$backgroundStrong"
                      borderRadius="$3"
                      padding="$4"
                      gap="$1.5"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <Text variant="heading4">{stop.name}</Text>
                      {hasTitleOverride(stop) && (
                        <Text variant="caption" muted>
                          Original spot: {getBaseSpotName(stop)}
                        </Text>
                      )}
                      {stop.description && (
                        <Text variant="body" muted>{stop.description}</Text>
                      )}
                      {stop.photoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={stop.photoUrl}
                          alt={stop.name}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: '100%',
                            maxWidth: 720,
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 12,
                            marginTop: 10,
                            display: 'block',
                          }}
                        />
                      )}
                      <XStack justifyContent="flex-end" marginTop="$1">
                        <Button variant="outline" size="sm" onPress={() => router.push(buildSpotHref(stop.spotId, stop.name))}>
                          Open Spot Details
                        </Button>
                      </XStack>
                    </YStack>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          )}
        </YStack>

        {/* Right Sidebar */}
        <YStack gap="$4">
          {/* Rating Widget */}
          {!isOwner && (
            <YStack
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              padding="$4"
              gap="$3"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text variant="heading4">Rate This Route</Text>
              <StarRatingWidget
                routeId={route.id}
                onRated={(score) => {
                  // Optimistically blend the new score into averageRating
                  setDisplayRating((prev) =>
                    parseFloat(((prev + score) / 2).toFixed(1))
                  )
                }}
              />
            </YStack>
          )}

          {/* Rating Summary */}
          {displayRating > 0 && (
            <YStack
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              padding="$4"
              gap="$3"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text variant="heading4">Ratings</Text>
              <XStack alignItems="center" gap="$3">
                <Text fontFamily="$heading" fontSize="$11" weight="bold" color="$color">
                  {displayRating.toFixed(1)}
                </Text>
                <YStack gap="$1">
                  <RatingDisplay value={displayRating} showValue={false} />
                  <Text variant="caption" muted>AVERAGE SCORE</Text>
                </YStack>
              </XStack>
            </YStack>
          )}

          {/* Fork Route */}
          {!isOwner && (
            <YStack
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              padding="$4"
              gap="$3"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <XStack alignItems="center" gap="$2">
                <GitFork size={18} color="var(--color-primary)" />
                <Text variant="heading4">Customize This Route</Text>
              </XStack>
              <Text variant="body" muted>
                Want to make changes? Fork this route to create your own editable copy in your profile.
              </Text>
              {forkError && (
                <Text variant="caption" color="$error500">{forkError}</Text>
              )}
              <Button
                variant="outline"
                size="md"
                loading={isForking}
                disabled={isForking || hasForked}
                onPress={handleFork}
                icon={hasForked ? <CheckCircle size={16} color="currentColor" /> : <GitFork size={16} color="currentColor" />}
              >
                {hasForked ? 'Forked!' : 'Fork Route'}
              </Button>
            </YStack>
          )}
        </YStack>
      </div>

      {/* Save to Collection Modal */}
      <SaveToCollectionModal
        routeId={route.id}
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        onSaved={() => {
          setIsSaved(true)
          setSaveError(null)
        }}
      />

      {/* Active Tour Mode Overlay */}
      {isTourMode && route.stops.length > 0 && (
        <YStack
          position="fixed"
          top={0} left={0} right={0} bottom={0}
          backgroundColor="$background"
          zIndex={9999}
          display="flex"
          flexDirection="column"
        >
          {/* Header */}
          <XStack padding="$4" justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor="$borderColor" backgroundColor="$backgroundStrong">
            <YStack>
              <Text variant="label" color="$primary" weight="bold">Route Active</Text>
              <Text variant="heading4">{route.title}</Text>
            </YStack>
            <Button size="sm" variant="ghost" icon={<X size={20} />} onPress={() => setIsTourMode(false)}>Exit Tour</Button>
          </XStack>

          {/* Main Content */}
          <YStack flex={1} overflowY="auto" alignItems="center" padding="$6">
            <YStack width="100%" maxWidth={600} gap="$6">
              {/* Progress Indicator */}
              <XStack alignItems="center" justifyContent="space-between" width="100%">
                <Text variant="label" muted>
                  Stop {currentStop?.order || currentStopIndex + 1} of {route.stops.length}
                </Text>
              </XStack>

              {/* Current Stop Card */}
              <YStack backgroundColor="$backgroundStrong" borderRadius="$4" overflow="hidden" borderWidth={1} borderColor="$borderColor">
                {currentStop?.photoUrl && (
                  <img
                    src={currentStop.photoUrl}
                    alt={currentStop.name}
                    style={{ width: '100%', height: 260, objectFit: 'cover' }}
                  />
                )}
                <YStack padding="$5" gap="$3">
                  <Text variant="heading2">{currentStop?.name}</Text>
                  {currentStop && hasTitleOverride(currentStop) && (
                    <Text variant="caption" muted>
                      Original spot: {getBaseSpotName(currentStop)}
                    </Text>
                  )}
                  {currentStop?.description && (
                    <Text variant="body" lineHeight="$7">{currentStop.description}</Text>
                  )}
                </YStack>
              </YStack>

              {/* Actions */}
              <YStack gap="$3" marginTop="$2">
                <Button
                  size="lg"
                  variant="solid"
                  icon={<Navigation size={18} color="#FFFFFF" />}
                  onPress={() => {
                    if (!currentStop) return
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentStop.latitude},${currentStop.longitude}`, '_blank')
                  }}
                >
                  <Text color="#FFFFFF" weight="semibold">Navigate to Stop {currentStop?.order || currentStopIndex + 1} on Maps</Text>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  icon={<CheckCircle size={18} />}
                  onPress={() => {
                    if (currentStopIndex < route.stops.length - 1) {
                      setCurrentStopIndex(currentStopIndex + 1)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    } else {
                      alert('Congratulations! You completed the route!')
                      setIsTourMode(false)
                    }
                  }}
                >
                  <Text weight="semibold">
                    {currentStopIndex < route.stops.length - 1 ? 'Mark Arrived & Continue to Next' : 'Finish Route Checklist!'}
                  </Text>
                </Button>
              </YStack>
            </YStack>
          </YStack>
        </YStack>
      )}
    </YStack>
  )
}
