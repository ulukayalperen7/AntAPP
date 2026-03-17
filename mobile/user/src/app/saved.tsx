import React from 'react'
import { YStack, XStack, Text, RouteCard, ScrollView } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SAVED_ROUTES: RouteCardData[] = [
  {
    id: '1',
    title: 'Classic Kaleiçi Tour',
    location: 'Antalya, Turkey',
    rating: 4.9,
    distance: '3.5 km',
    duration: '2h 30m',
    category: 'History',
    difficulty: 'easy',
    isFavorited: true,
  },
  {
    id: '2',
    title: 'Eagle Peak Trail',
    location: 'Taurus Mountains',
    rating: 4.8,
    distance: '12.0 km',
    duration: '4h 30m',
    category: 'Nature',
    difficulty: 'hard',
    isFavorited: true,
  },
  {
    id: '3',
    title: 'Old Town Foodie Trail',
    location: 'Kaleiçi, Turkey',
    rating: 4.5,
    distance: '2.5 km',
    duration: '2h',
    category: 'Food',
    difficulty: 'easy',
    isFavorited: true,
  },
]

export default function SavedScreen() {
  const insets = useSafeAreaInsets()

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$4">
          <Text variant="heading2">Saved Routes</Text>
          <Text variant="body" muted>{SAVED_ROUTES.length} routes saved</Text>

          <YStack gap="$4">
            {SAVED_ROUTES.map((route) => (
              <RouteCard key={route.id} data={route} />
            ))}
          </YStack>

          {SAVED_ROUTES.length === 0 && (
            <YStack alignItems="center" justifyContent="center" paddingVertical="$10" gap="$3">
              <Text fontSize="$12">{'\u{1F516}'}</Text>
              <Text variant="heading4" muted>No saved routes yet</Text>
              <Text variant="body" muted align="center">
                Save routes you love to find them easily later
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
