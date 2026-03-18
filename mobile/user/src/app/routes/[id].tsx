import React from 'react'
import { YStack, XStack, Text, Button, StatBox, RatingDisplay, Avatar, ProgressBar, ScrollView } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

const ROUTE = {
  title: 'Classic Kaleici History Tour',
  rating: 4.8,
  reviewCount: 124,
  distance: '3.5 km',
  duration: '2 Hours',
  difficulty: 'Easy',
  category: 'History',
  description:
    'Discover the heart of Antalya through the narrow, winding streets of Kaleiçi. This route takes you through centuries of history, from the Roman era to the Ottoman period.',
}

const STOPS = [
  { id: 1, name: "Hadrian's Gate", description: 'Built to honor the Roman emperor Hadrian\'s visit in 130 AD.' },
  { id: 2, name: 'Old City Clock Tower', description: 'The last remaining tower of the city\'s ancient fortifications.' },
  { id: 3, name: 'Hıdırlık Tower', description: 'A landmark tower where the walls meet the sea.' },
  { id: 4, name: 'Karaalioglu Park', description: 'A beautiful seaside park with stunning cliff views.' },
]

const REVIEWS = [
  { id: 1, author: 'Sarah Jenkins', text: "Amazing walk! The Hadrian's Gate stop is breathtaking.", rating: 5 },
  { id: 2, author: 'Mark Thompson', text: 'Loved the harbor view at sunset. Very easy pace.', rating: 5 },
]

export default function RouteDetailScreen() {
  const insets = useSafeAreaInsets()

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingBottom={120}>
          {/* Hero */}
          <YStack
            backgroundColor="$ant900"
            paddingHorizontal="$4"
            paddingTop={insets.top + 12}
            paddingBottom="$5"
            gap="$3"
          >
            <Text variant="heading2" color="#FFFFFF">{ROUTE.title}</Text>
            <XStack alignItems="center" gap="$2">
              <RatingDisplay value={ROUTE.rating} />
              <Text variant="caption" color="$ant200">({ROUTE.reviewCount} reviews)</Text>
            </XStack>
          </YStack>

          {/* Stats */}
          <XStack gap="$2" padding="$4" flexWrap="wrap">
            <StatBox value={ROUTE.distance} label="Distance" flex={1} />
            <StatBox value={ROUTE.duration} label="Duration" flex={1} />
          </XStack>
          <XStack gap="$2" paddingHorizontal="$4" flexWrap="wrap" marginTop={-8}>
            <StatBox value={ROUTE.difficulty} label="Difficulty" flex={1} />
            <StatBox value={ROUTE.category} label="Category" flex={1} />
          </XStack>

          {/* About */}
          <YStack padding="$4" gap="$2">
            <Text variant="heading3">About this route</Text>
            <Text variant="body" color="$mutedForeground" lineHeight="$7">{ROUTE.description}</Text>
          </YStack>

          {/* Map Placeholder */}
          <YStack marginHorizontal="$4" marginBottom="$4">
            <YStack
              height={200}
              backgroundColor="$muted"
              borderRadius="$4"
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderStyle="dashed"
              borderColor="$borderColor"
              gap="$2"
            >
              <Feather name="map" size={40} color="var(--color-mutedForeground, #999)" />
              <Text variant="body" muted>Route Map</Text>
            </YStack>
          </YStack>

          {/* Route Stops */}
          <YStack paddingHorizontal="$4" gap="$3">
            <Text variant="heading3">Route Stops ({STOPS.length})</Text>
            <YStack gap="$3">
              {STOPS.map((stop, idx) => (
                <XStack key={stop.id} gap="$3" alignItems="flex-start">
                  <YStack alignItems="center" gap="$1">
                    <XStack
                      width={32}
                      height={32}
                      borderRadius="$full"
                      backgroundColor="$primary"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text variant="label" color="#FFFFFF" fontSize="$3">{idx + 1}</Text>
                    </XStack>
                    {idx < STOPS.length - 1 && (
                      <YStack width={2} height={32} backgroundColor="$borderColor" />
                    )}
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <Text variant="heading4" fontSize="$5">{stop.name}</Text>
                    <Text variant="caption" muted>{stop.description}</Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </YStack>

          {/* Reviews */}
          <YStack padding="$4" gap="$3">
            <Text variant="heading3">Reviews</Text>
            <YStack gap="$3">
              {REVIEWS.map((review) => (
                <YStack key={review.id} backgroundColor="$backgroundStrong" borderRadius="$3" padding="$3" gap="$2">
                  <XStack alignItems="center" gap="$2">
                    <Avatar size="sm" initials={review.author.charAt(0)} />
                    <Text variant="label" fontSize="$3">{review.author}</Text>
                  </XStack>
                  <Text variant="body" fontSize="$3" color="$mutedForeground">{review.text}</Text>
                </YStack>
              ))}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Bottom CTA */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal="$4"
        paddingVertical="$3"
        paddingBottom={insets.bottom + 12}
        backgroundColor="$backgroundStrong"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <Button variant="solid" size="lg">
          <XStack alignItems="center" gap="$2">
            <Feather name="navigation" size={18} color="#FFFFFF" />
            <Text variant="label" color="#FFFFFF">Start Navigation</Text>
          </XStack>
        </Button>
      </YStack>
    </YStack>
  )
}
