import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'expo-router'
import { FlatList, ActivityIndicator, TextInput } from 'react-native'
import { YStack, XStack, Text, Button, RatingDisplay, Badge } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { getSpots, getSavedSpots, toggleSpotFavorite } from '@/features/spots/api'
import type { SpotListItem } from '@/features/api/types'

const PAGE_SIZE = 20

type ViewMode = 'all' | 'saved'

function SpotCard({
  spot,
  isFavorite,
  onPress,
  onToggleFavorite,
  isToggling,
}: {
  spot: SpotListItem
  isFavorite: boolean
  onPress: () => void
  onToggleFavorite: () => void
  isToggling: boolean
}) {
  return (
    <XStack
      backgroundColor="$backgroundStrong"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      padding="$4"
      gap="$3"
      cursor="pointer"
      onPress={onPress}
      pressStyle={{ opacity: 0.85 }}
    >
      <YStack
        width={52}
        height={52}
        borderRadius="$3"
        backgroundColor={spot.photoUrl ? '$muted' : '$primary50'}
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        overflow="hidden"
      >
        <Feather name="map-pin" size={22} color="var(--color-primary)" />
      </YStack>

      <YStack flex={1} gap="$1.5">
        <Text variant="heading4" numberOfLines={1}>{spot.name}</Text>
        {spot.description ? (
          <Text variant="caption" muted numberOfLines={2}>{spot.description}</Text>
        ) : null}
        <XStack gap="$2" flexWrap="wrap" alignItems="center">
          <Badge variant="default" size="sm">Lat {spot.latitude.toFixed(3)}</Badge>
          <Badge variant="default" size="sm">Lng {spot.longitude.toFixed(3)}</Badge>
          {spot.averageRating > 0 ? (
            <XStack alignItems="center" gap="$1">
              <RatingDisplay value={spot.averageRating} />
              <Text variant="caption" muted>{spot.averageRating.toFixed(1)}</Text>
            </XStack>
          ) : null}
        </XStack>
      </YStack>

      <XStack
        padding="$2"
        cursor="pointer"
        onPress={(e) => {
          e.stopPropagation?.()
          if (!isToggling) onToggleFavorite()
        }}
        opacity={isToggling ? 0.5 : 1}
        alignSelf="center"
      >
        <Feather
          name="heart"
          size={20}
          color={isFavorite ? '#EF4444' : 'var(--color-mutedForeground, #999)'}
        />
      </XStack>
    </XStack>
  )
}

