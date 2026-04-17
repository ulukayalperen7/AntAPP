import React, { useMemo } from 'react'
import { WebView } from 'react-native-webview'
import type { RouteDetail } from '@/features/api/types'

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
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1

    result = 0
    shift = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1

    points.push([lng / 1e5, lat / 1e5])
  }

  return points
}

function buildMapHTML(options: {
  center: [number, number]
  zoom: number
  polyline: Array<[number, number]>
  stops: Array<{ lng: number; lat: number; order: number }>
}): string {
  const data = JSON.stringify(options)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .maplibregl-ctrl-bottom-left,
    .maplibregl-ctrl-bottom-right,
    .maplibregl-ctrl-top-left { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var options = ${data};
    var map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: options.center,
      zoom: options.zoom,
      attributionControl: false
    });

    map.on('load', function() {
      if (options.polyline.length > 1) {
        map.addSource('route-line', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: options.polyline }, properties: {} }
        });
        map.addLayer({
          id: 'route-line-layer',
          type: 'line',
          source: 'route-line',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#FF8C00', 'line-width': 4, 'line-dasharray': [1.5, 1.5] }
        });
      }

      if (options.stops.length > 0) {
        map.addSource('route-stops', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: options.stops.map(function(s) {
              return { type: 'Feature', geometry: { type: 'Point', coordinates: [s.lng, s.lat] }, properties: { order: s.order } };
            })
          }
        });
        map.addLayer({
          id: 'route-stops-circle',
          type: 'circle',
          source: 'route-stops',
          paint: { 'circle-radius': 8, 'circle-color': '#FF8C00', 'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 2 }
        });
        map.addLayer({
          id: 'route-stops-label',
          type: 'symbol',
          source: 'route-stops',
          minzoom: 11,
          layout: { 'text-field': ['to-string', ['get', 'order']], 'text-size': 11, 'text-font': ['Open Sans Semibold'], 'text-allow-overlap': false },
          paint: { 'text-color': '#FFFFFF' }
        });
      }

      var fitCoords = options.polyline.length > 1 ? options.polyline : options.stops.map(function(s) { return [s.lng, s.lat]; });
      if (fitCoords.length > 1) {
        var lons = fitCoords.map(function(c) { return c[0]; });
        var lats = fitCoords.map(function(c) { return c[1]; });
        map.fitBounds(
          [[Math.min.apply(null, lons), Math.min.apply(null, lats)], [Math.max.apply(null, lons), Math.max.apply(null, lats)]],
          { padding: 40, maxZoom: 14, duration: 0 }
        );
      }
    });
  </script>
</body>
</html>`
}

export function RouteMap({ route }: { route: RouteDetail }) {
  const html = useMemo(() => {
    const polyline = route.encodedPolyline
      ? (() => { try { return decodePolyline(route.encodedPolyline) } catch { return [] } })()
      : []

    const stops = route.stops
      .filter((s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
      .map((s, i) => ({ lng: s.longitude, lat: s.latitude, order: i + 1 }))

    const hasCenter =
      Number.isFinite(route.centerLatitude) && Number.isFinite(route.centerLongitude)

    return buildMapHTML({
      center: hasCenter ? [route.centerLongitude, route.centerLatitude] : [30.7133, 36.8969],
      zoom: hasCenter ? 11 : 10,
      polyline,
      stops,
    })
  }, [route])

  return (
    <WebView
      source={{ html }}
      style={{ flex: 1 }}
      scrollEnabled={false}
      javaScriptEnabled
      originWhitelist={['*']}
    />
  )
}
