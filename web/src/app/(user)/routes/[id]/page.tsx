'use client'

import { YStack, XStack, Text, Button, StatBox, RatingDisplay, Avatar, Badge, ProgressBar } from '@antapp/ui'
import { Eye, Navigation, Bookmark, Ruler, Clock, TrendingUp, Landmark, Map, ImageIcon } from 'lucide-react'

const ROUTE_DATA = {
  title: 'Classic Kaleici History Tour',
  location: 'Antalya > Kaleici > History Tour',
  rating: 4.8,
  reviewCount: 124,
  views: 2400,
  distance: '3.5 km',
  duration: '2 Hours',
  difficulty: 'Easy',
  category: 'History',
  description:
    'Discover the heart of Antalya through the narrow, winding streets of Kaleiçi. This route takes you through centuries of history, from the Roman era to the Ottoman period. You\'ll witness stunning architecture, hidden gardens, and the vibrant atmosphere of the Old Town harbor. Perfect for families and history enthusiasts looking for a leisurely morning walk.',
}

const STOPS = [
  { id: 1, name: "Hadrian's Gate", description: "Built to honor the Roman emperor Hadrian's visit in 130 AD. The most famous entrance to the Old Town." },
  { id: 2, name: 'Old City Clock Tower', description: 'The last remaining tower of the city\'s ancient fortifications, marking the entrance to the main square.' },
  { id: 3, name: 'Hıdırlık Tower & Harbor View', description: 'A landmark tower where the walls meet the sea. Offers the best panoramic view of the yacht harbor.' },
  { id: 4, name: 'Karaalioglu Park', description: 'A beautiful seaside park with lush gardens and stunning cliff views over the Mediterranean.' },
]

const REVIEWS = [
  { id: 1, author: 'Sarah Jenkins', text: "Amazing walk! The Hadrian's Gate stop is breathtaking. Make sure to wear comfortable shoes.", rating: 5 },
  { id: 2, author: 'Mark Thompson', text: 'Loved the harbor view at sunset. Very easy pace.', rating: 5 },
  { id: 3, author: 'Elena Rivera', text: 'Great historical route. The descriptions at each stop are very informative.', rating: 4 },
]

const RATING_DIST = [
  { stars: 5, pct: 75 },
  { stars: 4, pct: 18 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 1 },
]

