'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Badge, RouteCard, RatingDisplay } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import type { SpotDetail, SpotRatingResult, SpotRouteItem } from '@/types/api'
import { rateSpot, toggleSpotFavorite, getSavedSpots } from '@/features/spots/actions'
import { pingHeatmap } from '@/features/heatmap/actions'
import { ArrowLeft, MapPinned, Route as RouteIcon, Star, Heart, MapPin } from 'lucide-react'
import { loadMapLibre, runWhenBrowserIdle } from '@/lib/maplibre'

const CHECK_IN_RADIUS_METERS = 30000

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

type SpotPreviewMap = {
  addControl: (control: unknown, position?: string) => void
  remove: () => void
}

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
  initialRating,
  onRated,
}: {
  spotId: string
  initialRating?: number | null
  onRated: (result: SpotRatingResult) => void
}) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(initialRating || 0)
  const [submitted, setSubmitted] = useState(!!initialRating)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (initialRating) {
      setSelected(initialRating)
      setSubmitted(true)
    }
  }, [initialRating])

  const active = hovered || selected

  const handleRate = (score: number) => {
    if (isPending) return

    setSelected(score)
    startTransition(async () => {
      try {
        const result = await rateSpot(spotId, score)
        setSubmitted(true)
        onRated(result)
      } catch {
        setSelected(0)
      }
    })
  }

  if (submitted && selected > 0) {
    return (
      <XStack alignItems="center" gap="$2" padding="$3" backgroundColor="$success50" borderRadius="$3" onPress={() => setSubmitted(false)} cursor="pointer">
        <Star size={16} fill="var(--color-success500, #22C55E)" color="var(--color-success500, #22C55E)" />
        <Text variant="caption" color="$success500">Thanks! You rated this {selected}/5 (Click to change)</Text>
      </XStack>
    )
  }

  return (
    <YStack gap="$2">
      <Text variant="label" color="$mutedForeground">Rate this spot</Text>
      <XStack gap="$1.5" alignItems="center">
        {[1, 2, 3, 4, 5].map((score) => (
          <XStack
            key={score}
            padding="$1"
            borderRadius="$2"
            cursor={isPending ? 'default' : 'pointer'}
            onPress={() => handleRate(score)}

            onMouseEnter={() => !isPending && setHovered(score)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star
              size={26}
              fill={score <= active ? '#FF8C00' : 'rgba(148,163,184,0.18)'}
              color={score <= active ? '#FF8C00' : '#64748B'}
              strokeWidth={1.8}
            />
          </XStack>
        ))}
        {isPending && <Text variant="caption" muted>Saving...</Text>}
      </XStack>
    </YStack>
  )
}

