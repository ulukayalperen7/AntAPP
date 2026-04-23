'use client'

import { useEffect, useRef, useState } from 'react'
import { YStack, Text } from '@antapp/ui'
import { Map } from 'lucide-react'
import { loadMapLibre, runWhenBrowserIdle } from '@/lib/maplibre'

export default function MapExplorer() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<unknown>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [shouldLoadMap, setShouldLoadMap] = useState(false)

  useEffect(() => runWhenBrowserIdle(() => setShouldLoadMap(true)), [])

  useEffect(() => {
    if (!shouldLoadMap) return

    let cancelled = false

    const initMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return

      try {
        const maplibre = await loadMapLibre()

        if (cancelled || !mapContainerRef.current || mapRef.current) return

        const map = new maplibre.Map({
          container: mapContainerRef.current,
          style: 'https://tiles.openfreemap.org/styles/liberty',
          center: [30.7133, 36.8969],
          zoom: 11,
        })

        map.addControl(new maplibre.NavigationControl(), 'top-right')
        mapRef.current = map
      } catch {
        if (!cancelled) {
          setMapError('Map could not be loaded right now.')
        }
      }
    }

    void initMap()

    return () => {
      cancelled = true
      if (mapRef.current && typeof mapRef.current === 'object' && 'remove' in mapRef.current) {
        ;(mapRef.current as { remove: () => void }).remove()
      }
      mapRef.current = null
    }
  }, [shouldLoadMap])

  return (
    <YStack
      height={260}
      backgroundColor="$muted"
      borderRadius="$4"
      overflow="hidden"
    >
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
        aria-label="Route explorer map"
      />
      {mapError ? (
        <YStack
          position="absolute"
          inset={0}
          alignItems="center"
          justifyContent="center"
          gap="$2"
          backgroundColor="$muted"
          borderWidth={2}
          borderStyle="dashed"
          borderColor="$borderColor"
        >
          <Map size={48} color="var(--color-mutedForeground)" strokeWidth={1.5} />
          <Text variant="body" muted>{mapError}</Text>
        </YStack>
      ) : null}
    </YStack>
  )
}
