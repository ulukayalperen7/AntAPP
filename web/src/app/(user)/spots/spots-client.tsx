'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, SearchInput, Button, Badge, Image } from '@antapp/ui'
import type { SpotListItem } from '@/types/api'
import { Compass, MapPinned, Search, Star, Heart } from 'lucide-react'
import { getSpots, toggleSpotFavorite, getSavedSpots } from '@/features/spots/actions'
import { EmptyState } from '@/components/empty-state'

function SpotCard({
  spot,
  onPress,
  isSaved,
  onToggleSave
}: {
  spot: SpotListItem
  onPress: () => void
  isSaved: boolean
  onToggleSave: (e: any) => void
}) {
  return (
    <YStack
      backgroundColor="$backgroundStrong"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      overflow="hidden"
      cursor="pointer"
      onPress={onPress}
      hoverStyle={{ borderColor: '$primary', opacity: 0.96 }}
      pressStyle={{ scale: 0.985 }}
    >
      <YStack height={200} backgroundColor="$muted" justifyContent="center" alignItems="center" position="relative">
        <YStack
          position="absolute"
          top={12}
          right={12}
          zIndex={10}
          backgroundColor={isSaved ? '#ff4757' : 'rgba(255,255,255,0.85)'}
          borderRadius="$round"
          padding="$2"
          cursor="pointer"
          onPress={onToggleSave}
          hoverStyle={{ scale: 1.1 }}
        >
          <Heart size={20} color={isSaved ? 'white' : '#2f3542'} fill={isSaved ? "white" : "transparent"} />
        </YStack>

        {spot.photoUrl ? (
          <Image src={spot.photoUrl} alt={spot.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <MapPinned size={36} color="var(--color-mutedForeground)" />
        )}
      </YStack>

      <YStack padding="$4" gap="$3" flex={1}>
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$2">
          <YStack gap="$1" flex={1}>
            <Text variant="heading4">{spot.name}</Text>
            <Text variant="caption" muted numberOfLines={2}>
              {spot.description ?? 'No description yet.'}
            </Text>
          </YStack>
          {spot.averageRating > 0 && (
            <Badge variant="info" size="sm">{spot.averageRating.toFixed(1)}</Badge>
          )}
        </XStack>

        <XStack gap="$2" flexWrap="wrap">
          <Badge variant="default" size="sm">Lat {spot.latitude.toFixed(3)}</Badge>
          <Badge variant="default" size="sm">Lng {spot.longitude.toFixed(3)}</Badge>
          {spot.averageRating > 0 && <Badge variant="default" size="sm">Rated</Badge>}
        </XStack>

        <Button variant="outline" size="sm" onPress={onPress}>
          View Spot
        </Button>
      </YStack>
    </YStack>
  )
}

export default function SpotsClient({
  initialSpots,
  initialTotal,
}: {
  initialSpots: SpotListItem[]
  initialTotal: number
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [spots, setSpots] = useState(initialSpots)
  const [total, setTotal] = useState(initialTotal)
  const [viewMode, setViewMode] = useState<'all' | 'saved'>('all')
  const [savedSpotIds, setSavedSpotIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const fetchSpots = useCallback((search: string, mode: 'all' | 'saved') => {
    startTransition(async () => {
      try {
        if (mode === 'saved') {
          const result = await getSavedSpots()
          setSpots(result)
          setTotal(result.length)
        } else {
          const result = await getSpots({
            search: search.trim() || undefined,
            page: 1,
            pageSize: 24,
          })
          setSpots(result.data)
          setTotal(result.totalRecords)
        }
      } catch {
        setSpots([])
        setTotal(0)
      }
    })
  }, [])

  const fetchSavedSpotIds = useCallback(async () => {
    try {
      const saved = await getSavedSpots()
      setSavedSpotIds(new Set(saved.map((s) => s.id)))
    } catch {
      // Ignored
    }
  }, [])

  useEffect(() => {
    fetchSavedSpotIds()
  }, [fetchSavedSpotIds])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchSpots(query, viewMode)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [fetchSpots, query, viewMode])

  const handleToggleSave = async (e: any, spotId: string) => {
    e.stopPropagation()
    try {
      const isNowSaved = await toggleSpotFavorite(spotId)

      setSavedSpotIds((prev) => {
        const next = new Set(prev)
        if (isNowSaved) {
          next.add(spotId)
        } else {
          next.delete(spotId)

          // If we are in saved mode, remove the card immediately
          if (viewMode === 'saved') {
            setSpots((current) => {
              const refreshed = current.filter(s => s.id !== spotId)
              setTotal(refreshed.length)
              return refreshed
            })
          }
        }
        return next
      })
    } catch {
      // Ignored
    }
  }

  return (
    <YStack gap="$5" flex={1}>
      <YStack
        borderRadius="$4"
        backgroundColor="$backgroundStrong"
        borderWidth={1}
        borderColor="$borderColor"
        padding="$5"
        gap="$4"
      >
        <YStack gap="$2" maxWidth={760}>
          <XStack alignItems="center" gap="$2">
            <Compass size={18} color="var(--color-primary)" />
            <Text variant="caption" color="$primary">SPOTS DIRECTORY</Text>
          </XStack>
          <Text variant="heading2">Discover destinations before you build a route</Text>
          <Text variant="body" muted>
            Browse places added to the platform, inspect their ratings, and jump into the routes that already include them.
          </Text>
        </YStack>

        <XStack gap="$3" flexWrap="wrap" alignItems="center">
          <YStack flex={1} minWidth={280}>
            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search spots by name or description..."
              icon={<Search size={18} color="var(--color-mutedForeground)" />}
              disabled={viewMode === 'saved'}
            />
          </YStack>

          <XStack gap="$2" backgroundColor="$muted" borderRadius="$4" padding="$1">
            <Button
              variant={viewMode === 'all' ? 'solid' : 'ghost'}
              size="sm"
              onPress={() => setViewMode('all')}
            >
              All Spots
            </Button>
            <Button
              variant={viewMode === 'saved' ? 'solid' : 'ghost'}
              size="sm"
              onPress={() => setViewMode('saved')}
            >
              Saved Spots
            </Button>
          </XStack>

          <Badge variant="info" size="md">{isPending ? 'Loading...' : `${total} spots`}</Badge>
        </XStack>
      </YStack>

      {spots.length === 0 && !isPending ? (
        <YStack backgroundColor="$backgroundStrong" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
          <EmptyState
            Icon={MapPinned}
            title="No spots found"
            description="Try a different search term or come back later as the directory grows."
          />
        </YStack>
      ) : (
        <YStack gap="$4">
          <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
            <YStack gap="$1">
              <Text variant="heading3">All spots</Text>
              <Text variant="body" muted>
                {isPending ? 'Refreshing results...' : `${spots.length} visible cards`}
              </Text>
            </YStack>
            <XStack gap="$2" alignItems="center">
              <Star size={16} color="var(--color-primary)" />
              <Text variant="caption" muted>Open a spot to see routes and rating details</Text>
            </XStack>
          </XStack>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {spots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                isSaved={savedSpotIds.has(spot.id)}
                onToggleSave={(e) => handleToggleSave(e, spot.id)}
                onPress={() => router.push(`/spots/${spot.id}`)}
              />
            ))}
          </div>
        </YStack>
      )}
    </YStack>
  )
}