export default function RouteDetailPage() {
  return (
    <YStack gap="$5" flex={1}>
      {/* Hero */}
      <YStack
        backgroundColor="$ant900"
        borderRadius="$4"
        padding="$6"
        minHeight={220}
        justifyContent="flex-end"
        position="relative"
        overflow="hidden"
      >
        <XStack position="absolute" top={0} left={0} right={0} bottom={0} backgroundColor="$ant800" opacity={0.4} />
        <YStack zIndex={1} gap="$2">
          <Text variant="caption" color="$ant200">{ROUTE_DATA.location}</Text>
          <Text variant="heading1" color="#FFFFFF">{ROUTE_DATA.title}</Text>
          <XStack alignItems="center" gap="$3" flexWrap="wrap">
            <RatingDisplay value={ROUTE_DATA.rating} />
            <Text variant="caption" color="$ant200">({ROUTE_DATA.reviewCount} reviews)</Text>
            <XStack alignItems="center" gap="$1">
              <Eye size={14} color="var(--color-ant200)" />
              <Text variant="caption" color="$ant200">{(ROUTE_DATA.views / 1000).toFixed(1)}k views</Text>
            </XStack>
          </XStack>
          <XStack gap="$3" marginTop="$2">
            <Button variant="solid" size="md">
              <XStack alignItems="center" gap="$1.5">
                <Navigation size={16} color="#FFFFFF" />
                <Text variant="label" color="#FFFFFF">Start Navigation</Text>
              </XStack>
            </Button>
            <Button variant="outline" size="md">
              <XStack alignItems="center" gap="$1.5">
                <Bookmark size={16} color="currentColor" />
                <Text variant="label">Save</Text>
              </XStack>
            </Button>
          </XStack>
        </YStack>
      </YStack>

      {/* Stats Bar */}
      <XStack gap="$3" flexWrap="wrap">
        <StatBox value={ROUTE_DATA.distance} label="Distance" icon={<Ruler size={22} color="var(--color-primary)" />} />
        <StatBox value={ROUTE_DATA.duration} label="Duration" icon={<Clock size={22} color="var(--color-primary)" />} />
        <StatBox value={ROUTE_DATA.difficulty} label="Difficulty" icon={<TrendingUp size={22} color="var(--color-primary)" />} />
        <StatBox value={ROUTE_DATA.category} label="Category" icon={<Landmark size={22} color="var(--color-primary)" />} />
      </XStack>

      {/* Two Column Layout */}
      <XStack gap="$5" flexWrap="wrap">
        {/* Left Column */}
        <YStack flex={2} minWidth={400} gap="$5">
          {/* About */}
          <YStack gap="$3">
            <Text variant="heading3">About this route</Text>
            <Text variant="body" color="$mutedForeground" lineHeight="$7">{ROUTE_DATA.description}</Text>
          </YStack>

          {/* Map Placeholder */}
          <YStack gap="$3">
            <Text variant="heading3">Interactive Route Map</Text>
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
              <Text variant="body" muted>Route Map — Coming Soon</Text>
            </YStack>
          </YStack>

          {/* Route Stops */}
          <YStack gap="$3">
            <Text variant="heading3">Route Stops ({STOPS.length})</Text>
            <YStack gap="$4">
              {STOPS.map((stop, idx) => (
                <XStack key={stop.id} gap="$3" alignItems="flex-start">
                  <YStack alignItems="center" gap="$1">
                    <XStack
                      width={36}
                      height={36}
                      borderRadius="$full"
                      backgroundColor="$primary"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text variant="label" color="#FFFFFF" fontSize="$4">{idx + 1}</Text>
                    </XStack>
                    {idx < STOPS.length - 1 && (
                      <YStack width={2} height={40} backgroundColor="$borderColor" />
                    )}
                  </YStack>
                  <YStack
                    flex={1}
                    backgroundColor="$backgroundStrong"
                    borderRadius="$3"
                    padding="$4"
                    gap="$1.5"
                  >
                    <Text variant="heading4">{stop.name}</Text>
                    <Text variant="body" muted>{stop.description}</Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </YStack>
        </YStack>

        {/* Right Sidebar */}
        <YStack flex={1} minWidth={280} gap="$5">
          {/* Reviews Summary */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$3">
            <Text variant="heading4">Reviews</Text>
            <XStack alignItems="center" gap="$3">
              <Text fontFamily="$heading" fontSize="$11" fontWeight="700" color="$color">{ROUTE_DATA.rating}</Text>
              <YStack gap="$1">
                <RatingDisplay value={ROUTE_DATA.rating} showValue={false} />
                <Text variant="caption" muted>AVERAGE SCORE</Text>
              </YStack>
            </XStack>
            <YStack gap="$2">
              {RATING_DIST.map((item) => (
                <XStack key={item.stars} alignItems="center" gap="$2">
                  <Text variant="caption" width={16} align="right">{item.stars}</Text>
                  <ProgressBar value={item.pct} max={100} size="sm" flex={1} />
                  <Text variant="caption" muted width={36} align="right">{item.pct}%</Text>
                </XStack>
              ))}
            </YStack>
          </YStack>

          {/* Shared Photos */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$3">
            <Text variant="heading4">Shared Photos</Text>
            <XStack flexWrap="wrap" gap="$2">
              {Array.from({ length: 6 }).map((_, i) => (
                <YStack
                  key={i}
                  width={80}
                  height={80}
                  borderRadius="$2"
                  backgroundColor="$muted"
                  alignItems="center"
                  justifyContent="center"
                >
                  <ImageIcon size={24} color="var(--color-mutedForeground)" strokeWidth={1.5} />
                </YStack>
              ))}
            </XStack>
          </YStack>

          {/* Community Comments */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$3">
            <Text variant="heading4">Community Comments</Text>
            <YStack gap="$3">
              {REVIEWS.map((review) => (
                <YStack key={review.id} gap="$1.5">
                  <XStack alignItems="center" gap="$2">
                    <Avatar size="sm" initials={review.author.charAt(0)} />
                    <YStack>
                      <Text variant="label" fontSize="$3">{review.author}</Text>
                    </YStack>
                  </XStack>
                  <Text variant="body" fontSize="$3" color="$mutedForeground">{review.text}</Text>
                </YStack>
              ))}
            </YStack>
            <Text variant="body" color="$primary" cursor="pointer" fontSize="$3">
              View all {ROUTE_DATA.reviewCount} reviews
            </Text>
          </YStack>
        </YStack>
      </XStack>
    </YStack>
  )
}
