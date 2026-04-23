import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, SearchInput, FilterChip, RouteCard, ScrollView } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'
import { useAuth } from '@/features/auth/context'
import { getRoutes, getTags } from '@/features/routes/api'
import type { RouteListItem, Tag } from '@/features/api/types'
import { routeToCardData } from '@/features/routes/presenters'
import { HomeScreenSkeleton } from '@/components/loading/page-skeletons'

const DISCOVERY_MAP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
    .maplibregl-ctrl-bottom-left,
    .maplibregl-ctrl-bottom-right,
    .maplibregl-ctrl-top-left { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [30.7133, 36.8969],
      zoom: 10,
      attributionControl: false
    });
  </script>
</body>
</html>`

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

  if (loading) {
    return <HomeScreenSkeleton topInset={insets.top} />
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$5">
          <XStack justifyContent="space-between" alignItems="center">
            <YStack gap="$0.5">
              <Text variant="heading3">Hello, {user?.userName ?? 'Explorer'}</Text>
              <Text variant="caption" muted>What will you discover today?</Text>
            </YStack>
            <XStack
              width={36}
              height={36}
              borderRadius="$full"
              backgroundColor="$primary"
              alignItems="center"
              justifyContent="center"
            >
              <Text variant="label" color="#FFFFFF">
                {user?.userName?.charAt(0)?.toUpperCase() ?? 'A'}
              </Text>
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
              <WebView
                source={{ html: DISCOVERY_MAP_HTML }}
                style={{ flex: 1 }}
                scrollEnabled={false}
                javaScriptEnabled
                originWhitelist={['*']}
              />
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
