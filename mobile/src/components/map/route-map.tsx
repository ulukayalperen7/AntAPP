import React, { useMemo } from 'react'
import MapLibreGL from '@maplibre/maplibre-react-native'
import { StyleSheet } from 'react-native'
import type { RouteDetail } from '@/features/api/types'

MapLibreGL.setAccessToken(null)

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'
const LINE_COLOR = '#FF8C00'

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

function getBounds(coords: Array<[number, number]>): {
  ne: [number, number]
  sw: [number, number]
} | null {
  if (coords.length < 2) return null
  let minLon = coords[0][0], minLat = coords[0][1]
  let maxLon = coords[0][0], maxLat = coords[0][1]
  for (const [lon, lat] of coords) {
    if (lon < minLon) minLon = lon
    if (lat < minLat) minLat = lat
    if (lon > maxLon) maxLon = lon
    if (lat > maxLat) maxLat = lat
  }
  return { ne: [maxLon, maxLat], sw: [minLon, minLat] }
}

export function RouteMap({ route }: { route: RouteDetail }) {
  const polylineCoords = useMemo(() => {
    if (!route.encodedPolyline) return []
    try { return decodePolyline(route.encodedPolyline) } catch { return [] }
  }, [route.encodedPolyline])

  const stopCoords = useMemo(
    () =>
      route.stops
        .filter((s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
        .map((s) => [s.longitude, s.latitude] as [number, number]),
    [route.stops]
  )

  const fitCoords = polylineCoords.length > 1 ? polylineCoords : stopCoords
  const bounds = getBounds(fitCoords)

  const hasCenter =
    Number.isFinite(route.centerLatitude) && Number.isFinite(route.centerLongitude)

  const routeLineGeoJSON: GeoJSON.Feature<GeoJSON.LineString> | null =
    polylineCoords.length > 1
      ? { type: 'Feature', geometry: { type: 'LineString', coordinates: polylineCoords }, properties: {} }
      : null

  const stopsGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features: stopCoords.map((coordinates, index) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates },
      properties: { order: index + 1 },
    })),
  }

  return (
    <MapLibreGL.MapView
      style={styles.map}
      mapStyle={STYLE_URL}
      attributionEnabled={false}
      logoEnabled={false}
    >
      {bounds ? (
        <MapLibreGL.Camera
          bounds={{ ne: bounds.ne, sw: bounds.sw, paddingLeft: 40, paddingRight: 40, paddingTop: 40, paddingBottom: 40 }}
          animationMode="moveTo"
          animationDuration={0}
        />
      ) : (
        <MapLibreGL.Camera
          centerCoordinate={hasCenter ? [route.centerLongitude, route.centerLatitude] : [30.7133, 36.8969]}
          zoomLevel={hasCenter ? 11 : 10}
          animationMode="moveTo"
          animationDuration={0}
        />
      )}

      {routeLineGeoJSON ? (
        <MapLibreGL.ShapeSource id="route-line" shape={routeLineGeoJSON}>
          <MapLibreGL.LineLayer
            id="route-line-layer"
            style={{ lineColor: LINE_COLOR, lineWidth: 4, lineCap: 'round', lineJoin: 'round', lineDasharray: [1.5, 1.5] }}
          />
        </MapLibreGL.ShapeSource>
      ) : null}

      {stopCoords.length > 0 ? (
        <MapLibreGL.ShapeSource id="route-stops" shape={stopsGeoJSON}>
          <MapLibreGL.CircleLayer
            id="route-stops-circle"
            style={{ circleColor: LINE_COLOR, circleRadius: 8, circleStrokeColor: '#FFFFFF', circleStrokeWidth: 2 }}
          />
          <MapLibreGL.SymbolLayer
            id="route-stops-label"
            minZoomLevel={11}
            style={{ textField: ['to-string', ['get', 'order']], textSize: 11, textColor: '#FFFFFF', textAllowOverlap: false }}
          />
        </MapLibreGL.ShapeSource>
      ) : null}
    </MapLibreGL.MapView>
  )
}

const styles = StyleSheet.create({
  map: { flex: 1 },
})
