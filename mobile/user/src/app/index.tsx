import React, { useState } from 'react'
import { YStack, XStack, Text, SearchInput, FilterChip, RouteCard, ScrollView, Avatar, IconButton } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

const CATEGORIES = ['All', 'Nature', 'History', 'Food', 'Entertainment']

const POPULAR_ROUTES: RouteCardData[] = [
  {
    id: '1',
    title: 'Classic Kaleiçi Tour',
    description: 'Discover the historic narrow streets, Hadrian\'s Gate, and the ancient harbor of Antalya\'s old town.',
    rating: 4.9,
    distance: '3.5 km',
    duration: '2h 30m',
    category: 'History',
    stopsCount: 12,
    isOfficial: true,
  },
  {
    id: '2',
    title: 'Düden Waterfall Trail',
    rating: 4.7,
    distance: '5.8 km',
    duration: '4h 15m',
    category: 'Nature',
    difficulty: 'moderate',
    stopsCount: 8,
  },
  {
    id: '3',
    title: 'Old Town Foodie Trail',
    rating: 4.5,
    distance: '2.5 km',
    duration: '2h',
    category: 'Food',
    difficulty: 'easy',
    stopsCount: 10,
  },
]

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('All')
  const insets = useSafeAreaInsets()

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$4">
          {/* Top Bar */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap="$2">
              <XStack
                width={32}
                height={32}
                borderRadius="$full"
                backgroundColor="$primary"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="$2" fontWeight="700" color="#FFFFFF">A</Text>
              </XStack>
              <Text variant="heading4">AntAPP</Text>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <IconButton variant="ghost" size="sm">
                <Feather name="bell" size={22} color="currentColor" />
              </IconButton>
              <Avatar size="sm" initials="U" />
            </XStack>
          </XStack>

          {/* Search */}
          <SearchInput placeholder="Where do you want to go?" size="md" />

          {/* Category Filters */}
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

          {/* Popular Routes */}
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="heading3">Popular Routes</Text>
              <Text variant="body" color="$primary">See all</Text>
            </XStack>

            <YStack gap="$4">
              {POPULAR_ROUTES.map((route) => (
                <RouteCard key={route.id} data={route} />
              ))}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Floating Map View Button */}
      <XStack
        position="absolute"
        bottom={100}
        alignSelf="center"
        backgroundColor="$ant900"
        paddingHorizontal="$4"
        paddingVertical="$2.5"
        borderRadius="$full"
        alignItems="center"
        gap="$2"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={1}
        shadowRadius={8}
        elevation={4}
      >
        <Feather name="map" size={18} color="#FFFFFF" />
        <Text variant="label" color="#FFFFFF">Map View</Text>
      </XStack>
    </YStack>
  )
}
