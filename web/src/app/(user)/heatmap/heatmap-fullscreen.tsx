'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import { ArrowLeft, RefreshCw } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

const TURKEY_BOUNDS: [[number, number], [number, number]] = [[25.0, 35.5], [45.0, 42.5]]
const FALLBACK_CENTER: [number, number] = [30.7133, 36.8969]
const FALLBACK_ZOOM = 6

type Tile = { x: number; y: number; zoom: number; count: number }

function tileCenterToLngLat(x: number, y: number, z: number): [number, number] {
  const n = Math.pow(2, z)
  const lng = ((x + 0.5) / n) * 360 - 180
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 0.5)) / n)))
  const lat = (latRad * 180) / Math.PI
  return [lng, lat]
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

        if (tiles.length > 0) {
          const hottest = tiles.reduce((a, b) => (b.count > a.count ? b : a))
          const [lng, lat] = tileCenterToLngLat(hottest.x, hottest.y, hottest.zoom)
          map.jumpTo({ center: [lng, lat], zoom: 9 })
        } else {
          map.jumpTo({ center: FALLBACK_CENTER, zoom: FALLBACK_ZOOM })
        }

        const features = tiles.map((t) => {
          const [lng, lat] = tileCenterToLngLat(t.x, t.y, t.zoom)
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
