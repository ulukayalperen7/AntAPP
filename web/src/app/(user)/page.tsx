'use client'

import { useState } from 'react'
import { YStack, XStack, Text, RouteCard, FilterChip, ScrollView } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import { Map, Compass } from 'lucide-react'

const CATEGORIES = ['All', 'Nature', 'History', 'Food', 'Entertainment']

const POPULAR_ROUTES: RouteCardData[] = [
  {
    id: '1',
    title: 'Classic Kaleici History Tour',
    location: 'Antalya, Turkey',
    rating: 4.9,
    distance: '3.5 km',
    duration: '2h 30m',
    difficulty: 'easy',
    category: 'History',
    description: 'Discover the historic narrow streets, Hadrian\'s Gate, and the ancient harbor.',
    stopsCount: 12,
    isOfficial: true,
  },
  {
    id: '2',
    title: 'Düden Waterfall Trail',
    location: 'Antalya, Turkey',
    rating: 4.7,
    distance: '5.8 km',
    duration: '4h 15m',
    difficulty: 'moderate',
    category: 'Nature',
    stopsCount: 8,
  },
  {
    id: '3',
    title: 'Old Town Foodie Trail',
    location: 'Kaleiçi, Turkey',
    rating: 4.5,
    distance: '2.5 km',
    duration: '2h',
    difficulty: 'easy',
    category: 'Food',
    stopsCount: 10,
  },
  {
    id: '4',
    title: 'Crystal Peak Ridge',
    location: 'Taurus Mountains',
    rating: 4.9,
    distance: '12.4 km',
    duration: '3.5 hrs',
    difficulty: 'hard',
    category: 'Nature',
    stopsCount: 6,
  },
]

const RECOMMENDED_ROUTES: RouteCardData[] = [
  {
    id: '5',
    title: 'Neon Nightlife Route',
    location: 'Antalya City Center',
    rating: 4.8,
    distance: '4.2 km',
    duration: '4h',
    difficulty: 'easy',
    category: 'Entertainment',
    stopsCount: 7,
  },
  {
    id: '6',
    title: 'Forgotten Ruins Walk',
    location: 'Perge, Turkey',
    rating: 4.6,
    distance: '5.8 km',
    duration: '3.5 hrs',
    difficulty: 'moderate',
    category: 'History',
    stopsCount: 5,
  },
  {
    id: '7',
    title: 'Harbor Sunset Stroll',
    location: 'Old Harbor, Antalya',
    rating: 4.4,
    distance: '1.8 km',
    duration: '45m',
    difficulty: 'easy',
    category: 'Nature',
    stopsCount: 4,
  },
]

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('All')

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
            <Text variant="caption" weight="bold" color="#FFFFFF">NEW UPDATE</Text>
          </XStack>
          <Text variant="heading2" color="#FFFFFF">
            Discover Your Next Big Adventure
          </Text>
          <Text variant="body" color="$ant200">
            Join 50k+ explorers sharing the best trails and hidden paths worldwide.
          </Text>
        </YStack>
      </YStack>

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2" paddingVertical="$1">
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              active={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
            >
              {cat}
            </FilterChip>
          ))}
        </XStack>
      </ScrollView>

      {/* Interactive Route Explorer (Map Placeholder) */}
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">Interactive Route Explorer</Text>
        </XStack>
        <YStack
          height={300}
          backgroundColor="$muted"
          borderRadius="$4"
          alignItems="center"
          justifyContent="center"
          borderWidth={2}
          borderStyle="dashed"
          borderColor="$borderColor"
          gap="$2"
        >
          <Map size={48} color="var(--color-mutedForeground)" strokeWidth={1.5} />
          <Text variant="body" muted>Map — Coming Soon</Text>
          <Text variant="caption" muted>Real-time trails and traffic around you</Text>
        </YStack>
      </YStack>

      {/* Popular Routes */}
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">Popular Routes</Text>
          <Text variant="body" color="$primary" cursor="pointer">View All</Text>
        </XStack>
        <XStack flexWrap="wrap" gap="$4">
          {POPULAR_ROUTES.map((route) => (
            <YStack key={route.id} flex={1} minWidth={260} maxWidth="50%">
              <RouteCard data={route} />
            </YStack>
          ))}
        </XStack>
      </YStack>

      {/* Recommended for You */}
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">Recommended for You</Text>
          <Text variant="body" color="$primary" cursor="pointer">See Recommendations</Text>
        </XStack>
        <XStack flexWrap="wrap" gap="$4">
          {RECOMMENDED_ROUTES.map((route) => (
            <YStack key={route.id} flex={1} minWidth={260} maxWidth="33.3%">
              <RouteCard data={route} />
            </YStack>
          ))}
        </XStack>
      </YStack>
    </YStack>
  )
}
