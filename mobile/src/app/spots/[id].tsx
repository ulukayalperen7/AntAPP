import React, { useEffect, useState, useTransition } from 'react'
import { Alert } from 'react-native'
import * as Location from 'expo-location'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { YStack, XStack, Text, Button, StatBox, RatingDisplay, ScrollView } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { getSpotById, getSpotRoutes, rateSpot, toggleSpotFavorite } from '@/features/spots/api'
import { pingHeatmap } from '@/features/heatmap/api'
import type { SpotDetail, SpotRouteItem } from '@/features/api/types'
import { SpotDetailSkeleton } from '@/components/loading/page-skeletons'
import { SpotMap } from '@/components/map/spot-map'

const CHECK_IN_RADIUS_METERS = 30000

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
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
        <Text variant="caption" color="$success500">Thanks for rating this spot.</Text>
      ) : null}
    </YStack>
  )
}

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [spot, setSpot] = useState<SpotDetail | null>(null)
  const [routes, setRoutes] = useState<SpotRouteItem[]>([])
  const [displayRating, setDisplayRating] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTogglingFavorite, startToggle] = useTransition()
  const [routesLoading, setRoutesLoading] = useState(false)
  const [routePage, setRoutePage] = useState(1)
  const [routeTotalPages, setRouteTotalPages] = useState(1)
  const [checkedIn, setCheckedIn] = useState(false)
  const [isCheckingIn, startCheckIn] = useTransition()

  useEffect(() => {
    if (!id) return

    let mounted = true
    setLoading(true)
    setError(null)

    getSpotById(id)
      .then((s) => {
        if (!mounted) return
        setSpot(s)
        setDisplayRating(s.averageRating)
        loadRoutes(id, 1)
      })
      .catch((e) => {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'Failed to load spot.')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => { mounted = false }
  }, [id])

  const loadRoutes = async (spotId: string, page: number) => {
    setRoutesLoading(true)
    try {
      const result = await getSpotRoutes(spotId, page, 10)
      setRoutes((prev) => page === 1 ? result.data : [...prev, ...result.data])
      setRoutePage(page)
      setRouteTotalPages(result.totalPages)
    } catch {}
    setRoutesLoading(false)
  }

  const handleCheckIn = () => {
    if (!spot) return
    startCheckIn(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Location required', 'Enable location access to check in.')
          return
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        const distance = haversineMeters(pos.coords.latitude, pos.coords.longitude, spot.latitude, spot.longitude)

        if (distance > CHECK_IN_RADIUS_METERS) {
          Alert.alert(
            'You are too far',
            `You need to be within ${CHECK_IN_RADIUS_METERS}m of this spot. Current distance: ${Math.round(distance)}m.`
          )
          return
        }

        await pingHeatmap(pos.coords.latitude, pos.coords.longitude)
        setCheckedIn(true)
      } catch (err) {
        Alert.alert('Check in failed', err instanceof Error ? err.message : 'Try again later.')
      }
    })
  }

  const handleToggleFavorite = () => {
    if (!spot) return
    startToggle(async () => {
      try {
        const nowFavorite = await toggleSpotFavorite(spot.id)
        setIsFavorite(nowFavorite)
      } catch {}
    })
  }

  if (loading) {
    return <SpotDetailSkeleton topInset={insets.top} />
  }

  if (!spot) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" padding="$5" gap="$3">
        <Text variant="heading4">Spot not found</Text>
        <Text variant="body" muted align="center">{error ?? 'Could not load this spot.'}</Text>
        <Button variant="outline" onPress={() => router.back()}>Go Back</Button>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingBottom={100}>
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
              <XStack
                cursor="pointer"
                onPress={handleToggleFavorite}
                padding="$2"
                opacity={isTogglingFavorite ? 0.5 : 1}
              >
                <Feather
                  name="heart"
                  size={20}
                  color={isFavorite ? '#EF4444' : '#FFFFFF'}
                />
              </XStack>
            </XStack>

            <Text variant="heading2" color="#FFFFFF">{spot.name}</Text>

            {displayRating > 0 ? (
              <XStack alignItems="center" gap="$2">
                <RatingDisplay value={displayRating} />
                <Text variant="caption" color="$ant200">
                  {displayRating.toFixed(1)} · {spot.ratingCount} ratings
                </Text>
              </XStack>
            ) : (
              <Text variant="caption" color="$ant400">No ratings yet</Text>
            )}
          </YStack>

          {/* Stats */}
          <XStack gap="$2" padding="$4" flexWrap="wrap">
            <StatBox value={spot.ratingCount} label="Ratings" flex={1} />
            <StatBox value={displayRating > 0 ? displayRating.toFixed(1) : '—'} label="Avg Score" flex={1} />
            <StatBox value={routes.length} label="Routes" flex={1} />
          </XStack>

          {/* Description */}
          {spot.description ? (
            <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$2">
              <Text variant="heading3">About this spot</Text>
              <Text variant="body" color="$mutedForeground">{spot.description}</Text>
            </YStack>
          ) : null}

          {/* Location */}
          <YStack paddingHorizontal="$4" paddingBottom="$4">
            <YStack
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              padding="$4"
              gap="$3"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <XStack alignItems="center" gap="$2">
                <Feather name="map-pin" size={16} color="var(--color-primary)" />
                <Text variant="heading4">Location</Text>
              </XStack>
              <YStack
                backgroundColor="$muted"
                borderRadius="$3"
                overflow="hidden"
                height={220}
                borderWidth={1}
                borderColor="$borderColor"
              >
                <SpotMap spot={spot} />
              </YStack>
              <Text variant="caption" muted>
                {spot.latitude.toFixed(5)}, {spot.longitude.toFixed(5)}
              </Text>
              <Button
                variant={checkedIn ? 'outline' : 'solid'}
                size="md"
                loading={isCheckingIn}
                disabled={isCheckingIn || checkedIn}
                onPress={handleCheckIn}
                icon={<Feather name="map-pin" size={16} color={checkedIn ? 'var(--color-primary)' : '#FFFFFF'} />}
              >
                {checkedIn ? 'Checked in' : "I'm here"}
              </Button>
            </YStack>
          </YStack>

          {/* Rating widget */}
          <YStack paddingHorizontal="$4" paddingBottom="$4">
            <YStack
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              padding="$4"
              gap="$4"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text variant="heading4">Your Rating</Text>
              <SpotRatingWidget
                spotId={spot.id}
                onRated={(score) => {
                  setDisplayRating((prev) => {
                    if (prev === 0) return score
                    return parseFloat(((prev + score) / 2).toFixed(1))
                  })
                }}
              />
            </YStack>
          </YStack>

          {/* Routes using this spot */}
          <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$3">
            <Text variant="heading3">Routes featuring this spot</Text>
            {routes.length === 0 && !routesLoading ? (
              <YStack
                padding="$5"
                borderRadius="$4"
                borderWidth={1}
                borderStyle="dashed"
                borderColor="$borderColor"
                alignItems="center"
                gap="$2"
              >
                <Feather name="map" size={28} color="var(--color-mutedForeground, #999)" />
                <Text variant="body" muted>No routes include this spot yet.</Text>
              </YStack>
            ) : (
              <YStack gap="$3">
                {routes.map((route) => (
                  <XStack
                    key={route.id}
                    backgroundColor="$backgroundStrong"
                    borderRadius="$4"
                    padding="$4"
                    borderWidth={1}
                    borderColor="$borderColor"
                    gap="$3"
                    alignItems="center"
                    cursor="pointer"
                    onPress={() => router.push(`/routes/${route.id}`)}
                    pressStyle={{ opacity: 0.85 }}
                  >
                    <YStack
                      width={40}
                      height={40}
                      borderRadius="$3"
                      backgroundColor="$primary50"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Feather name="navigation" size={16} color="var(--color-primary)" />
                    </YStack>
                    <YStack flex={1} gap="$1">
                      <Text variant="heading4" numberOfLines={1}>{route.title}</Text>
                      {route.description ? (
                        <Text variant="caption" muted numberOfLines={1}>{route.description}</Text>
                      ) : null}
                      {route.averageRating > 0 ? (
                        <XStack alignItems="center" gap="$1">
                          <RatingDisplay value={route.averageRating} />
                          <Text variant="caption" muted>{route.averageRating.toFixed(1)}</Text>
                        </XStack>
                      ) : null}
                    </YStack>
                    <Feather name="chevron-right" size={16} color="var(--color-mutedForeground, #999)" />
                  </XStack>
                ))}
              </YStack>
            )}

            {routePage < routeTotalPages ? (
              <Button
                variant="outline"
                size="md"
                loading={routesLoading}
                disabled={routesLoading}
                onPress={() => loadRoutes(spot.id, routePage + 1)}
              >
                Load More Routes
              </Button>
            ) : null}
          </YStack>
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
      >
        <Button
          variant={isFavorite ? 'outline' : 'solid'}
          size="lg"
          loading={isTogglingFavorite}
          disabled={isTogglingFavorite}
          onPress={handleToggleFavorite}
          icon={<Feather name="heart" size={18} color={isFavorite ? 'var(--color-primary)' : '#FFFFFF'} />}
        >
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </Button>
      </YStack>
    </YStack>
  )
}
