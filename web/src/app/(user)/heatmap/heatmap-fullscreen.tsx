'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { getSpots } from '@/features/spots/actions'
import type { SpotListItem } from '@/types/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

const TURKEY_BOUNDS: [[number, number], [number, number]] = [[25.0, 35.5], [45.0, 42.5]]
const FALLBACK_CENTER: [number, number] = [30.7133, 36.8969]
const FALLBACK_ZOOM = 6

type Tile = { x: number; y: number; zoom: number; count: number; centroidLat?: number; centroidLng?: number }

function tileCenterToLngLat(x: number, y: number, z: number): [number, number] {
  const n = Math.pow(2, z)
  const lng = ((x + 0.5) / n) * 360 - 180
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 0.5)) / n)))
  const lat = (latRad * 180) / Math.PI
  return [lng, lat]
}

function tileCoords(t: Tile): [number, number] {
  if (typeof t.centroidLat === 'number' && typeof t.centroidLng === 'number') {
    return [t.centroidLng, t.centroidLat]
  }
  return tileCenterToLngLat(t.x, t.y, t.zoom)
}

export function HeatmapFullscreen() {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const router = useRouter()
  const [tileCount, setTileCount] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!ref.current) return

    const map = new maplibregl.Map({
      container: ref.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      bounds: TURKEY_BOUNDS,
      fitBoundsOptions: { padding: 20 },
      attributionControl: { compact: true },
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    mapRef.current = map

    let cancelled = false

    map.on('load', async () => {
      try {
        const bounds = map.getBounds()
        const url = `${API_URL}/heatmap/tiles?minLat=${bounds.getSouth()}&minLng=${bounds.getWest()}&maxLat=${bounds.getNorth()}&maxLng=${bounds.getEast()}&zoom=8`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok || cancelled) return
        const wrapped = await res.json()
        const tiles: Tile[] = wrapped?.data ?? []
        setTileCount(tiles.length)

        if (cancelled || !map.getStyle()) return

        if (tiles.length === 0) {
          map.jumpTo({ center: FALLBACK_CENTER, zoom: FALLBACK_ZOOM })
        } else if (tiles.length === 1) {
          const [lng, lat] = tileCoords(tiles[0])
          map.jumpTo({ center: [lng, lat], zoom: 8 })
        } else {
          let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
          for (const t of tiles) {
            const [lng, lat] = tileCoords(t)
            if (lng < minLng) minLng = lng
            if (lng > maxLng) maxLng = lng
            if (lat < minLat) minLat = lat
            if (lat > maxLat) maxLat = lat
          }
          map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 80, maxZoom: 8, animate: false })
        }

        const features = tiles.map((t) => {
          const [lng, lat] = tileCoords(t)
          return {
            type: 'Feature' as const,
            properties: { count: t.count },
            geometry: { type: 'Point' as const, coordinates: [lng, lat] },
          }
        })

        map.addSource('heat', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features },
        })
        map.addLayer({
          id: 'heat-layer',
          type: 'heatmap',
          source: 'heat',
          paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'count'], 0, 0, 10, 1],
            'heatmap-intensity': 2,
            'heatmap-radius': 40,
            'heatmap-opacity': 0.8,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,255,0)',
              0.2, 'rgba(0,150,255,0.6)',
              0.4, 'rgba(0,255,150,0.7)',
              0.6, 'rgba(255,255,0,0.8)',
              0.8, 'rgba(255,150,0,0.9)',
              1, 'rgba(255,0,0,1)',
            ],
          },
        })

        try {
          const spotsPaged = await getSpots({ pageSize: 200 })
          if (cancelled || !map.getStyle()) return

          const spotFeatures = (spotsPaged.data ?? [])
            .filter((s: SpotListItem) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
            .map((s: SpotListItem) => ({
              type: 'Feature' as const,
              properties: { id: s.id, name: s.name, rating: s.averageRating },
              geometry: { type: 'Point' as const, coordinates: [s.longitude, s.latitude] },
            }))

          map.addSource('spots', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: spotFeatures },
          })

          map.addLayer({
            id: 'spots-layer',
            type: 'circle',
            source: 'spots',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3, 10, 6, 14, 10],
              'circle-color': '#FF8C00',
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': 2,
              'circle-opacity': 0.95,
            },
          })

          map.on('click', 'spots-layer', (e) => {
            const f = e.features?.[0]
            if (!f) return
            const id = f.properties?.id
            if (typeof id === 'string') router.push(`/spots/${id}`)
          })
          map.on('mouseenter', 'spots-layer', () => { map.getCanvas().style.cursor = 'pointer' })
          map.on('mouseleave', 'spots-layer', () => { map.getCanvas().style.cursor = '' })
        } catch {
          /* swallow */
        }
      } catch {
        /* swallow */
      }
    })

    return () => {
      cancelled = true
      map.remove()
      mapRef.current = null
    }
  }, [refreshKey])

  return (
    <YStack flex={1} gap="$3">
      <XStack alignItems="center" gap="$3">
        <Button variant="ghost" size="sm" onPress={() => router.back()} icon={<ArrowLeft size={16} color="currentColor" />}>
          Back
        </Button>
        <YStack flex={1}>
          <Text variant="heading2">Live activity</Text>
          <Text variant="body" muted>
            {tileCount === null ? 'Loading…' : tileCount === 0 ? 'No active pings right now' : `${tileCount} active areas`}
          </Text>
        </YStack>
        <Button variant="outline" size="sm" onPress={() => setRefreshKey((k) => k + 1)} icon={<RefreshCw size={14} color="currentColor" />}>
          Refresh
        </Button>
      </XStack>

      <div
        ref={ref}
        style={{
          width: '100%',
          height: 'calc(100vh - 180px)',
          minHeight: 480,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--color-borderColor)',
        }}
      />
    </YStack>
  )
}
