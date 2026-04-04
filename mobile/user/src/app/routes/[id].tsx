import React, { useEffect, useState, useTransition } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { YStack, XStack, Text, Button, StatBox, RatingDisplay, ScrollView } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import type { RouteDetail } from '@/features/api/types'
import { getRouteById, rateRoute } from '@/features/routes/api'
import { getCollectionById, getCollections, saveRoute, unsaveRoute } from '@/features/collections/api'

function RouteRatingWidget({
  routeId,
  onRated,
}: {
  routeId: string
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
        await rateRoute(routeId, score)
        setSubmitted(true)
        onRated(score)
      } catch {
        setSelected(0)
      }
    })
  }

  return (
    <YStack gap="$3">
      <Text variant="label" color="$mutedForeground">Rate this route</Text>
      <XStack gap="$1.5" alignItems="center">
        {[1, 2, 3, 4, 5].map((score) => (
          <XStack
            key={score}
            padding="$1"
            borderRadius="$2"
            cursor={submitted || isPending ? 'default' : 'pointer'}
            onPress={() => handleRate(score)}
            // @ts-ignore web-only hover support
            onMouseEnter={() => !submitted && !isPending && setHovered(score)}
            onMouseLeave={() => setHovered(0)}
          >
            <Feather
              name="star"
              size={24}
              color={score <= active ? '#FF8C00' : 'var(--color-mutedForeground, #999)'}
            />
          </XStack>
        ))}
        {isPending ? <Text variant="caption" muted>Saving...</Text> : null}
      </XStack>
      {submitted ? (
        <Text variant="caption" color="$success500">Thanks for rating this route.</Text>
      ) : null}
    </YStack>
  )
}

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [route, setRoute] = useState<RouteDetail | null>(null)
  const [displayRating, setDisplayRating] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()

  useEffect(() => {
    if (!id) return

    let mounted = true
    setLoading(true)
    setError(null)

    Promise.allSettled([
      getRouteById(id),
      getCollections(1, 50),
    ])
      .then(async (results) => {
        if (!mounted) return

        const [routeResult, collectionsResult] = results

        if (routeResult.status === 'rejected') {
          throw routeResult.reason
        }

        setRoute(routeResult.value)
        setDisplayRating(routeResult.value.averageRating)

        if (collectionsResult.status === 'fulfilled') {
          const defaultCollection = collectionsResult.value.data.find((collection) => collection.isDefault)

          if (defaultCollection) {
            try {
              const detail = await getCollectionById(defaultCollection.id)
              if (!mounted) return
              setIsSaved(detail.routes.some((item) => item.routeId === routeResult.value.id))
            } catch {}
          }
        }
      })
      .catch((routeError) => {
        if (!mounted) return
        setError(routeError instanceof Error ? routeError.message : 'Failed to load route.')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id])

  const handleToggleSave = () => {
    if (!route) return

    startSaving(async () => {
      try {
        if (isSaved) {
          await unsaveRoute(route.id)
          setIsSaved(false)
        } else {
          await saveRoute(route.id)
          setIsSaved(true)
        }
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Failed to update saved state.')
      }
    })
  }

  if (loading) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Text variant="body" muted>Loading route...</Text>
      </YStack>
    )
  }

  if (!route) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" padding="$5" gap="$3">
        <Text variant="heading4">Route not available</Text>
        <Text variant="body" muted align="center">{error ?? 'We could not load this route.'}</Text>
        <Button variant="outline" onPress={() => router.back()}>
          Go Back
        </Button>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingBottom={120}>
          <YStack
            backgroundColor="$ant900"
            paddingHorizontal="$4"
            paddingTop={insets.top + 12}
            paddingBottom="$5"
            gap="$3"
          >
            <XStack alignSelf="flex-start" alignItems="center" gap="$2" cursor="pointer" onPress={() => router.back()}>
              <Feather name="arrow-left" size={16} color="#FFFFFF" />
              <Text variant="label" color="#FFFFFF">Back</Text>
            </XStack>
            <Text variant="heading2" color="#FFFFFF">{route.title}</Text>
            {displayRating > 0 ? (
              <XStack alignItems="center" gap="$2">
                <RatingDisplay value={displayRating} />
                <Text variant="caption" color="$ant200">{displayRating.toFixed(1)} avg rating</Text>
              </XStack>
            ) : null}
          </YStack>

          <XStack gap="$2" padding="$4" flexWrap="wrap">
            <StatBox value={`${route.stops.length}`} label="Stops" flex={1} />
            <StatBox value={displayRating > 0 ? displayRating.toFixed(1) : '—'} label="Rating" flex={1} />
          </XStack>

          {route.description ? (
            <YStack padding="$4" gap="$2">
              <Text variant="heading3">About this route</Text>
              <Text variant="body" color="$mutedForeground">{route.description}</Text>
            </YStack>
          ) : null}

          <YStack marginHorizontal="$4" marginBottom="$4" gap="$3">
            <Text variant="heading3">Route Stops ({route.stops.length})</Text>
            <YStack gap="$3">
              {route.stops.map((stop, index) => (
                <XStack key={`${stop.spotId}-${index}`} gap="$3" alignItems="flex-start">
                  <YStack alignItems="center" gap="$1">
                    <XStack
                      width={32}
                      height={32}
                      borderRadius="$full"
                      backgroundColor="$primary"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text variant="label" color="#FFFFFF">{index + 1}</Text>
                    </XStack>
                    {index < route.stops.length - 1 ? (
                      <YStack width={2} height={32} backgroundColor="$borderColor" />
                    ) : null}
                  </YStack>
                  <YStack
                    flex={1}
                    gap="$1.5"
                    padding="$3"
                    borderRadius="$4"
                    backgroundColor="$backgroundStrong"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Text variant="heading4">{stop.name}</Text>
                    {stop.description ? <Text variant="caption" muted>{stop.description}</Text> : null}
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </YStack>

          <YStack paddingHorizontal="$4" gap="$4">
            <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$borderColor">
              <Text variant="heading4">Community feedback</Text>
              <RouteRatingWidget
                routeId={route.id}
                onRated={(score) => {
                  setDisplayRating((previous) => {
                    if (previous === 0) return score
                    return parseFloat(((previous + score) / 2).toFixed(1))
                  })
                }}
              />
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal="$4"
        paddingTop="$3"
        paddingBottom={insets.bottom + 12}
        backgroundColor="$backgroundStrong"
        borderTopWidth={1}
        borderTopColor="$borderColor"
        gap="$2"
      >
        {error ? <Text variant="caption" color="$error500">{error}</Text> : null}
        <XStack gap="$3">
          <Button variant="outline" size="lg" flex={1} onPress={handleToggleSave} loading={isSaving} disabled={isSaving}>
            {isSaved ? 'Unsave' : 'Save'}
          </Button>
          <Button variant="solid" size="lg" flex={1} icon={<Feather name="navigation" size={18} color="#FFFFFF" />}>
            Start
          </Button>
        </XStack>
      </YStack>
    </YStack>
  )
}
