import React, { useState } from 'react'
import { YStack, XStack, Text, SearchInput, FilterChip, RouteCard, ScrollView } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CATEGORIES = ['All', 'History', 'Nature', 'Food']

const NEARBY_ROUTES: RouteCardData[] = [
  {
    id: '1',
    title: 'Classic Kaleiçi Tour',
    distance: '1.2 km',
    category: 'History',
    description: 'A walk through the historic old town, featuring Hadrian\'s Gate...',
  },
  {
    id: '2',
    title: 'Düden Waterfall Trail',
    distance: '3.5 km',
    category: 'Nature',
    rating: 4.7,
  },
]

export default function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState('All')
  const insets = useSafeAreaInsets()

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Search + Filters */}
      <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} gap="$3" zIndex={10}>
        <SearchInput placeholder="Search routes, stops..." size="md" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2">
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
      </YStack>

      {/* Map Placeholder */}
      <YStack
        flex={1}
        backgroundColor="$muted"
        alignItems="center"
        justifyContent="center"
        margin="$3"
        borderRadius="$4"
      >
        <Text fontSize="$12">{'\u{1F5FA}'}</Text>
        <Text variant="body" muted marginTop="$2">Map View</Text>
        <Text variant="caption" muted>Explore routes around you</Text>

        {/* Map Controls */}
        <YStack
          position="absolute"
          right={12}
          top={12}
          gap="$2"
        >
          <XStack
            width={40}
            height={40}
            borderRadius="$full"
            backgroundColor="$backgroundStrong"
            alignItems="center"
            justifyContent="center"
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={1}
            shadowRadius={3}
            elevation={2}
          >
            <Text fontSize="$5">{'\u{1F4CD}'}</Text>
          </XStack>
        </YStack>
      </YStack>

      {/* Bottom Route Cards */}
      <YStack paddingBottom={90}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <XStack gap="$3">
            {NEARBY_ROUTES.map((route) => (
              <YStack key={route.id} width={260}>
                <RouteCard data={route} />
              </YStack>
            ))}
          </XStack>
        </ScrollView>
      </YStack>
    </YStack>
  )
}
