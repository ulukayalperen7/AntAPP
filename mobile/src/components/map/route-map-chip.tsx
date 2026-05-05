import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { getRouteById } from '@/features/routes/api'
import type { RouteDetail } from '@/features/api/types'

function decodePolyline(encoded: string): Array<[number, number]> {
  const points: Array<[number, number]> = []
  let index = 0; let lat = 0; let lng = 0
  while (index < encoded.length) {
    let result = 0; let shift = 0; let byte = 0
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5 } while (byte >= 0x20)
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    result = 0; shift = 0
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5 } while (byte >= 0x20)
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    points.push([lng / 1e5, lat / 1e5])
  }
  return points
}

function buildChipHTML(opts: {
  center: [number, number]
  polyline: Array<[number, number]>
  stops: Array<{ lng: number; lat: number }>
}): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css"/>
<script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#map{width:100%;height:100%;overflow:hidden}
.maplibregl-ctrl-bottom-left,.maplibregl-ctrl-bottom-right,
.maplibregl-ctrl-top-left,.maplibregl-ctrl-top-right{display:none}
</style>
</head>
<body>
<div id="map"></div>
<script>
var opts=${JSON.stringify(opts)};
var map=new maplibregl.Map({
  container:'map',
  style:'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center:opts.center,zoom:11,
  interactive:false,attributionControl:false
});
map.dragPan.disable();
map.scrollZoom.disable();
map.touchZoomRotate.disable();
map.doubleClickZoom.disable();
map.on('load',function(){
  var line=opts.polyline.length>1?opts.polyline:opts.stops.map(function(s){return[s.lng,s.lat];});
  if(line.length>0){
    map.addSource('r',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:line}}});
    map.addLayer({id:'rl',type:'line',source:'r',layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'#FF8C00','line-width':3}});
    if(line.length>1){
      var lons=line.map(function(c){return c[0];});
      var lats=line.map(function(c){return c[1];});
      map.fitBounds([[Math.min.apply(null,lons),Math.min.apply(null,lats)],[Math.max.apply(null,lons),Math.max.apply(null,lats)]],{padding:12,maxZoom:13,duration:0});
    }
  }
  opts.stops.forEach(function(s){
    var el=document.createElement('div');
    el.style.cssText='width:6px;height:6px;border-radius:50%;background:#FF8C00;border:1.5px solid white;';
    new maplibregl.Marker({element:el}).setLngLat([s.lng,s.lat]).addTo(map);
  });
});
</script>
</body>
</html>`
}

export function RouteMapChip({ routeId, onPress }: { routeId: string; onPress: () => void }) {
  const [detail, setDetail] = useState<RouteDetail | null>(null)

  useEffect(() => {
    getRouteById(routeId).then(setDetail).catch(() => {})
  }, [routeId])

  const html = useMemo(() => {
    if (!detail) return null

    const polyline = detail.encodedPolyline
      ? (() => { try { return decodePolyline(detail.encodedPolyline) } catch { return [] } })()
      : []

    const stops = detail.stops
      .filter(s => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
      .map(s => ({ lng: s.longitude, lat: s.latitude }))

    const hasCenter = Number.isFinite(detail.centerLatitude) && Number.isFinite(detail.centerLongitude)

    return buildChipHTML({
      center: hasCenter ? [detail.centerLongitude, detail.centerLatitude] : [30.7133, 36.8969],
      polyline,
      stops,
    })
  }, [detail])

  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.85}>
      {html ? (
        <WebView
          source={{ html }}
          style={styles.webview}
          scrollEnabled={false}
          javaScriptEnabled
          originWhitelist={['*']}
          pointerEvents="none"
        />
      ) : (
        <View style={styles.placeholder} />
      )}
      {/* Transparent touch absorber so map gestures don't bleed */}
      <View style={StyleSheet.absoluteFillObject} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 144,
    height: 92,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  webview: { flex: 1 },
  placeholder: { flex: 1, backgroundColor: '#f8fafc' },
})
