'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, SearchInput, Button, Badge, Image } from '@antapp/ui'
import type { SpotListItem } from '@/types/api'
import { getSpots } from '@/features/spots/actions'
import { EmptyState } from '@/components/empty-state'
import { Compass, MapPinned, Search, Star } from 'lucide-react'

function SpotCard({ spot, onPress }: { spot: SpotListItem; onPress: () => void }) {
  return (
    <YStack
      flex={1}
      minWidth={260}
      maxWidth="33.3%"
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
      <YStack height={180} backgroundColor="$muted" justifyContent="center" alignItems="center">
        {spot.photoUrl ? (
          <Image source={{ uri: spot.photoUrl }} width="100%" height="100%" objectFit="cover" />
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
  const [isPending, startTransition] = useTransition()

  const fetchSpots = useCallback((search: string) => {
    startTransition(async () => {
      try {
        const result = await getSpots({
          search: search.trim() || undefined,
          page: 1,
          pageSize: 24,
        })
        setSpots(result.data)
        setTotal(result.totalRecords)
      } catch {
        setSpots([])
        setTotal(0)
      }
    })
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchSpots(query)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [fetchSpots, query])

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
            />
          </YStack>
          <Badge variant="info" size="md">{isPending ? 'Searching...' : `${total} spots`}</Badge>
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

          <XStack flexWrap="wrap" gap="$4">
            {spots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                onPress={() => router.push(`/spots/${spot.id}`)}
              />
            ))}
          </XStack>
        </YStack>
      )}
    </YStack>
  )
}
