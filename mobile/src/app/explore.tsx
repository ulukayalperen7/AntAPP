import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { YStack, XStack, Text, SearchInput, FilterChip, RouteCard, ScrollView } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { getRoutes, getTags } from '@/features/routes/api'
import type { RouteContentType, RouteListItem, Tag } from '@/features/api/types'
import { routeToCardData } from '@/features/routes/presenters'
import { ExploreScreenSkeleton } from '@/components/loading/page-skeletons'

const ROUTE_TYPES: { label: string; value: RouteContentType | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Official', value: 'Official' },
  { label: 'Community', value: 'Community' },
]

export default function ExploreScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ q?: string; sort?: string; type?: string }>()
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState(params.q ?? '')
  const [activeTagId, setActiveTagId] = useState<string | null>(null)
  const initialRouteType =
    params.type === 'official'
      ? 'Official'
      : params.type === 'community'
        ? 'Community'
        : params.type === 'sponsored'
          ? 'Sponsored'
          : ''

  const [routeType, setRouteType] = useState<RouteContentType | ''>(initialRouteType)
  const [tags, setTags] = useState<Tag[]>([])
  const [results, setResults] = useState<RouteListItem[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTags(100).then(setTags).catch(() => {})
  }, [])

  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getRoutes({
        search: search.trim() || undefined,
        tagIds: activeTagId ? [activeTagId] : undefined,
        type: routeType ? routeType.toLowerCase() as 'official' | 'community' | 'sponsored' : undefined,
        sort: params.sort,
        pageSize: 20,
      })
      setResults(result.data)
      setTotalResults(result.totalRecords)
      setError(null)
    } catch (e) {
      setResults([])
      setTotalResults(0)
      setError((e as Error).message ?? 'Failed to load routes.')
    } finally {
      setLoading(false)
    }
  }, [activeTagId, params.sort, routeType, search])

  useEffect(() => {
    const timeout = setTimeout(fetchResults, 250)
    return () => clearTimeout(timeout)
  }, [fetchResults])

  const activeTags = useMemo(() => tags.filter((tag) => tag.isActive), [tags])

  if (loading && results.length === 0) {
    return <ExploreScreenSkeleton topInset={insets.top} />
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$4">
          <YStack gap="$3">
            <Text variant="heading2">Explore Routes</Text>
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search routes..."
              size="md"
            />
          </YStack>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2">
              {ROUTE_TYPES.map((type) => (
                <FilterChip
                  key={type.value || 'all'}
                  active={routeType === type.value}
                  onPress={() => setRouteType(type.value)}
                >
                  {type.label}
                </FilterChip>
              ))}
            </XStack>
          </ScrollView>

          {activeTags.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2">
                <FilterChip active={!activeTagId} onPress={() => setActiveTagId(null)}>
                  All Tags
                </FilterChip>
                {activeTags.map((tag) => (
                  <FilterChip
                    key={tag.id}
                    active={activeTagId === tag.id}
                    onPress={() => setActiveTagId(activeTagId === tag.id ? null : tag.id)}
                  >
                    {tag.name}
                  </FilterChip>
                ))}
              </XStack>
            </ScrollView>
          ) : null}

          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="heading4">Results</Text>
            <Text variant="body" muted>
              {loading ? 'Searching...' : `${totalResults} routes found`}
            </Text>
          </XStack>

          {error ? (
            <YStack
              backgroundColor="$error50"
              borderRadius="$3"
              borderWidth={1}
              borderColor="$error200"
              padding="$3"
            >
              <Text variant="caption" color="$error500">{error}</Text>
            </YStack>
          ) : null}

          {results.length > 0 ? (
            <YStack gap="$4">
              {results.map((route) => (
                <RouteCard
                  key={route.id}
                  data={routeToCardData(route)}
                  onPress={() => router.push(`/routes/${route.id}`)}
                />
              ))}
            </YStack>
          ) : !loading ? (
            <YStack
              alignItems="center"
              justifyContent="center"
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$6"
              gap="$3"
            >
              <Feather name="map" size={36} color="var(--color-mutedForeground, #999)" />
              <Text variant="heading4" muted>No routes found</Text>
              <Text variant="body" muted align="center">
                Try adjusting the search term or filters.
              </Text>
            </YStack>
          ) : null}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
