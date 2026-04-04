'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, FilterChip, RouteCard, SearchInput, Divider } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import type { RouteListItem, Tag, RouteContentType } from '@/types/api'
import { getRoutes, getTags } from '@/features/routes/actions'
import { Map } from 'lucide-react'
import { useEffect } from 'react'

const ROUTE_TYPES: { label: string; value: RouteContentType | '' }[] = [
  { label: 'All Types', value: '' },
  { label: 'Official', value: 'Official' },
  { label: 'Community', value: 'Community' },
]

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

export default function SearchPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState('')
  const [activeTagId, setActiveTagId] = useState<string | null>(null)
  const [routeType, setRouteType] = useState<RouteContentType | ''>('')
  const [tags, setTags] = useState<Tag[]>([])
  const [results, setResults] = useState<RouteListItem[]>([])
  const [totalResults, setTotalResults] = useState(0)

  // Load tags once
  useEffect(() => {
    getTags(100).then(setTags).catch(() => {})
  }, [])

  const fetchResults = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await getRoutes({
          search: search || undefined,
          tagIds: activeTagId ? [activeTagId] : undefined,
          type: routeType ? routeType.toLowerCase() as 'official' | 'community' | 'sponsored' : undefined,
          pageSize: 20,
        })
        setResults(res.data)
        setTotalResults(res.totalRecords)
      } catch {
        setResults([])
        setTotalResults(0)
      }
    })
  }, [search, activeTagId, routeType])

  // Fetch on filter change
  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  return (
    <XStack gap="$5" flex={1} flexWrap="wrap">
      {/* Filters Sidebar */}
      <YStack width={220} gap="$5" $md={{ display: 'none' }}>
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">Filters</Text>
          <Text
            variant="caption"
            color="$primary"
            cursor="pointer"
            fontWeight="600"
            onPress={() => {
              setActiveTagId(null)
              setRouteType('')
              setSearch('')
            }}
          >
            RESET ALL
          </Text>
        </XStack>

        {/* Search */}
        <YStack gap="$2">
          <Text variant="label" color="$mutedForeground">Search</Text>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search routes..."
          />
        </YStack>

        <Divider />

        {/* Tags */}
        {tags.length > 0 && (
          <YStack gap="$2">
            <Text variant="label" color="$mutedForeground">Tags</Text>
            <YStack gap="$1">
              {tags.filter((t) => t.isActive).map((tag) => (
                <XStack
                  key={tag.id}
                  paddingVertical="$2"
                  paddingHorizontal="$3"
                  borderRadius="$3"
                  backgroundColor={activeTagId === tag.id ? '$ant50' : 'transparent'}
                  hoverStyle={{ backgroundColor: '$backgroundHover' }}
                  cursor="pointer"
                  onPress={() => setActiveTagId(activeTagId === tag.id ? null : tag.id)}
                  gap="$2"
                  alignItems="center"
                >
                  <Text
                    variant="body"
                    color={activeTagId === tag.id ? '$primary' : '$color'}
                    weight={activeTagId === tag.id ? 'semibold' : 'regular'}
                  >
                    {tag.name}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </YStack>
        )}

        <Divider />

        {/* Route Type */}
        <YStack gap="$2">
          <Text variant="label" color="$mutedForeground">Route Type</Text>
          <YStack gap="$1.5">
            {ROUTE_TYPES.map((rt) => (
              <XStack
                key={rt.value || 'all'}
                gap="$2"
                alignItems="center"
                cursor="pointer"
                onPress={() => setRouteType(rt.value)}
              >
                <XStack
                  width={18}
                  height={18}
                  borderRadius="$full"
                  borderWidth={2}
                  borderColor={routeType === rt.value ? '$primary' : '$borderColor'}
                  alignItems="center"
                  justifyContent="center"
                >
                  {routeType === rt.value && (
                    <YStack width={10} height={10} borderRadius="$full" backgroundColor="$primary" />
                  )}
                </XStack>
                <Text variant="body">{rt.label}</Text>
              </XStack>
            ))}
          </YStack>
        </YStack>
      </YStack>

      {/* Results Grid */}
      <YStack flex={2} minWidth={400} gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$2" alignItems="center">
            <Text variant="heading4" weight="bold">Results</Text>
            {!isPending && (
              <Text variant="body" muted>
                {totalResults > 0 ? `${totalResults} routes found` : 'No routes found'}
              </Text>
            )}
            {isPending && <Text variant="body" muted>Searching...</Text>}
          </XStack>
        </XStack>

        {results.length > 0 ? (
          <XStack flexWrap="wrap" gap="$4">
            {results.map((route) => (
              <YStack key={route.id} flex={1} minWidth={220} maxWidth="50%">
                <RouteCard
                  data={routeToCardData(route)}
                  onPress={() => router.push(`/routes/${route.id}`)}
                />
              </YStack>
            ))}
          </XStack>
        ) : !isPending ? (
          <YStack alignItems="center" justifyContent="center" padding="$10" gap="$3">
            <Map size={48} color="var(--color-mutedForeground)" strokeWidth={1.5} />
            <Text variant="heading4" muted align="center">No routes found</Text>
            <Text variant="body" muted align="center">Try adjusting your filters or search term.</Text>
          </YStack>
        ) : null}
      </YStack>

      {/* Map Placeholder */}
      <YStack flex={1} minWidth={280} $md={{ display: 'none' }}>
        <YStack
          flex={1}
          minHeight={500}
          backgroundColor="$muted"
          borderRadius="$4"
          alignItems="center"
          justifyContent="center"
          borderWidth={2}
          borderStyle="dashed"
          borderColor="$borderColor"
          position="sticky"
          top={80}
          gap="$2"
        >
          <Map size={48} color="var(--color-mutedForeground)" strokeWidth={1.5} />
          <Text variant="body" muted>Map View</Text>
        </YStack>
      </YStack>
    </XStack>
  )
}
