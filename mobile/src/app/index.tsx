import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, SearchInput, FilterChip, RouteCard, ScrollView, Avatar, IconButton } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import MapLibreGL from '@maplibre/maplibre-react-native'
import { useAuth } from '@/features/auth/context'
import { getRoutes, getTags } from '@/features/routes/api'
import type { RouteListItem, Tag } from '@/features/api/types'
import { routeToCardData } from '@/features/routes/presenters'

MapLibreGL.setAccessToken(null)

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [activeTagId, setActiveTagId] = useState<string | null>(null)
  const [popularRoutes, setPopularRoutes] = useState<RouteListItem[]>([])
  const [communityRoutes, setCommunityRoutes] = useState<RouteListItem[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    Promise.allSettled([
      getRoutes({ sort: 'rating', type: 'official', pageSize: 6 }),
      getRoutes({ sort: 'newest', type: 'community', pageSize: 6 }),
      getTags(100),
    ]).then((results) => {
      if (!mounted) return

      const [popularResult, communityResult, tagsResult] = results
      setPopularRoutes(popularResult.status === 'fulfilled' ? popularResult.value.data : [])
      setCommunityRoutes(communityResult.status === 'fulfilled' ? communityResult.value.data : [])
      setTags(tagsResult.status === 'fulfilled' ? tagsResult.value : [])
      setLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [])

  const tagList = useMemo(
    () => [{ id: '__all__', name: 'All', isActive: true }, ...tags.filter((tag) => tag.isActive)],
    [tags],
  )

  const filterRoutes = (routes: RouteListItem[]) => {
    if (!activeTagId) return routes
    return routes
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$5">
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap="$2">
              <XStack
                width={36}
                height={36}
                borderRadius="$full"
                backgroundColor="$primary"
                alignItems="center"
                justifyContent="center"
              >
                <Text variant="label" color="#FFFFFF">A</Text>
              </XStack>
              <YStack gap="$0.5">
                <Text variant="heading4">AntAPP</Text>
                <Text variant="caption" muted>{user?.userName ?? 'Explorer'}</Text>
              </YStack>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <IconButton variant="ghost" size="sm">
                <Feather name="bell" size={20} color="currentColor" />
              </IconButton>
              <Avatar size="sm" initials={user?.userName?.charAt(0)?.toUpperCase() ?? 'U'} />
            </XStack>
          </XStack>

          <YStack
            backgroundColor="$ant900"
            borderRadius="$4"
            padding="$5"
            gap="$2"
            overflow="hidden"
          >
            <XStack
              backgroundColor="$primary"
              paddingHorizontal="$2.5"
              paddingVertical="$1"
              borderRadius="$2"
              alignSelf="flex-start"
            >
              <Text variant="caption" color="#FFFFFF">EXPLORE</Text>
            </XStack>
            <Text variant="heading2" color="#FFFFFF">Discover your next route</Text>
            <Text variant="body" color="$ant200">
              Browse official highlights and fresh community itineraries from the AntAPP network.
            </Text>
          </YStack>

          <SearchInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => router.push(`/explore?q=${encodeURIComponent(search.trim())}`)}
            placeholder="Search routes, places, or tags..."
            size="md"
          />

          {tagList.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2">
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
          ) : null}

          {/* Discovery Map */}
          <YStack gap="$2">
            <Text variant="heading3">Interactive Route Explorer</Text>
            <YStack height={220} borderRadius="$4" overflow="hidden" backgroundColor="$muted">
              <MapLibreGL.MapView
                style={{ flex: 1 }}
                mapStyle="https://tiles.openfreemap.org/styles/liberty"
                attributionEnabled={false}
                logoEnabled={false}
              >
                <MapLibreGL.Camera
                  centerCoordinate={[30.7133, 36.8969]}
                  zoomLevel={10}
                  animationMode="moveTo"
                  animationDuration={0}
                />
              </MapLibreGL.MapView>
            </YStack>
          </YStack>

          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="heading3">Popular Routes</Text>
              <Text variant="body" color="$primary" onPress={() => router.push('/explore?sort=rating&type=official')}>
                See all
              </Text>
            </XStack>

            <YStack gap="$4">
              {filterRoutes(popularRoutes).map((route) => (
                <RouteCard
                  key={route.id}
                  data={routeToCardData(route)}
                  onPress={() => router.push(`/routes/${route.id}`)}
                />
              ))}
              {!loading && popularRoutes.length === 0 ? (
                <Text variant="body" muted>No popular routes yet.</Text>
              ) : null}
            </YStack>
          </YStack>

          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="heading3">Community Routes</Text>
              <Text variant="body" color="$primary" onPress={() => router.push('/explore?sort=newest&type=community')}>
                See all
              </Text>
            </XStack>

            <YStack gap="$4">
              {filterRoutes(communityRoutes).map((route) => (
                <RouteCard
                  key={route.id}
                  data={routeToCardData(route)}
                  onPress={() => router.push(`/routes/${route.id}`)}
                />
              ))}
              {!loading && communityRoutes.length === 0 ? (
                <Text variant="body" muted>No community routes yet.</Text>
              ) : null}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