export default function SpotsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [search, setSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [spots, setSpots] = useState<SpotListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadSavedIds = async () => {
    try {
      const saved = await getSavedSpots()
      setSavedIds(new Set(saved.map((s) => s.id)))
    } catch {}
  }

  const loadSpots = useCallback(async (searchQuery: string, pageNum: number, mode: ViewMode) => {
    if (pageNum === 1) {
      setLoading(true)
      setSpots([])
    } else {
      setLoadingMore(true)
    }
    setError(null)

    try {
      if (mode === 'saved') {
        const result = await getSavedSpots()
        setSpots(result)
        setTotal(result.length)
        setTotalPages(1)
        setPage(1)
      } else {
        const result = await getSpots({
          search: searchQuery || undefined,
          page: pageNum,
          pageSize: PAGE_SIZE,
        })
        setSpots((prev) => pageNum === 1 ? result.data : [...prev, ...result.data])
        setTotal(result.totalRecords)
        setTotalPages(result.totalPages)
        setPage(pageNum)
      }
    } catch (e) {
      setError((e as Error).message ?? 'Failed to load spots.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadSavedIds()
    loadSpots('', 1, 'all')
  }, [])

  const handleSearchChange = (text: string) => {
    setSearch(text)
    if (viewMode === 'saved') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setActiveSearch(text)
      loadSpots(text, 1, 'all')
    }, 350)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    loadSpots(activeSearch, 1, mode)
  }

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages || viewMode === 'saved') return
    loadSpots(activeSearch, page + 1, viewMode)
  }

  const handleToggleFavorite = async (spotId: string) => {
    setTogglingId(spotId)
    try {
      const nowFavorite = await toggleSpotFavorite(spotId)
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (nowFavorite) {
          next.add(spotId)
        } else {
          next.delete(spotId)
          if (viewMode === 'saved') {
            setSpots((current) => {
              const refreshed = current.filter((s) => s.id !== spotId)
              setTotal(refreshed.length)
              return refreshed
            })
          }
        }
        return next
      })
    } catch {}
    setTogglingId(null)
  }

  const renderItem = ({ item }: { item: SpotListItem }) => (
    <SpotCard
      spot={item}
      isFavorite={savedIds.has(item.id)}
      isToggling={togglingId === item.id}
      onPress={() => router.push(`/spots/${item.id}`)}
      onToggleFavorite={() => handleToggleFavorite(item.id)}
    />
  )

  const ListHeader = (
    <YStack gap="$4" paddingBottom="$2">
      {/* Page header */}
      <YStack
        backgroundColor="$backgroundStrong"
        borderRadius="$4"
        borderWidth={1}
        borderColor="$borderColor"
        padding="$4"
        gap="$3"
      >
        <XStack alignItems="center" gap="$2">
          <Feather name="compass" size={16} color="var(--color-primary)" />
          <Text variant="caption" color="$primary">SPOTS DIRECTORY</Text>
        </XStack>
        <Text variant="heading2">Discover destinations</Text>
        <Text variant="body" muted>
          Browse places, inspect ratings, and find routes that include them.
        </Text>

        {/* Search + toggle row */}
        <XStack gap="$2" alignItems="center" flexWrap="wrap">
          <XStack
            flex={1}
            backgroundColor="$muted"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderColor"
            paddingHorizontal="$3"
            alignItems="center"
            gap="$2"
            opacity={viewMode === 'saved' ? 0.5 : 1}
          >
            <Feather name="search" size={14} color="var(--color-mutedForeground, #999)" />
            <TextInput
              value={search}
              onChangeText={handleSearchChange}
              placeholder="Search spots..."
              placeholderTextColor="var(--color-mutedForeground, #999)"
              style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: 'inherit' }}
              editable={viewMode === 'all'}
            />
            {search && viewMode === 'all' ? (
              <XStack cursor="pointer" onPress={() => handleSearchChange('')} padding="$1">
                <Feather name="x" size={12} color="var(--color-mutedForeground, #999)" />
              </XStack>
            ) : null}
          </XStack>

          {/* All / Saved toggle */}
          <XStack backgroundColor="$muted" borderRadius="$3" padding="$0.5" gap="$0.5">
            <Button
              variant={viewMode === 'all' ? 'solid' : 'ghost'}
              size="sm"
              onPress={() => handleViewModeChange('all')}
            >
              All
            </Button>
            <Button
              variant={viewMode === 'saved' ? 'solid' : 'ghost'}
              size="sm"
              onPress={() => handleViewModeChange('saved')}
              icon={<Feather name="heart" size={12} color={viewMode === 'saved' ? '#FFFFFF' : 'var(--color-primary)'} />}
            >
              Saved
            </Button>
          </XStack>

          <Badge variant="info" size="md">
            {loading ? '...' : `${total}`}
          </Badge>
        </XStack>
      </YStack>

      {spots.length > 0 ? (
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">{viewMode === 'saved' ? 'Saved Spots' : 'All Spots'}</Text>
          <Text variant="caption" muted>{spots.length} visible</Text>
        </XStack>
      ) : null}
    </YStack>
  )

  const ListEmpty = loading ? null : (
    <YStack
      padding="$6"
      backgroundColor="$backgroundStrong"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      gap="$3"
    >
      <Feather name="map-pin" size={36} color="var(--color-mutedForeground, #999)" />
      <Text variant="heading4" muted>
        {viewMode === 'saved'
          ? 'No saved spots yet'
          : activeSearch
          ? `No spots found for "${activeSearch}"`
          : 'No spots yet'}
      </Text>
      <Text variant="body" muted align="center">
        {viewMode === 'saved'
          ? 'Tap the heart on any spot to save it here.'
          : 'Try a different search term.'}
      </Text>
    </YStack>
  )

  const ListFooter = loadingMore ? (
    <YStack padding="$4" alignItems="center">
      <ActivityIndicator />
    </YStack>
  ) : null

  return (
    <YStack flex={1} backgroundColor="$background">
      {loading && spots.length === 0 ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" />
        </YStack>
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: insets.top + 12,
            paddingBottom: 100,
            gap: 12,
          }}
        />
      )}

      {error ? (
        <YStack
          position="absolute"
          bottom={insets.bottom + 16}
          left="$4"
          right="$4"
          backgroundColor="$error50"
          borderRadius="$3"
          padding="$3"
          borderWidth={1}
          borderColor="$error200"
        >
          <Text variant="caption" color="$error500">{error}</Text>
        </YStack>
      ) : null}
    </YStack>
  )
}
