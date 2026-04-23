'use client'

import { useEffect, useRef, useState } from 'react'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getRouteDetail, RouteDetailViewModel } from '@/features/admin/routes-actions'

function decodePolyline(encoded: string): [number, number][] {
    if (!encoded) return [];
    const poly: [number, number][] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do { result |= ((b = encoded.charCodeAt(index++) - 63) & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0; result = 0;
        do { result |= ((b = encoded.charCodeAt(index++) - 63) & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        poly.push([lng / 1e5, lat / 1e5]);
    }
    return poly;
}

export function RouteMapModal({ routeId, onClose }: { routeId: string, onClose: () => void }) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const [detail, setDetail] = useState<RouteDetailViewModel | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getRouteDetail(routeId).then(data => {
            setDetail(data)
            setLoading(false)
        })
    }, [routeId])

    useEffect(() => {
        if (!mapContainer.current || !detail) return

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: [detail.centerLongitude || 30.7, detail.centerLatitude || 36.9],
            zoom: 12
        })

        map.on('load', () => {
            const coordinates = decodePolyline(detail.encodedPolyline || '')

            // Determine Bounds
            const bounds = new maplibregl.LngLatBounds();
            let hasBounds = false;

            if (coordinates.length > 0) {
                for (const coord of coordinates) {
                    bounds.extend(coord as [number, number]);
                }
                hasBounds = true;

                // Add Polyline Layer
                map.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: coordinates
                        }
                    }
                })
                map.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#0ea5e9', 'line-width': 4 }
                })
            } else if (detail.stops.length > 1) {
                // No polyline: Fallback to drawing a dashed straight line connecting the stops and bounds from stops
                const stopCoords = detail.stops.map(s => [s.longitude, s.latitude]);
                for (const coord of stopCoords) {
                    bounds.extend(coord as [number, number]);
                }
                hasBounds = true;

                map.addSource('route-fallback', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: stopCoords
                        }
                    }
                })
                map.addLayer({
                    id: 'route-line-fallback',
                    type: 'line',
                    source: 'route-fallback',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#94a3b8', 'line-width': 3, 'line-dasharray': [2, 2] }
                })
            } else if (detail.stops.length === 1) {
                bounds.extend([detail.stops[0].longitude, detail.stops[0].latitude]);
                hasBounds = true;
            }

            if (hasBounds) {
                map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
            }

            // Render Stops as Markers with constant names
            detail.stops.forEach((stop, index) => {
                const container = document.createElement('div')
                container.style.display = 'flex'
                container.style.flexDirection = 'column'
                container.style.alignItems = 'center'
                container.style.cursor = 'pointer'

                const el = document.createElement('div')
                el.style.width = '24px'
                el.style.height = '24px'
                el.style.borderRadius = '50%'
                el.style.backgroundColor = '#f59e0b'
                el.style.border = '2px solid white'
                el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
                el.style.color = 'white'
                el.style.display = 'flex'
                el.style.alignItems = 'center'
                el.style.justifyContent = 'center'
                el.style.fontWeight = 'bold'
                el.style.fontSize = '12px'
                el.innerText = `${stop.order}`

                const label = document.createElement('div')
                label.innerText = stop.name
                label.style.marginTop = '4px'
                label.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
                label.style.padding = '2px 6px'
                label.style.borderRadius = '4px'
                label.style.fontSize = '11px'
                label.style.fontWeight = '600'
                label.style.color = '#1e293b'
                label.style.whiteSpace = 'nowrap'
                label.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)'

                container.appendChild(el)
                container.appendChild(label)

                new maplibregl.Marker({ element: container, anchor: 'top' })
                    .setLngLat([stop.longitude, stop.latitude])
                    .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
                        <div style="padding: 4px; max-width: 200px;">
                            <strong>${stop.name}</strong>
                            ${stop.photoUrl ? `<br/><img src="${stop.photoUrl}" style="width:100%; height:120px; object-fit:cover; margin-top:8px; border-radius:4px;"/>` : ''}
                            ${stop.description ? `<p style="margin-top:8px; font-size:12px; color:#475569;">${stop.description}</p>` : ''}
                        </div>
                    `))
                    .addTo(map)
            })
        })

        return () => {
            map.remove()
        }
    }, [detail])

    return (
        <YStack
            position="fixed"
            top={0} left={0} right={0} bottom={0}
            backgroundColor="rgba(0,0,0,0.7)"
            zIndex={100}
            justifyContent="center"
            alignItems="center"
            padding="$4"
        >
            <YStack
                backgroundColor="$background"
                width="100%"
                maxWidth={1000}
                height="85%"
                borderRadius="$4"
                overflow="hidden"
                display="flex"
                flexDirection="column"
            >
                <XStack padding="$4" justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderBottomColor="$borderColor">
                    <Text variant="heading4">{loading ? 'Loading Map Data...' : `Inspecting: ${detail?.title}`}</Text>
                    <Button size="sm" variant="ghost" onPress={onClose}>Close</Button>
                </XStack>
                {loading ? (
                    <YStack flex={1} justifyContent="center" alignItems="center">
                        <Text variant="body" muted>Fetching route coordinates...</Text>
                    </YStack>
                ) : (
                    <YStack flex={1} style={{ position: 'relative' }}>
                        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

                        <YStack position="absolute" bottom={16} left={16} backgroundColor="$backgroundStrong" padding="$4" borderRadius="$3" borderWidth={2} borderColor="$borderColor">
                            <Text variant="heading4" color="$primary">Route Stats</Text>
                            <Text variant="body" weight="semibold" marginTop="$2">Distance: {detail!.encodedPolyline ? `${(detail!.totalDistanceMeters / 1000).toFixed(1)} km` : 'No Map Data'}</Text>
                            <Text variant="body" weight="semibold">Duration: {detail!.encodedPolyline ? `${Math.round(detail!.estimatedDurationSeconds / 60)} mins` : 'No Map Data'}</Text>
                            <Text variant="body" weight="semibold">Stops: {detail!.stops.length}</Text>
                            {!detail!.encodedPolyline && (
                                <Text variant="caption" color="$warning600" marginTop="$2">
                                    Polyline not generated. Showing direct dash approximation.
                                </Text>
                            )}
                        </YStack>
                    </YStack>
                )}
            </YStack>
        </YStack>
    )
}
