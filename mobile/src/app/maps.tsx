import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { WebView } from 'react-native-webview'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/features/api/client'
import { getSpots } from '@/features/spots/api'
import type { ApiResponse, SpotListItem } from '@/features/api/types'

const TURKEY_BOUNDS = { minLng: 25.0, minLat: 35.5, maxLng: 45.0, maxLat: 42.5 }
const FALLBACK_CENTER: [number, number] = [30.7133, 36.8969]
const QUERY_ZOOM = 8

type Tile = { x: number; y: number; zoom: number; count: number; centroidLat?: number; centroidLng?: number }
type SpotMarker = { id: string; name: string; lat: number; lng: number; rating: number }

function buildHeatmapHTML(tiles: Tile[], spots: SpotMarker[]): string {
  const config = JSON.stringify({
    bounds: TURKEY_BOUNDS,
    fallbackCenter: FALLBACK_CENTER,
    tiles,
    spots,
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
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var cfg = ${config};
    var map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/liberty',
      bounds: [[cfg.bounds.minLng, cfg.bounds.minLat], [cfg.bounds.maxLng, cfg.bounds.maxLat]],
      fitBoundsOptions: { padding: 24 },
      attributionControl: false
    });

    function tileCenterToLngLat(x, y, z) {
      var n = Math.pow(2, z);
      var lng = ((x + 0.5) / n) * 360 - 180;
      var latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 0.5)) / n)));
      return [lng, latRad * 180 / Math.PI];
    }

    function tileCoords(t) {
      if (typeof t.centroidLat === 'number' && typeof t.centroidLng === 'number') {
        return [t.centroidLng, t.centroidLat];
      }
      return tileCenterToLngLat(t.x, t.y, t.zoom);
    }

    map.on('load', function() {
      var tiles = cfg.tiles || [];

      if (tiles.length === 0) {
        map.jumpTo({ center: cfg.fallbackCenter, zoom: 6 });
      } else if (tiles.length === 1) {
        map.jumpTo({ center: tileCoords(tiles[0]), zoom: 8 });
      } else {
        var minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
        tiles.forEach(function(t) {
          var c = tileCoords(t);
          if (c[0] < minLng) minLng = c[0];
          if (c[0] > maxLng) maxLng = c[0];
          if (c[1] < minLat) minLat = c[1];
          if (c[1] > maxLat) maxLat = c[1];
        });
        map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, maxZoom: 8, animate: false });
      }

      var features = tiles.map(function(t) {
        return {
          type: 'Feature',
          properties: { count: t.count },
          geometry: { type: 'Point', coordinates: tileCoords(t) }
        };
      });

      map.addSource('heat', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: features }
      });
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
            1, 'rgba(255,0,0,1)'
          ]
        }
      });

      var spotFeatures = (cfg.spots || []).map(function(s) {
        return {
          type: 'Feature',
          properties: { id: s.id, name: s.name, rating: s.rating },
          geometry: { type: 'Point', coordinates: [s.lng, s.lat] }
        };
      });

      map.addSource('spots', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: spotFeatures }
      });

      map.addLayer({
        id: 'spots-layer',
        type: 'circle',
        source: 'spots',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3, 10, 6, 14, 10],
          'circle-color': '#FF8C00',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
          'circle-opacity': 0.95
        }
      });

      map.on('click', 'spots-layer', function(e) {
        var f = e.features && e.features[0];
        if (!f) return;
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'spot', id: f.properties.id }));
        }
      });
      map.on('mouseenter', 'spots-layer', function() { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'spots-layer', function() { map.getCanvas().style.cursor = ''; });
    });
  </script>
</body>
</html>`
}

export default function MapsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [tiles, setTiles] = useState<Tile[] | null>(null)
  const [spots, setSpots] = useState<SpotMarker[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setError(null)
    try {
      const b = TURKEY_BOUNDS
      const tilesPath = `/heatmap/tiles?minLat=${b.minLat}&minLng=${b.minLng}&maxLat=${b.maxLat}&maxLng=${b.maxLng}&zoom=${QUERY_ZOOM}`
      const [tilesRes, spotsRes] = await Promise.all([
        apiFetch<ApiResponse<Tile[]>>(tilesPath),
        getSpots({ pageSize: 200 }),
      ])
      setTiles(tilesRes.data ?? [])
      setSpots(
        (spotsRes.data ?? []).map((s: SpotListItem) => ({
          id: s.id,
          name: s.name,
          lat: s.latitude,
          lng: s.longitude,
          rating: s.averageRating,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load map.')
      setTiles([])
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const html = useMemo(() => (tiles === null ? null : buildHeatmapHTML(tiles, spots)), [tiles, spots])

  const onMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data)
        if (msg.type === 'spot' && msg.id) {
          router.push(`/spots/${msg.id}` as Parameters<typeof router.push>[0])
        }
      } catch {}
    },
    [router]
  )

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack
        paddingHorizontal="$4"
        paddingTop={insets.top + 12}
        paddingBottom="$3"
        gap="$2"
        backgroundColor="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <XStack alignItems="center" justifyContent="space-between" gap="$3">
          <YStack flex={1}>
            <Text variant="heading2">Live activity</Text>
            <Text variant="caption" muted>
              {tiles === null
                ? 'Loading…'
                : error
                  ? error
                  : tiles.length === 0
                    ? 'No active pings right now'
                    : `${tiles.length} active areas`}
            </Text>
          </YStack>
          <Button
            variant="outline"
            size="sm"
            onPress={() => {
              setTiles(null)
              loadAll()
            }}
            icon={<Feather name="refresh-cw" size={14} color="var(--color-foreground)" />}
          >
            Refresh
          </Button>
        </XStack>
      </YStack>

      <YStack flex={1} paddingBottom={80}>
        {html ? (
          <WebView
            key={`${tiles?.length}-${spots.length}`}
            source={{ html }}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            onMessage={onMessage}
          />
        ) : null}
      </YStack>
    </YStack>
  )
}
