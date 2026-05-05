'use client'

import { useEffect, useRef, useState } from 'react'
import { getRouteById } from '@/features/routes/actions'
import { loadMapLibre } from '@/lib/maplibre'
import type { RouteDetail } from '@/types/api'
import type { Map as MapLibreMap } from 'maplibre-gl'

function decodePolyline(encoded: string): [number, number][] {
  if (!encoded) return []
  const poly: [number, number][] = []
  let index = 0
  const len = encoded.length
  let lat = 0
  let lng = 0
  while (index < len) {
    let b; let shift = 0; let result = 0
    do { result |= ((b = encoded.charCodeAt(index++) - 63) & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lat += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
    shift = 0; result = 0
    do { result |= ((b = encoded.charCodeAt(index++) - 63) & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lng += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
    poly.push([lng / 1e5, lat / 1e5])
  }
  return poly
}

export function RouteMapPreview({ routeId, onClick }: { routeId: string; onClick: () => void }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [detail, setDetail] = useState<RouteDetail | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getRouteById(routeId)
      .then(setDetail)
      .catch(() => setError(true))
  }, [routeId])

  useEffect(() => {
    if (!mapContainer.current || !detail) return

    let mapInstance: MapLibreMap | null = null

    loadMapLibre().then(({ default: maplibregl }) => {
      if (!mapContainer.current) return

      mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [detail.centerLongitude || 30.7, detail.centerLatitude || 36.9],
        zoom: 11,
        interactive: false,
        attributionControl: false,
      })

      mapInstance.on('load', () => {
        if (!mapInstance) return

        const coords = decodePolyline(detail.encodedPolyline || '')
        const fallback = detail.stops.map(s => [s.longitude, s.latitude] as [number, number])
        const line = coords.length > 0 ? coords : fallback

        if (line.length > 0) {
          const bounds = new maplibregl.LngLatBounds()
          line.forEach(c => bounds.extend(c))

          mapInstance.addSource('r', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: line } },
          })
          mapInstance.addLayer({
            id: 'rl',
            type: 'line',
            source: 'r',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#FF8C00', 'line-width': 3 },
          })
          mapInstance.fitBounds(bounds, { padding: 14, maxZoom: 13, duration: 0 })
        }

        detail.stops.forEach(stop => {
          const el = document.createElement('div')
          el.style.cssText = 'width:7px;height:7px;border-radius:50%;background:#FF8C00;border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)'
          new maplibregl.Marker({ element: el })
            .setLngLat([stop.longitude, stop.latitude])
            .addTo(mapInstance!)
        })
      })
    })

    return () => {
      mapInstance?.remove()
    }
  }, [detail])

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 144,
        height: 92,
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '2px solid rgba(255,255,255,0.85)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      }}
    >
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {!detail && !error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          fontSize: 11,
          color: '#94a3b8',
          fontFamily: 'sans-serif',
        }}>
          Loading map...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f5f9',
          fontSize: 11,
          color: '#94a3b8',
          fontFamily: 'sans-serif',
        }}>
          Route map
        </div>
      )}
    </div>
  )
}
