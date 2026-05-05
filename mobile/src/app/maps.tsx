import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
const STORAGE_ZOOM = 14

type Tile = { x: number; y: number; zoom: number; count: number; centroidLat?: number; centroidLng?: number }
type SpotMarker = { id: string; name: string; lat: number; lng: number; rating: number }
type ViewportMessage = { type: 'viewport'; minLat: number; minLng: number; maxLat: number; maxLng: number; zoom: number; reqId: number }
type SpotClickMessage = { type: 'spot'; id: string }
type WebMessage = ViewportMessage | SpotClickMessage

function pickQueryZoom(mapZoom: number): number {
  return Math.max(4, Math.min(STORAGE_ZOOM, Math.round(mapZoom + 1)))
}

function buildHeatmapHTML(spots: SpotMarker[]): string {
  const config = JSON.stringify({
    bounds: TURKEY_BOUNDS,
    fallbackCenter: FALLBACK_CENTER,
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

    var nav = new maplibregl.NavigationControl({ showCompass: false });
    map.addControl(nav, 'top-right');

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

    function buildFeatureCollection(tiles) {
      return {
        type: 'FeatureCollection',
        features: tiles.map(function(t) {
          return {
            type: 'Feature',
            properties: { count: t.count },
            geometry: { type: 'Point', coordinates: tileCoords(t) }
          };
        })
      };
    }

    function ensureHeatLayer() {
      if (map.getSource('heat')) return;
      map.addSource('heat', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
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
    }

    function ensureSpotsLayer() {
      var spots = cfg.spots || [];
      if (map.getSource('spots')) return;
      var spotFeatures = spots.map(function(s) {
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
    }

    var reqCounter = 0;
    function notifyViewport() {
      var b = map.getBounds();
      reqCounter++;
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'viewport',
          minLat: b.getSouth(),
          minLng: b.getWest(),
          maxLat: b.getNorth(),
          maxLng: b.getEast(),
          zoom: map.getZoom(),
          reqId: reqCounter
        }));
      }
    }

    map.on('load', function() {
      ensureHeatLayer();
      ensureSpotsLayer();
      notifyViewport();
    });

    var moveTimer = null;
    map.on('moveend', function() {
      if (moveTimer) clearTimeout(moveTimer);
      moveTimer = setTimeout(notifyViewport, 250);
    });

    // Receives tile updates from native side.
    window.applyTiles = function(tiles, opts) {
      ensureHeatLayer();
      var src = map.getSource('heat');
      if (src) src.setData(buildFeatureCollection(tiles || []));

      if (opts && opts.fit) {
        if (!tiles || tiles.length === 0) {
          map.jumpTo({ center: cfg.fallbackCenter, zoom: 6 });
        } else if (tiles.length === 1) {
          map.jumpTo({ center: tileCoords(tiles[0]), zoom: 11 });
        } else {
          var minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
          tiles.forEach(function(t) {
            var c = tileCoords(t);
            if (c[0] < minLng) minLng = c[0];
            if (c[0] > maxLng) maxLng = c[0];
            if (c[1] < minLat) minLat = c[1];
            if (c[1] > maxLat) maxLat = c[1];
          });
          map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, maxZoom: 11, animate: false });
        }
      }
    };
  </script>
</body>
</html>`
}

export default function MapsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const webRef = useRef<WebView>(null)

  const [spots, setSpots] = useState<SpotMarker[]>([])
  const [spotsReady, setSpotsReady] = useState(false)
  const [tileCount, setTileCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const initialFitDoneRef = useRef(false)
  const lastReqRef = useRef(0)

  useEffect(() => {
    let active = true
    getSpots({ pageSize: 200 })
      .then((paged) => {
        if (!active) return
        setSpots(
          (paged.data ?? []).map((s: SpotListItem) => ({
            id: s.id,
            name: s.name,
            lat: s.latitude,
            lng: s.longitude,
            rating: s.averageRating,
          }))
        )
      })
      .catch(() => {
        if (active) setSpots([])
      })
      .finally(() => {
        if (active) setSpotsReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  const html = useMemo(() => (spotsReady ? buildHeatmapHTML(spots) : null), [spotsReady, spots])

  const fetchTilesForViewport = useCallback(async (msg: ViewportMessage) => {
    const queryZoom = pickQueryZoom(msg.zoom)
    const path = `/heatmap/tiles?minLat=${msg.minLat}&minLng=${msg.minLng}&maxLat=${msg.maxLat}&maxLng=${msg.maxLng}&zoom=${queryZoom}`
    try {
      const wrapped = await apiFetch<ApiResponse<Tile[]>>(path)
      // Stale request guard.
      if (msg.reqId < lastReqRef.current) return
      lastReqRef.current = msg.reqId
      const tiles = wrapped.data ?? []
      setTileCount(tiles.length)
      setError(null)

      const fit = !initialFitDoneRef.current
      initialFitDoneRef.current = true
      const payload = JSON.stringify({ tiles, opts: { fit } })
      webRef.current?.injectJavaScript(`window.applyTiles && window.applyTiles(${JSON.stringify(tiles)}, { fit: ${fit} }); true;`)
      // Re-fetch once after autofit, since fit changes the viewport.
      if (fit) {
        // Trigger viewport notify by no-op; the moveend listener inside the webview will re-emit after fitBounds.
        void payload
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load heatmap.')
      setTileCount(0)
    }
  }, [])

  const onMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data) as WebMessage
        if (msg.type === 'viewport') {
          fetchTilesForViewport(msg)
        } else if (msg.type === 'spot' && msg.id) {
          router.push(`/spots/${msg.id}` as Parameters<typeof router.push>[0])
        }
      } catch {}
    },
    [fetchTilesForViewport, router]
  )

  const handleRefresh = () => {
    initialFitDoneRef.current = false
    setTileCount(null)
    setError(null)
    // Re-trigger by reloading WebView state.
    webRef.current?.injectJavaScript(`
      (function () {
        var b = map.getBounds();
        reqCounter++;
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'viewport',
            minLat: b.getSouth(), minLng: b.getWest(),
            maxLat: b.getNorth(), maxLng: b.getEast(),
            zoom: map.getZoom(), reqId: reqCounter
          }));
        }
      })();
      true;
    `)
  }

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
              {tileCount === null
                ? 'Loading…'
                : error
                  ? error
                  : tileCount === 0
                    ? 'No active pings right now'
                    : `${tileCount} active areas`}
            </Text>
          </YStack>
          <Button
            variant="outline"
            size="sm"
            onPress={handleRefresh}
            icon={<Feather name="refresh-cw" size={14} color="var(--color-foreground)" />}
          >
            Refresh
          </Button>
        </XStack>
      </YStack>

      <YStack flex={1} paddingBottom={80}>
        {html ? (
          <WebView
            ref={webRef}
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
