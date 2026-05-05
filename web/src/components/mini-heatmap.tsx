'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

const MIN_LAT = 35.5
const MIN_LNG = 25.0
const MAX_LAT = 42.5
const MAX_LNG = 45.0
const ZOOM = 6
const FALLBACK_CENTER: [number, number] = [30.7133, 36.8969]
const FALLBACK_ZOOM = 9

type Tile = { x: number; y: number; zoom: number; count: number }

function tileCenterToLngLat(x: number, y: number, z: number): [number, number] {
  const n = Math.pow(2, z)
  const lng = ((x + 0.5) / n) * 360 - 180
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 0.5)) / n)))
  const lat = (latRad * 180) / Math.PI
  return [lng, lat]
}

export function MiniHeatmap() {
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

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
      bounds: [[MIN_LNG, MIN_LAT], [MAX_LNG, MAX_LAT]],
      fitBoundsOptions: { padding: 4 },
      attributionControl: false,
      interactive: false,
    })

    let cancelled = false

    map.on('load', async () => {
      try {
        const url = `${API_URL}/heatmap/tiles?minLat=${MIN_LAT}&minLng=${MIN_LNG}&maxLat=${MAX_LAT}&maxLng=${MAX_LNG}&zoom=${ZOOM}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok || cancelled) return
        const wrapped = await res.json()
        const tiles: Tile[] = wrapped?.data ?? []

        if (cancelled || !map.getStyle()) return

        if (tiles.length > 0) {
          const hottest = tiles.reduce((a, b) => (b.count > a.count ? b : a))
          const [lng, lat] = tileCenterToLngLat(hottest.x, hottest.y, hottest.zoom)
          map.jumpTo({ center: [lng, lat], zoom: FALLBACK_ZOOM })
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
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'count'], 0, 0, 5, 1],
            'heatmap-intensity': 2.5,
            'heatmap-radius': 50,
            'heatmap-opacity': 0.85,
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
    }
  }, [])

  return (
    <div
      onClick={() => router.push('/heatmap')}
      style={{ width: '100%', height: 180, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
    >
      <div ref={ref} style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          background: 'rgba(0,0,0,0.65)',
          color: '#fff',
          fontSize: 11,
          padding: '4px 8px',
          borderRadius: 6,
          pointerEvents: 'none',
        }}
      >
        Tap to expand
      </div>
    </div>
  )
}
