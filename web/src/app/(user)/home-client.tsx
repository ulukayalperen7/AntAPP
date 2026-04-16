'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, RouteCard, FilterChip, ScrollView } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import type { RouteListItem, Tag } from '@/types/api'
import { Map } from 'lucide-react'

function routeToCardData(route: RouteListItem): RouteCardData {
  return {
    id: route.id,
    title: route.title,
    description: route.description ?? undefined,
    image: route.thumbnailUrl ?? undefined,
    rating: route.averageRating > 0 ? route.averageRating : undefined,
    contentType: route.contentType,
    isOfficial: route.contentType === 'Official',
  }
}

export default function HomeClient({
  popularRoutes,
  recommendedRoutes,
  tags,
}: {
  popularRoutes: RouteListItem[]
  recommendedRoutes: RouteListItem[]
  tags: Tag[]
}) {
  const router = useRouter()
  const [activeTagId, setActiveTagId] = useState<string | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<unknown>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const initMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return

      try {
        if (!document.querySelector('link[data-maplibre-style="true"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css'
          link.dataset.maplibreStyle = 'true'
          document.head.appendChild(link)
        }

        const maplibre = await import('maplibre-gl')

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
  }, [])

  const allTag = { id: '__all__', name: 'All', isActive: true }
  const tagList = [allTag, ...tags.filter((t) => t.isActive)]

  const filterRoutes = (routes: RouteListItem[]) => {
    if (!activeTagId) return routes
    return routes // tag filtering is server-side; this is just UI state for now
  }

  return (
    <YStack gap="$6" flex={1}>
      {/* Hero Banner */}
      <YStack
        backgroundColor="$ant900"
        borderRadius="$4"
        padding="$6"
        minHeight={200}
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        <XStack
          position="absolute"
          top={-40}
          right={-40}
          width={200}
          height={200}
          borderRadius="$full"
          backgroundColor="$ant800"
          opacity={0.3}
        />
        <YStack gap="$2" maxWidth={480} zIndex={1}>
          <XStack
            backgroundColor="$primary"
            paddingHorizontal="$2.5"
            paddingVertical="$1"
            borderRadius="$2"
            alignSelf="flex-start"
          >
            <Text variant="caption" weight="bold" color="#FFFFFF">EXPLORE</Text>
          </XStack>
          <Text variant="heading2" color="#FFFFFF">
            Discover Your Next Big Adventure
          </Text>
          <Text variant="body" color="$ant200">
            Join thousands of explorers sharing the best trails and hidden paths worldwide.
          </Text>
        </YStack>
      </YStack>

      {/* Tag Filters */}
      {tagList.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" paddingVertical="$1">
            {tagList.map((tag) => (
              <FilterChip
                key={tag.id}
                active={activeTagId === (tag.id === '__all__' ? null : tag.id)}
                onPress={() => setActiveTagId(tag.id === '__all__' ? null : tag.id)}
              >
                {tag.name}
              </FilterChip>
            ))}
          </XStack>
        </ScrollView>
      )}

      {/* Interactive Route Explorer */}
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">Interactive Route Explorer</Text>
        </XStack>
        <YStack
          height={300}
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
      </YStack>

      {/* Popular Routes */}
      {filterRoutes(popularRoutes).length > 0 && (
        <YStack gap="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="heading3">Popular Routes</Text>
            <Text
              variant="body"
              color="$primary"
              cursor="pointer"
              onPress={() => router.push('/search?sort=rating&type=official')}
            >
              View All
            </Text>
          </XStack>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {filterRoutes(popularRoutes).map((route) => (
              <RouteCard
                key={route.id}
                data={routeToCardData(route)}
                onPress={() => router.push(`/routes/${route.id}`)}
              />
            ))}
          </div>
        </YStack>
      )}

      {/* Recommended / Community */}
      {filterRoutes(recommendedRoutes).length > 0 && (
        <YStack gap="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="heading3">Community Routes</Text>
            <Text
              variant="body"
              color="$primary"
              cursor="pointer"
              onPress={() => router.push('/search?sort=newest&type=community')}
            >
              See More
            </Text>
          </XStack>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {filterRoutes(recommendedRoutes).map((route) => (
              <RouteCard
                key={route.id}
                data={routeToCardData(route)}
                onPress={() => router.push(`/routes/${route.id}`)}
              />
            ))}
          </div>
        </YStack>
      )}

      {/* Empty state when no routes */}
      {popularRoutes.length === 0 && recommendedRoutes.length === 0 && (
        <YStack alignItems="center" justifyContent="center" padding="$10" gap="$3">
          <Map size={48} color="var(--color-mutedForeground)" strokeWidth={1.5} />
          <Text variant="heading3" muted align="center">No routes yet</Text>
          <Text variant="body" muted align="center">Be the first to create a route and share your adventure!</Text>
        </YStack>
      )}
    </YStack>
  )
}