export default function SpotDetailClient({
  spot,
  routeLabel,
  initialRoutes,
}: {
  spot: SpotDetail
  routeLabel?: string
  initialRoutes: SpotRouteItem[]
}) {
  const router = useRouter()
  const [displayRating, setDisplayRating] = useState(spot.averageRating)
  const [displayRatingCount, setDisplayRatingCount] = useState(spot.ratingCount)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, startSavingTransition] = useTransition()
  const [checkedIn, setCheckedIn] = useState(false)
  const [isCheckingIn, startCheckIn] = useTransition()
  const [checkInError, setCheckInError] = useState<string | null>(null)
  const [spotMapError, setSpotMapError] = useState<string | null>(null)
  const spotMapContainerRef = useRef<HTMLDivElement | null>(null)
  const spotMapRef = useRef<SpotPreviewMap | null>(null)
  const hasValidCoordinates = Number.isFinite(spot.latitude) && Number.isFinite(spot.longitude)
  const [shouldLoadMap, setShouldLoadMap] = useState(false)

  useEffect(() => {
    getSavedSpots().then(spots => {
      setIsSaved(spots.some(s => s.id === spot.id))
    }).catch(() => { })
  }, [spot.id])

  useEffect(() => runWhenBrowserIdle(() => setShouldLoadMap(true)), [])

  useEffect(() => {
    if (!shouldLoadMap || !hasValidCoordinates || !spotMapContainerRef.current || spotMapRef.current) return

    let cancelled = false

    const initSpotMap = async () => {
      try {
        const maplibre = await loadMapLibre()
        if (cancelled || !spotMapContainerRef.current || spotMapRef.current) return

        const map = new maplibre.Map({
          container: spotMapContainerRef.current,
          style: 'https://tiles.openfreemap.org/styles/liberty',
          center: [spot.longitude, spot.latitude],
          zoom: 14,
        })

        map.addControl(new maplibre.NavigationControl(), 'top-right')

        const markerEl = document.createElement('div')
        markerEl.style.width = '16px'
        markerEl.style.height = '16px'
        markerEl.style.borderRadius = '50%'
        markerEl.style.backgroundColor = '#FF8C00'
        markerEl.style.border = '2px solid #FFFFFF'
        markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)'

        new maplibre.Marker({ element: markerEl })
          .setLngLat([spot.longitude, spot.latitude])
          .setPopup(new maplibre.Popup({ closeButton: false, closeOnClick: false }).setText(spot.name))
          .addTo(map)
          .togglePopup()

        spotMapRef.current = map as unknown as SpotPreviewMap
        setSpotMapError(null)
      } catch {
        if (!cancelled) {
          setSpotMapError('Location map could not be loaded.')
        }
      }
    }

    void initSpotMap()

    return () => {
      cancelled = true
      if (spotMapRef.current) {
        spotMapRef.current.remove()
      }
      spotMapRef.current = null
    }
  }, [hasValidCoordinates, shouldLoadMap, spot.latitude, spot.longitude, spot.name])

  const handleToggleSave = () => {
    startSavingTransition(async () => {
      try {
        const saved = await toggleSpotFavorite(spot.id)
        setIsSaved(saved)
      } catch {
        // Ignored
      }
    })
  }

  const handleCheckIn = () => {
    setCheckInError(null)

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setCheckInError('Geolocation not supported in this browser.')
      return
    }

    startCheckIn(() => {
      return new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const distance = haversineMeters(pos.coords.latitude, pos.coords.longitude, spot.latitude, spot.longitude)
              if (distance > CHECK_IN_RADIUS_METERS) {
                setCheckInError(`Too far from spot (${Math.round(distance)}m). Get within ${CHECK_IN_RADIUS_METERS}m.`)
                resolve()
                return
              }
              await pingHeatmap(pos.coords.latitude, pos.coords.longitude)
              setCheckedIn(true)
            } catch (err) {
              setCheckInError(err instanceof Error ? err.message : 'Check in failed.')
            } finally {
              resolve()
            }
          },
          (err) => {
            setCheckInError(err.message || 'Could not read your location.')
            resolve()
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 },
        )
      })
    })
  }

  return (
    <YStack gap="$5" flex={1}>
      <XStack alignItems="center" gap="$3">
        <Button variant="ghost" size="sm" onPress={() => router.back()} icon={<ArrowLeft size={16} color="currentColor" />}>
          Back
        </Button>
        <YStack flex={1}>
          <Text variant="heading2">{spot.name}</Text>
          <Text variant="body" muted>Spot details and related routes</Text>
          {routeLabel && routeLabel.trim() && routeLabel.trim() !== spot.name && (
            <Text variant="caption" color="$mutedForeground">
              This stop was labeled as &quot;{routeLabel}&quot; inside the route.
            </Text>
          )}
        </YStack>
      </XStack>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', alignItems: 'start' }}>
        <YStack gap="$5">
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
                <img
                  src={spot.photoUrl}
                  alt={spot.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    display: 'block',
                  }}
                />
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

          <YStack
            backgroundColor="$backgroundStrong"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            overflow="hidden"
          >
            <XStack justifyContent="space-between" alignItems="center" padding="$4" borderBottomWidth={1} borderColor="$borderColor">
              <Text variant="heading4">Location on map</Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => window.open(`https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`, '_blank')}
                disabled={!hasValidCoordinates}
              >
                Open in Maps
              </Button>
            </XStack>

            <YStack height={220} backgroundColor="$muted" position="relative">
              {hasValidCoordinates ? (
                <div
                  ref={spotMapContainerRef}
                  style={{ width: '100%', height: '100%' }}
                  aria-label="Spot location map preview"
                />
              ) : (
                <YStack flex={1} alignItems="center" justifyContent="center" gap="$2">
                  <MapPinned size={28} color="var(--color-mutedForeground)" />
                  <Text variant="caption" muted>Location coordinates are unavailable for this spot.</Text>
                </YStack>
              )}

              {spotMapError ? (
                <YStack
                  position="absolute"
                  inset={0}
                  alignItems="center"
                  justifyContent="center"
                  gap="$1.5"
                  backgroundColor="rgba(255,255,255,0.86)"
                >
                  <MapPinned size={22} color="var(--color-mutedForeground)" />
                  <Text variant="caption" muted>{spotMapError}</Text>
                </YStack>
              ) : null}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {initialRoutes.map((route) => (
                  <RouteCard
                    key={route.id}
                    data={routeToCardData(route)}
                    onPress={() => router.push(`/routes/${route.id}`)}
                  />
                ))}
              </div>
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

            <Button
              variant={isSaved ? 'outline' : 'solid'}
              theme={isSaved ? 'active' : undefined}
              size="md"
              icon={<Heart size={18} color={isSaved ? '#ff4757' : 'white'} fill={isSaved ? '#ff4757' : 'transparent'} />}
              onPress={handleToggleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Updating...' : (isSaved ? 'Saved in Favorites' : 'Save this Spot')}
            </Button>

            <Button
              variant={checkedIn ? 'outline' : 'solid'}
              size="md"
              icon={<MapPin size={18} color={checkedIn ? 'var(--color-primary)' : 'white'} />}
              onPress={handleCheckIn}
              disabled={isCheckingIn || checkedIn}
            >
              {isCheckingIn ? 'Locating...' : (checkedIn ? 'Checked in' : "I'm here")}
            </Button>
            {checkInError ? (
              <Text variant="caption" color="$error500">{checkInError}</Text>
            ) : null}

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
              initialRating={spot.currentUserRating}
              onRated={(result) => {
                setDisplayRating(result.averageRating)
                setDisplayRatingCount(result.ratingCount)
              }}
            />
          </YStack>
        </YStack>
      </div>
    </YStack>
  )
}
