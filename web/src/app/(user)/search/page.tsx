'use client'

import { useState } from 'react'
import { YStack, XStack, Text, FilterChip, RouteCard, SearchInput, RatingDisplay, Divider } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import { Map, Search, Bookmark, MapPin } from 'lucide-react'

const CATEGORIES = ['Nature', 'History', 'Food', 'Entertainment']
const DIFFICULTIES = ['Easy', 'Mid', 'Hard']

const RESULTS: RouteCardData[] = [
  {
    id: '1',
    title: 'Crystal Peak Ridge',
    location: 'Taurus Mountains',
    rating: 4.9,
    distance: '12.4 km',
    duration: '3.5 hrs',
    category: 'Nature',
    difficulty: 'hard',
    isOfficial: true,
  },
  {
    id: '2',
    title: 'Forgotten Ruins Walk',
    location: 'Perge, Turkey',
    rating: 4.6,
    distance: '5.8 km',
    duration: '1.2 hrs',
    category: 'History',
    difficulty: 'moderate',
  },
  {
    id: '3',
    title: 'Old Town Foodie Trail',
    location: 'Kaleiçi, Turkey',
    rating: 4.5,
    distance: '2.5 km',
    duration: '2.0 hrs',
    category: 'Food',
  },
  {
    id: '4',
    title: 'Neon Nightlife Route',
    location: 'City Center',
    rating: 4.8,
    distance: '4.2 km',
    duration: '4.0 hrs',
    category: 'Entertainment',
    difficulty: 'easy',
  },
]

export default function SearchPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>('Nature')
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>('Easy')
  const [routeType, setRouteType] = useState<'official' | 'community'>('official')

  return (
    <XStack gap="$5" flex={1} flexWrap="wrap">
      {/* Filters Sidebar */}
      <YStack width={220} gap="$5" $md={{ display: 'none' }}>
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">Filters</Text>
          <Text variant="caption" color="$primary" cursor="pointer" fontWeight="600">RESET ALL</Text>
        </XStack>

        <YStack gap="$2">
          <Text variant="label" color="$mutedForeground">Category</Text>
          <YStack gap="$1">
            {CATEGORIES.map((cat) => (
              <XStack
                key={cat}
                paddingVertical="$2"
                paddingHorizontal="$3"
                borderRadius="$3"
                backgroundColor={activeCategory === cat ? '$ant50' : 'transparent'}
                hoverStyle={{ backgroundColor: '$backgroundHover' }}
                cursor="pointer"
                onPress={() => setActiveCategory(activeCategory === cat ? null : cat)}
                gap="$2"
                alignItems="center"
              >
                <Text variant="body" color={activeCategory === cat ? '$primary' : '$color'} weight={activeCategory === cat ? 'semibold' : 'regular'}>
                  {cat}
                </Text>
              </XStack>
            ))}
          </YStack>
        </YStack>

        <Divider />

        <YStack gap="$2">
          <Text variant="label" color="$mutedForeground">Difficulty Level</Text>
          <XStack gap="$2" flexWrap="wrap">
            {DIFFICULTIES.map((d) => (
              <FilterChip
                key={d}
                active={activeDifficulty === d}
                onPress={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
              >
                {d}
              </FilterChip>
            ))}
          </XStack>
        </YStack>

        <Divider />

        <YStack gap="$2">
          <XStack justifyContent="space-between">
            <Text variant="label" color="$mutedForeground">Distance</Text>
            <Text variant="caption" color="$primary">0 - 50 km</Text>
          </XStack>
          <YStack height={4} backgroundColor="$muted" borderRadius="$full">
            <YStack height={4} width="60%" backgroundColor="$primary" borderRadius="$full" />
          </YStack>
        </YStack>

        <Divider />

        <YStack gap="$2">
          <XStack justifyContent="space-between">
            <Text variant="label" color="$mutedForeground">Duration</Text>
            <Text variant="caption" color="$primary">0 - 5+ hrs</Text>
          </XStack>
          <YStack height={4} backgroundColor="$muted" borderRadius="$full">
            <YStack height={4} width="50%" backgroundColor="$primary" borderRadius="$full" />
          </YStack>
        </YStack>

        <Divider />

        <YStack gap="$2">
          <Text variant="label" color="$mutedForeground">Minimum Rating</Text>
          <RatingDisplay value={4} />
          <Text variant="caption" muted>4.0 & Up</Text>
        </YStack>

        <Divider />

        <YStack gap="$2">
          <Text variant="label" color="$mutedForeground">Route Type</Text>
          <YStack gap="$1.5">
            <XStack
              gap="$2"
              alignItems="center"
              cursor="pointer"
              onPress={() => setRouteType('official')}
            >
              <XStack
                width={18}
                height={18}
                borderRadius="$full"
                borderWidth={2}
                borderColor={routeType === 'official' ? '$primary' : '$borderColor'}
                alignItems="center"
                justifyContent="center"
              >
                {routeType === 'official' && (
                  <YStack width={10} height={10} borderRadius="$full" backgroundColor="$primary" />
                )}
              </XStack>
              <Text variant="body">Official Routes</Text>
            </XStack>
            <XStack
              gap="$2"
              alignItems="center"
              cursor="pointer"
              onPress={() => setRouteType('community')}
            >
              <XStack
                width={18}
                height={18}
                borderRadius="$full"
                borderWidth={2}
                borderColor={routeType === 'community' ? '$primary' : '$borderColor'}
                alignItems="center"
                justifyContent="center"
              >
                {routeType === 'community' && (
                  <YStack width={10} height={10} borderRadius="$full" backgroundColor="$primary" />
                )}
              </XStack>
              <Text variant="body">Community Routes</Text>
            </XStack>
          </YStack>
        </YStack>
      </YStack>

      {/* Results Grid */}
      <YStack flex={2} minWidth={400} gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$2" alignItems="center">
            <Text variant="heading4" weight="bold">Results</Text>
            <Text variant="body" muted>{RESULTS.length} routes found</Text>
          </XStack>
        </XStack>

        <XStack flexWrap="wrap" gap="$4">
          {RESULTS.map((route) => (
            <YStack key={route.id} flex={1} minWidth={220} maxWidth="50%">
              <RouteCard data={route} />
            </YStack>
          ))}
        </XStack>
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
