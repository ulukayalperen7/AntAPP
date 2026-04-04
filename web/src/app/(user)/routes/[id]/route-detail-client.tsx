'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, StatBox, RatingDisplay, ProgressBar } from '@antapp/ui'
import type { RouteDetail } from '@/types/api'
import { Navigation, Bookmark, Ruler, Clock, Map } from 'lucide-react'
import { saveRoute } from '@/features/collections/actions'

type RatingBucket = { stars: number; pct: number }

function computeRatingDistribution(_averageRating: number): RatingBucket[] {
  // Since backend only sends averageRating (no per-star breakdown), we show it visually
  // This is a simplified visual representation
  return [5, 4, 3, 2, 1].map((stars) => ({ stars, pct: 0 }))
}

export default function RouteDetailClient({ route }: { route: RouteDetail }) {
  const router = useRouter()
  const [isSaving, startSaving] = useTransition()

  const handleSave = () => {
    startSaving(async () => {
      try {
        await saveRoute(route.id)
      } catch (e) {
        console.error('Failed to save route', e)
      }
    })
  }

  const ratingBuckets = computeRatingDistribution(route.averageRating)

  return (
    <YStack gap="$5" flex={1}>
      {/* Hero Banner */}
      <YStack
        backgroundColor="$ant900"
        borderRadius="$4"
        padding="$6"
        minHeight={220}
        justifyContent="flex-end"
        position="relative"
        overflow="hidden"
      >
        {route.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={route.thumbnailUrl}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
          />
        )}
        <XStack position="absolute" top={0} left={0} right={0} bottom={0} backgroundColor="$ant800" opacity={0.4} />
        <YStack zIndex={1} gap="$2">
          <Text variant="heading1" color="#FFFFFF">{route.title}</Text>
          {route.averageRating > 0 && (
            <XStack alignItems="center" gap="$3" flexWrap="wrap">
              <RatingDisplay value={route.averageRating} />
              <Text variant="caption" color="$ant200">
                {route.averageRating.toFixed(1)} avg rating
              </Text>
            </XStack>
          )}
          <XStack gap="$3" marginTop="$2">
            <Button variant="solid" size="md" onPress={() => {}}>
              <XStack alignItems="center" gap="$1.5">
                <Navigation size={16} color="#FFFFFF" />
                <Text variant="label" color="#FFFFFF">Start Navigation</Text>
              </XStack>
            </Button>
            <Button variant="outline" size="md" loading={isSaving} onPress={handleSave}>
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
        <StatBox value={`${route.stops.length}`} label="Stops" icon={<Map size={22} color="var(--color-primary)" />} />
        {route.averageRating > 0 && (
          <StatBox value={route.averageRating.toFixed(1)} label="Rating" icon={<Ruler size={22} color="var(--color-primary)" />} />
        )}
      </XStack>

      {/* Two Column Layout */}
      <XStack gap="$5" flexWrap="wrap">
        {/* Left Column */}
        <YStack flex={2} minWidth={400} gap="$5">
          {/* About */}
          {route.description && (
            <YStack gap="$3">
              <Text variant="heading3">About this route</Text>
              <Text variant="body" color="$mutedForeground" lineHeight="$7">{route.description}</Text>
            </YStack>
          )}

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
          {route.stops.length > 0 && (
            <YStack gap="$3">
              <Text variant="heading3">Route Stops ({route.stops.length})</Text>
              <YStack gap="$4">
                {route.stops.map((stop, idx) => (
                  <XStack key={stop.spotId} gap="$3" alignItems="flex-start">
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
                      {idx < route.stops.length - 1 && (
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
                      {stop.description && (
                        <Text variant="body" muted>{stop.description}</Text>
                      )}
                    </YStack>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          )}
        </YStack>

        {/* Right Sidebar */}
        <YStack flex={1} minWidth={280} gap="$5">
          {/* Rating Summary */}
          {route.averageRating > 0 && (
            <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$3">
              <Text variant="heading4">Rating</Text>
              <XStack alignItems="center" gap="$3">
                <Text fontFamily="$heading" fontSize="$11" fontWeight="700" color="$color">
                  {route.averageRating.toFixed(1)}
                </Text>
                <YStack gap="$1">
                  <RatingDisplay value={route.averageRating} showValue={false} />
                  <Text variant="caption" muted>AVERAGE SCORE</Text>
                </YStack>
              </XStack>
              <YStack gap="$2">
                {ratingBuckets.map((item) => (
                  <XStack key={item.stars} alignItems="center" gap="$2">
                    <Text variant="caption" width={16} align="right">{item.stars}</Text>
                    <ProgressBar value={item.pct} max={100} size="sm" flex={1} />
                    <Text variant="caption" muted width={36} align="right">{item.pct}%</Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          )}

          {/* Fork Route */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$3">
            <Text variant="heading4">Use This Route</Text>
            <Text variant="body" muted>Fork this route to customize it for your own adventure.</Text>
            <Button variant="outline" size="md" onPress={() => {}}>
              Fork Route
            </Button>
          </YStack>
        </YStack>
      </XStack>
    </YStack>
  )
}
