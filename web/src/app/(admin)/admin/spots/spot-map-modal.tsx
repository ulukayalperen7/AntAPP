'use client'

import { useEffect, useRef } from 'react'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

type SpotMapProp = {
    id: string
    name: string
    latitude: number
    longitude: number
    photoUrl?: string
    description?: string
}

export function SpotMapModal({ spot, onClose }: { spot: SpotMapProp, onClose: () => void }) {
    const mapContainer = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!mapContainer.current) return

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: [spot.longitude, spot.latitude],
            zoom: 15
        })

        map.on('load', () => {
            const el = document.createElement('div')
            el.style.width = '24px'
            el.style.height = '24px'
            el.style.borderRadius = '50%'
            el.style.backgroundColor = '#ef4444' // Red color for single spot
            el.style.border = '2px solid white'
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

            new maplibregl.Marker({ element: el })
                .setLngLat([spot.longitude, spot.latitude])
                .setPopup(new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
                    <div style="padding: 4px; max-width: 200px; text-align: center;">
                        <strong>${spot.name}</strong>
                        ${spot.photoUrl ? `<br/><img src="${spot.photoUrl}" style="width:100%; height:100px; object-fit:cover; margin-top:8px; border-radius:4px;"/>` : ''}
                    </div>
                `))
                .addTo(map)
                .togglePopup()
        })

        return () => map.remove()
    }, [spot])

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
                maxWidth={600}
                height={500}
                borderRadius="$4"
                overflow="hidden"
                display="flex"
                flexDirection="column"
            >
                <XStack padding="$4" justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderBottomColor="$borderColor">
                    <Text variant="heading4">Locating: {spot.name}</Text>
                    <Button size="sm" variant="ghost" onPress={onClose}>Close</Button>
                </XStack>
                <YStack flex={1} style={{ position: 'relative' }}>
                    <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
                    <Button
                        size="sm"
                        variant="solid"
                        position="absolute"
                        bottom={16}
                        right={16}
                        onPress={() => window.open(`https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`, '_blank')}
                    >
                        View on Google Maps
                    </Button>
                </YStack>
            </YStack>
        </YStack>
    )
}
