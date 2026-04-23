import React, { useEffect, useState, useTransition } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Share } from 'react-native'
import { YStack, XStack, Text, Button, StatBox, RatingDisplay, ScrollView, Badge } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import type { RouteDetail } from '@/features/api/types'
import { getRouteById, rateRoute, forkRoute } from '@/features/routes/api'
import { useAuth } from '@/features/auth/context'
import { SaveToCollectionModal } from '@/components/modals/save-to-collection-modal'
import { RouteMap } from '@/components/map/route-map'

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
            // @ts-ignore web-only
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
  const { user } = useAuth()

  const [route, setRoute] = useState<RouteDetail | null>(null)
  const [displayRating, setDisplayRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [collectionModalVisible, setCollectionModalVisible] = useState(false)
  const [isForking, startFork] = useTransition()

  useEffect(() => {
    if (!id) return

    let mounted = true
    setLoading(true)
    setError(null)

    getRouteById(id)
      .then((r) => {
        if (!mounted) return
        setRoute(r)
        setDisplayRating(r.averageRating)
      })
      .catch((e) => {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'Failed to load route.')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => { mounted = false }
  }, [id])

  const isOwner = !!user && !!route && route.authorUserId === user.id

  const handleFork = () => {
    if (!route) return
    startFork(async () => {
      try {
        const newId = await forkRoute(route.id)
        router.push(`/routes/${newId}/edit`)
      } catch (e) {
        setError((e as Error).message ?? 'Failed to fork route.')
      }
    })
  }

  const handleShare = () => {
    if (!route) return
    Share.share({
      title: route.title,
      message: `Check out this route: ${route.title}`,
    }).catch(() => {})
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
        <Button variant="outline" onPress={() => router.back()}>Go Back</Button>
      </YStack>
    )
  }

  const distanceKm = route.totalDistanceMeters > 0
    ? (route.totalDistanceMeters / 1000).toFixed(1) + ' km'
    : '—'

  const durationMin = route.estimatedDurationSeconds > 0
    ? Math.round(route.estimatedDurationSeconds / 60) + ' min'
    : '—'

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingBottom={140}>
          {/* Header */}
          <YStack
            backgroundColor="$ant900"
            paddingHorizontal="$4"
            paddingTop={insets.top + 12}
            paddingBottom="$5"
            gap="$3"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$2" cursor="pointer" onPress={() => router.back()}>
                <Feather name="arrow-left" size={16} color="#FFFFFF" />
                <Text variant="label" color="#FFFFFF">Back</Text>
              </XStack>
              <XStack gap="$2">
                <XStack cursor="pointer" onPress={handleShare} padding="$2">
                  <Feather name="share-2" size={18} color="#FFFFFF" />
                </XStack>
                {isOwner ? (
                  <XStack cursor="pointer" onPress={() => router.push(`/routes/${route.id}/edit`)} padding="$2">
                    <Feather name="edit-2" size={18} color="#FFFFFF" />
                  </XStack>
                ) : null}
              </XStack>
            </XStack>

            <Text variant="heading2" color="#FFFFFF">{route.title}</Text>

            <XStack gap="$2" flexWrap="wrap">
              <Badge variant={route.isPublic ? 'success' : 'default'} size="sm">
                {route.isPublic ? 'Public' : 'Private'}
              </Badge>
              <Badge variant="info" size="sm">{route.contentType}</Badge>
            </XStack>

            {displayRating > 0 ? (
              <XStack alignItems="center" gap="$2">
                <RatingDisplay value={displayRating} />
                <Text variant="caption" color="$ant200">{displayRating.toFixed(1)} avg rating</Text>
              </XStack>
            ) : null}
          </YStack>

          {/* Stats */}
          <XStack gap="$2" padding="$4" flexWrap="wrap">
            <StatBox value={`${route.stops.length}`} label="Stops" flex={1} />
            <StatBox value={distanceKm} label="Distance" flex={1} />
            <StatBox value={durationMin} label="Duration" flex={1} />
          </XStack>

          {/* Description */}
          {route.description ? (
            <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$2">
              <Text variant="heading3">About this route</Text>
              <Text variant="body" color="$mutedForeground">{route.description}</Text>
            </YStack>
          ) : null}

          {/* Interactive Map */}
          <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$2">
            <Text variant="heading3">Interactive Route Map</Text>
            <YStack height={240} borderRadius="$4" overflow="hidden" backgroundColor="$muted">
              <RouteMap route={route} />
            </YStack>
          </YStack>

          {/* Stops */}
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
                    <Text variant="caption" muted>
                      {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                    </Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </YStack>

          {/* Rating widget */}
          {!isOwner ? (
            <YStack paddingHorizontal="$4" gap="$4" marginBottom="$4">
              <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$borderColor">
                <Text variant="heading4">Community feedback</Text>
                <RouteRatingWidget
                  routeId={route.id}
                  onRated={(score) => {
                    setDisplayRating((prev) => {
                      if (prev === 0) return score
                      return parseFloat(((prev + score) / 2).toFixed(1))
                    })
                  }}
                />
              </YStack>
            </YStack>
          ) : null}

          {/* Fork section */}
          {!isOwner ? (
            <YStack paddingHorizontal="$4" marginBottom="$4">
              <YStack
                backgroundColor="$backgroundStrong"
                borderRadius="$4"
                padding="$4"
                borderWidth={1}
                borderColor="$borderColor"
                gap="$2"
              >
                <XStack alignItems="center" gap="$2">
                  <Feather name="git-branch" size={16} color="var(--color-primary)" />
                  <Text variant="heading4">Fork this route</Text>
                </XStack>
                <Text variant="caption" muted>Create your own copy and customize it freely.</Text>
                <Button
                  variant="outline"
                  size="md"
                  alignSelf="flex-start"
                  loading={isForking}
                  disabled={isForking}
                  onPress={handleFork}
                  icon={<Feather name="git-branch" size={14} />}
                >
                  Fork Route
                </Button>
              </YStack>
            </YStack>
          ) : null}

          {error ? (
            <YStack paddingHorizontal="$4">
              <Text variant="caption" color="$error500">{error}</Text>
            </YStack>
          ) : null}
        </YStack>
      </ScrollView>

      {/* Bottom action bar */}
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
        <XStack gap="$2">
          <Button
            variant="outline"
            size="lg"
            flex={1}
            onPress={() => setCollectionModalVisible(true)}
            icon={<Feather name="bookmark" size={16} />}
          >
            Save
          </Button>
          {isOwner ? (
            <Button
              variant="outline"
              size="lg"
              flex={1}
              onPress={() => router.push(`/routes/${route.id}/edit`)}
              icon={<Feather name="edit-2" size={16} />}
            >
              Edit
            </Button>
          ) : null}
          <Button
            variant="solid"
            size="lg"
            flex={1}
            icon={<Feather name="navigation" size={18} color="#FFFFFF" />}
          >
            Start
          </Button>
        </XStack>
      </YStack>

      <SaveToCollectionModal
        visible={collectionModalVisible}
        routeId={route.id}
        onClose={() => setCollectionModalVisible(false)}
      />
    </YStack>
  )
}
