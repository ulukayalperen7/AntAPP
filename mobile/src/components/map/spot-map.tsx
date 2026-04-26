import React, { useMemo } from 'react'
import { WebView } from 'react-native-webview'
import type { SpotDetail } from '@/features/api/types'

function buildSpotMapHTML(spot: SpotDetail): string {
  const data = JSON.stringify({
    center: [spot.longitude, spot.latitude],
    name: spot.name,
    description: spot.description,
  })

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
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .maplibregl-ctrl-bottom-left,
    .maplibregl-ctrl-bottom-right,
    .maplibregl-ctrl-top-left { display: none; }
    .marker {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: #FF8C00;
      border: 3px solid #FFFFFF;
      box-shadow: 0 12px 30px rgba(15,23,42,0.28);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var spot = ${data};
    var map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: spot.center,
      zoom: 15,
      attributionControl: false
    });

    map.on('load', function() {
      var markerElement = document.createElement('div');
      markerElement.className = 'marker';
      new maplibregl.Marker({ element: markerElement })
        .setLngLat(spot.center)
        .addTo(map);
    });
  </script>
</body>
</html>`
}

export function SpotMap({ spot }: { spot: SpotDetail }) {
  const html = useMemo(() => buildSpotMapHTML(spot), [spot])

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
