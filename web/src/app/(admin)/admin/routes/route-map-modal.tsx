'use client'

import { useEffect, useRef, useState } from 'react'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getRouteDetail, RouteDetailViewModel } from '@/features/admin/routes-actions'

function decodePolyline(encoded: string): [number, number][] {
    if (!encoded) return [];
    let poly: [number, number][] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do { result |= ((b = encoded.charCodeAt(index++) - 63) & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        let dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0; result = 0;
        do { result |= ((b = encoded.charCodeAt(index++) - 63) & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        let dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
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
            const coordinates = decodePolyline(detail.encodedPolyline)

            if (coordinates.length > 0) {
                // Determine Bounds
                const bounds = new maplibregl.LngLatBounds(coordinates[0], coordinates[0]);
                for (const coord of coordinates) {
                    bounds.extend(coord as [number, number]);
                }
                map.fitBounds(bounds, { padding: 50 });

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
            }

            // Render Stops as Markers
            detail.stops.forEach((stop, index) => {
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

                new maplibregl.Marker(el)
                    .setLngLat([stop.longitude, stop.latitude])
                    .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
                        <div style="padding: 4px;">
                            <strong>${stop.name}</strong>
                            ${stop.photoUrl ? `<br/><img src="${stop.photoUrl}" style="width:100%; height:80px; object-fit:cover; margin-top:4px; border-radius:4px;"/>` : ''}
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

                        {/* Stats Overlay for Admin Info */}
                        <YStack position="absolute" bottom={16} left={16} backgroundColor="$backgroundStrong" padding="$3" borderRadius="$3" borderWidth={1} borderColor="$borderColor">
                            <Text variant="label" weight="bold">Route Stats</Text>
                            <Text variant="caption">Distance: {Math.round(detail!.totalDistanceMeters / 1000)} km</Text>
                            <Text variant="caption">Duration: {Math.round(detail!.estimatedDurationSeconds / 60)} mins</Text>
                            <Text variant="caption">Stops: {detail!.stops.length}</Text>
                        </YStack>
                    </YStack>
                )}
            </YStack>
        </YStack>
    )
}
