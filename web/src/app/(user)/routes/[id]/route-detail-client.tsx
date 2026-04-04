'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, StatBox, RatingDisplay, ProgressBar } from '@antapp/ui'
import type { RouteDetail } from '@/types/api'
import { Navigation, Bookmark, BookmarkCheck, Map, Star, GitFork, Pencil } from 'lucide-react'
import { saveRoute } from '@/features/collections/actions'
import { rateRoute, forkRoute } from '@/features/routes/actions'

// ─── Star Rating Widget ───────────────────────────────────────────────────────

function StarRatingWidget({
  routeId,
  onRated,
}: {
  routeId: string
  onRated: (score: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [isSubmitting, startSubmit] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  const handleRate = (score: number) => {
    if (submitted) return
    setSelected(score)
    startSubmit(async () => {
      try {
        await rateRoute(routeId, score)
        setSubmitted(true)
        onRated(score)
      } catch {
        setSelected(0)
      }
    })
  }

  const active = hovered || selected

  if (submitted) {
    return (
      <XStack alignItems="center" gap="$2" padding="$3" backgroundColor="$success50" borderRadius="$3">
        <Star size={16} fill="var(--color-success500, #22C55E)" color="var(--color-success500, #22C55E)" />
        <Text variant="caption" color="$success500">Thanks! You rated this {selected}/5</Text>
      </XStack>
    )
  }

  return (
    <YStack gap="$2">
      <Text variant="label" color="$mutedForeground">Rate This Route</Text>
      <XStack gap="$1.5" alignItems="center">
        {[1, 2, 3, 4, 5].map((star) => (
          <XStack
            key={star}
            cursor={isSubmitting ? 'default' : 'pointer'}
            onPress={() => handleRate(star)}
            padding="$1"
            borderRadius="$2"
            // @ts-ignore — web-only mouse events
            onMouseEnter={() => !isSubmitting && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star
              size={28}
              fill={star <= active ? '#FF8C00' : 'transparent'}
              color={star <= active ? '#FF8C00' : 'var(--color-mutedForeground)'}
              strokeWidth={1.5}
            />
          </XStack>
        ))}
        {isSubmitting && <Text variant="caption" muted>Saving...</Text>}
      </XStack>
    </YStack>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RouteDetailClient({
  route,
  isOwner = false,
}: {
  route: RouteDetail
  isOwner?: boolean
}) {
  const router = useRouter()

  // Save state
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, startSaving] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)

  // Fork state
  const [isForking, startFork] = useTransition()
  const [forkError, setForkError] = useState<string | null>(null)

  // Rating state
  const [displayRating, setDisplayRating] = useState(route.averageRating)

  const handleSave = () => {
    if (isSaved) return
    setSaveError(null)
    startSaving(async () => {
      try {
        await saveRoute(route.id)
        setIsSaved(true)
      } catch (e) {
        setSaveError((e as Error).message ?? 'Failed to save')
      }
    })
  }

  const handleFork = () => {
    setForkError(null)
    startFork(async () => {
      try {
        const forkedId = await forkRoute(route.id)
        router.push(`/routes/${forkedId}`)
      } catch (e) {
        setForkError((e as Error).message ?? 'Failed to fork route')
      }
    })
  }

  return (
    <YStack gap="$5" flex={1}>
      {/* Hero Banner */}
      <YStack
        backgroundColor="$ant900"
        borderRadius="$4"
        padding="$6"
        minHeight={240}
        justifyContent="flex-end"
        position="relative"
        overflow="hidden"
      >
        {route.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={route.thumbnailUrl}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}
          />
        )}
        <XStack position="absolute" top={0} left={0} right={0} bottom={0} backgroundColor="$ant800" opacity={0.5} />

        {/* Owner badge */}
        {isOwner && (
          <XStack
            position="absolute"
            top="$4"
            right="$4"
            backgroundColor="rgba(255,255,255,0.15)"
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            borderRadius="$2"
            gap="$1.5"
            alignItems="center"
          >
            <Pencil size={12} color="#fff" />
            <Text variant="caption" color="#FFFFFF">Your Route</Text>
          </XStack>
        )}

        <YStack zIndex={1} gap="$3">
          <YStack gap="$1">
            <Text variant="heading1" color="#FFFFFF">{route.title}</Text>
            {displayRating > 0 && (
              <XStack alignItems="center" gap="$3" flexWrap="wrap">
                <RatingDisplay value={displayRating} />
                <Text variant="caption" color="$ant200">{displayRating.toFixed(1)} avg rating</Text>
              </XStack>
            )}
          </YStack>

          <XStack gap="$2.5" flexWrap="wrap" marginTop="$1">
            <Button variant="solid" size="md" onPress={() => {}}>
              <XStack alignItems="center" gap="$1.5">
                <Navigation size={16} color="#FFFFFF" />
                <Text variant="label" color="#FFFFFF">Start Navigation</Text>
              </XStack>
            </Button>

            <Button
              variant="outline"
              size="md"
              loading={isSaving}
              disabled={isSaved || isSaving}
              onPress={handleSave}
              // @ts-ignore — web style override
              style={{ backgroundColor: isSaved ? 'rgba(255,255,255,0.2)' : undefined }}
            >
              <XStack alignItems="center" gap="$1.5">
                {isSaved
                  ? <BookmarkCheck size={16} color="#FFFFFF" />
                  : <Bookmark size={16} color="currentColor" />
                }
                <Text variant="label" color={isSaved ? '#FFFFFF' : undefined}>
                  {isSaved ? 'Saved!' : 'Save'}
                </Text>
              </XStack>
            </Button>

            {isOwner && (
              <Button
                variant="ghost"
                size="md"
                onPress={() => router.push(`/routes/${route.id}/edit`)}
                // @ts-ignore
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <XStack alignItems="center" gap="$1.5">
                  <Pencil size={16} color="#FFFFFF" />
                  <Text variant="label" color="#FFFFFF">Edit</Text>
                </XStack>
              </Button>
            )}
          </XStack>

          {saveError && (
            <Text variant="caption" color="$error500">{saveError}</Text>
          )}
        </YStack>
      </YStack>

      {/* Stats Bar */}
      <XStack gap="$3" flexWrap="wrap">
        <StatBox value={`${route.stops.length}`} label="Stops" icon={<Map size={22} color="var(--color-primary)" />} />
        {displayRating > 0 && (
          <StatBox value={displayRating.toFixed(1)} label="Avg Rating" />
        )}
      </XStack>

      {/* Two Column Layout */}
      <XStack gap="$5" flexWrap="wrap">
        {/* Left Column */}
        <YStack flex={2} minWidth={400} gap="$5">
          {/* About */}
          {route.description && (
            <YStack gap="$2">
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
              <YStack gap="$3">
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
                        <YStack width={2} height={44} backgroundColor="$borderColor" />
                      )}
                    </YStack>
                    <YStack
                      flex={1}
                      backgroundColor="$backgroundStrong"
                      borderRadius="$3"
                      padding="$4"
                      gap="$1.5"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <Text variant="heading4">{stop.name}</Text>
                      {stop.description && (
                        <Text variant="body" muted>{stop.description}</Text>
                      )}
                      {stop.photoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={stop.photoUrl}
                          alt={stop.name}
                          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
                        />
                      )}
                    </YStack>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          )}
        </YStack>

        {/* Right Sidebar */}
        <YStack flex={1} minWidth={280} gap="$4">
          {/* Rating Widget */}
          {!isOwner && (
            <YStack
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              padding="$4"
              gap="$3"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text variant="heading4">Rate This Route</Text>
              <StarRatingWidget
                routeId={route.id}
                onRated={(score) => {
                  // Optimistically blend the new score into averageRating
                  setDisplayRating((prev) =>
                    parseFloat(((prev + score) / 2).toFixed(1))
                  )
                }}
              />
            </YStack>
          )}

          {/* Rating Summary */}
          {displayRating > 0 && (
            <YStack
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              padding="$4"
              gap="$3"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text variant="heading4">Ratings</Text>
              <XStack alignItems="center" gap="$3">
                <Text fontFamily="$heading" fontSize="$11" fontWeight="700" color="$color">
                  {displayRating.toFixed(1)}
                </Text>
                <YStack gap="$1">
                  <RatingDisplay value={displayRating} showValue={false} />
                  <Text variant="caption" muted>AVERAGE SCORE</Text>
                </YStack>
              </XStack>
            </YStack>
          )}

          {/* Fork Route */}
          <YStack
            backgroundColor="$backgroundStrong"
            borderRadius="$4"
            padding="$4"
            gap="$3"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <XStack alignItems="center" gap="$2">
              <GitFork size={18} color="var(--color-primary)" />
              <Text variant="heading4">Use This Route</Text>
            </XStack>
            <Text variant="body" muted>
              Fork this route to customize it for your own adventure.
            </Text>
            {forkError && (
              <Text variant="caption" color="$error500">{forkError}</Text>
            )}
            <Button
              variant="outline"
              size="md"
              loading={isForking}
              disabled={isForking}
              onPress={handleFork}
              icon={<GitFork size={16} color="currentColor" />}
            >
              Fork Route
            </Button>
          </YStack>
        </YStack>
      </XStack>
    </YStack>
  )
}
