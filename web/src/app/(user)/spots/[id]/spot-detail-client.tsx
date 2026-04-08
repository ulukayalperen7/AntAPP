'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Badge, Image, RouteCard, RatingDisplay } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import type { SpotDetail, SpotRouteItem } from '@/types/api'
import { rateSpot } from '@/features/spots/actions'
import { ArrowLeft, MapPinned, Route as RouteIcon, Star } from 'lucide-react'

function routeToCardData(route: SpotRouteItem): RouteCardData {
  return {
    id: route.id,
    title: route.title,
    description: route.description ?? undefined,
    image: route.thumbnailUrl ?? undefined,
    rating: route.averageRating > 0 ? route.averageRating : undefined,
  }
}

function SpotRatingWidget({
  spotId,
  onRated,
}: {
  spotId: string
  onRated: (score: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const active = hovered || selected

  const handleRate = (score: number) => {
    if (submitted) return

    setSelected(score)
    startTransition(async () => {
      try {
        await rateSpot(spotId, score)
        setSubmitted(true)
        onRated(score)
      } catch {
        setSelected(0)
      }
    })
  }

  return (
    <YStack gap="$3">
      <Text variant="label" color="$mutedForeground">Rate this spot</Text>
      <XStack gap="$1.5" alignItems="center">
        {[1, 2, 3, 4, 5].map((score) => (
          <XStack
            key={score}
            padding="$1"
            borderRadius="$2"
            cursor={submitted || isPending ? 'default' : 'pointer'}
            onPress={() => handleRate(score)}
            // @ts-ignore web-only mouse handlers
            onMouseEnter={() => !submitted && !isPending && setHovered(score)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star
              size={26}
              fill={score <= active ? '#FF8C00' : 'transparent'}
              color={score <= active ? '#FF8C00' : 'var(--color-mutedForeground)'}
              strokeWidth={1.5}
            />
          </XStack>
        ))}
        {isPending && <Text variant="caption" muted>Saving...</Text>}
      </XStack>
      {submitted && (
        <XStack backgroundColor="$success50" borderRadius="$3" padding="$3">
          <Text variant="caption" color="$success500">Thanks! You rated this spot {selected}/5.</Text>
        </XStack>
      )}
    </YStack>
  )
}

export default function SpotDetailClient({
  spot,
  initialRoutes,
}: {
  spot: SpotDetail
  initialRoutes: SpotRouteItem[]
}) {
  const router = useRouter()
  const [displayRating, setDisplayRating] = useState(spot.averageRating)
  const [displayRatingCount, setDisplayRatingCount] = useState(spot.ratingCount)

  return (
    <YStack gap="$5" flex={1}>
      <XStack alignItems="center" gap="$3">
        <Button variant="ghost" size="sm" onPress={() => router.back()} icon={<ArrowLeft size={16} color="currentColor" />}>
          Back
        </Button>
        <YStack flex={1}>
          <Text variant="heading2">{spot.name}</Text>
          <Text variant="body" muted>Spot details and related routes</Text>
        </YStack>
      </XStack>

      <XStack gap="$5" flexWrap="wrap">
        <YStack flex={2} minWidth={360} gap="$5">
          <YStack
            backgroundColor="$backgroundStrong"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            overflow="hidden"
          >
            <YStack height={320} backgroundColor="$muted" alignItems="center" justifyContent="center">
              {spot.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={spot.photoUrl} alt={spot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <MapPinned size={56} color="var(--color-mutedForeground)" />
              )}
            </YStack>

            <YStack padding="$5" gap="$4">
              <XStack justifyContent="space-between" alignItems="flex-start" gap="$3" flexWrap="wrap">
                <YStack gap="$2" flex={1}>
                  <Text variant="heading2">{spot.name}</Text>
                  <Text variant="body" muted>
                    {spot.description ?? 'No description has been added for this spot yet.'}
                  </Text>
                </YStack>

                <YStack gap="$2" alignItems="flex-end">
                  {displayRating > 0 ? (
                    <RatingDisplay value={displayRating} />
                  ) : (
                    <Badge variant="default" size="md">No ratings yet</Badge>
                  )}
                  <Text variant="caption" muted>
                    {displayRatingCount} ratings · Added {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(spot.createdAt))}
                  </Text>
                </YStack>
              </XStack>

              <XStack gap="$2" flexWrap="wrap">
                <Badge variant="default" size="sm">Lat {spot.latitude.toFixed(4)}</Badge>
                <Badge variant="default" size="sm">Lng {spot.longitude.toFixed(4)}</Badge>
                {displayRating > 0 && <Badge variant="info" size="sm">{displayRating.toFixed(1)} avg</Badge>}
              </XStack>
            </YStack>
          </YStack>

          <YStack gap="$3">
            <XStack alignItems="center" gap="$2">
              <RouteIcon size={18} color="var(--color-primary)" />
              <Text variant="heading3">Routes using this spot</Text>
            </XStack>

            {initialRoutes.length === 0 ? (
              <YStack
                backgroundColor="$backgroundStrong"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$borderColor"
                padding="$5"
                gap="$2"
              >
                <Text variant="heading4">No routes yet</Text>
                <Text variant="body" muted>
                  This spot exists in the directory, but no public route is using it yet.
                </Text>
              </YStack>
            ) : (
              <XStack flexWrap="wrap" gap="$4">
                {initialRoutes.map((route) => (
                  <YStack key={route.id} flex={1} minWidth={260} maxWidth="50%">
                    <RouteCard
                      data={routeToCardData(route)}
                      onPress={() => router.push(`/routes/${route.id}`)}
                    />
                  </YStack>
                ))}
              </XStack>
            )}
          </YStack>
        </YStack>

        <YStack flex={1} minWidth={280} gap="$4">
          <YStack
            backgroundColor="$backgroundStrong"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$4"
            gap="$4"
          >
            <Text variant="heading4">Quick actions</Text>
            <Button variant="outline" size="md" onPress={() => router.push('/spots')}>
              Browse More Spots
            </Button>
            <Button variant="solid" size="md" onPress={() => router.push('/routes/create')}>
              Create Route
            </Button>
          </YStack>

          <YStack
            backgroundColor="$backgroundStrong"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$4"
            gap="$4"
          >
            <Text variant="heading4">Community feedback</Text>
            <SpotRatingWidget
              spotId={spot.id}
              onRated={(score) => {
                if (displayRatingCount === 0) {
                  setDisplayRating(score)
                  setDisplayRatingCount(1)
                  return
                }

                const nextCount = displayRatingCount + 1
                const nextAverage = ((displayRating * displayRatingCount) + score) / nextCount
                setDisplayRating(parseFloat(nextAverage.toFixed(1)))
                setDisplayRatingCount(nextCount)
              }}
            />
          </YStack>
        </YStack>
      </XStack>
    </YStack>
  )
}
