'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Input, Badge } from '@antapp/ui'
import type { BusinessSpotItem } from '@/types/api'
import { logout } from '@/features/auth/actions'
import {
  getBusinessSpots,
  createBusinessSpot,
  updateBusinessSpot,
  deleteBusinessSpot,
} from '@/features/spots/actions'
import { EmptyState } from '@/components/empty-state'
import {
  Building2,
  Compass,
  Copy,
  Edit3,
  LogOut,
  MapPinned,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

type FeedbackState = {
  ok: boolean
  message: string
} | null

type SpotFormState = {
  name: string
  description: string
  photoUrl: string
  latitude: string
  longitude: string
}

function createEmptyForm(): SpotFormState {
  return {
    name: '',
    description: '',
    photoUrl: '',
    latitude: '',
    longitude: '',
  }
}

function parseCoordinate(value: string) {
  const normalized = value.replace(',', '.').trim()
  if (!normalized) return null

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function validateSpotForm(form: SpotFormState):
  | { error: string }
  | {
    data: {
      name: string
      description?: string
      photoUrl?: string
      latitude: number
      longitude: number
    }
  } {
  if (!form.name.trim()) {
    return { error: 'Spot name is required.' }
  }

  const latitude = parseCoordinate(form.latitude)
  const longitude = parseCoordinate(form.longitude)

  if (latitude === null || longitude === null || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return { error: 'Latitude and longitude must be valid numbers.' }
  }

  if (latitude < -90 || latitude > 90) {
    return { error: 'Latitude must be between -90 and 90.' }
  }

  if (longitude < -180 || longitude > 180) {
    return { error: 'Longitude must be between -180 and 180.' }
  }

  return {
    data: {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      photoUrl: form.photoUrl.trim() || undefined,
      latitude,
      longitude,
    },
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(value))
}

export default function BusinessSpotsClient({
  userName,
  email,
  roles,
  isAdmin,
  initialSpots,
  initialTotal,
}: {
  userName: string
  email: string
  roles: string[]
  isAdmin: boolean
  initialSpots: BusinessSpotItem[]
  initialTotal: number
}) {
  const router = useRouter()

  const [spots, setSpots] = useState(initialSpots)
  const [total, setTotal] = useState(initialTotal)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [createForm, setCreateForm] = useState<SpotFormState>(createEmptyForm())
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<SpotFormState>(createEmptyForm())
  const [isPending, startTransition] = useTransition()
  const [isLoggingOut, startLogoutTransition] = useTransition()

  const refreshSpots = async (successMessage?: string) => {
    const result = await getBusinessSpots(1, 50)
    setSpots(result.data)
    setTotal(result.totalRecords)

    if (successMessage) {
      setFeedback({ ok: true, message: successMessage })
    }
  }

  const handleCreate = () => {
    setFeedback(null)
    const result = validateSpotForm(createForm)

    if ('error' in result) {
      setFeedback({ ok: false, message: result.error })
      return
    }

    startTransition(async () => {
      try {
        await createBusinessSpot(result.data)
        setCreateForm(createEmptyForm())
        await refreshSpots('Spot created successfully.')
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to create spot.' })
      }
    })
  }

  const handleStartEdit = (spot: BusinessSpotItem) => {
    setEditingSpotId(spot.id)
    setEditForm({
      name: spot.name,
      description: spot.description ?? '',
      photoUrl: spot.photoUrl ?? '',
      latitude: String(spot.latitude),
      longitude: String(spot.longitude),
    })
    setFeedback(null)
  }

  const handleCancelEdit = () => {
    setEditingSpotId(null)
    setEditForm(createEmptyForm())
  }

  const handleSaveEdit = (spotId: string) => {
    setFeedback(null)
    const result = validateSpotForm(editForm)

    if ('error' in result) {
      setFeedback({ ok: false, message: result.error })
      return
    }

    startTransition(async () => {
      try {
        await updateBusinessSpot(spotId, result.data)
        await refreshSpots('Spot updated successfully.')
        handleCancelEdit()
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to update spot.' })
      }
    })
  }

  const handleDelete = (spotId: string) => {
    if (!window.confirm('Delete this spot? This action cannot be undone.')) {
      return
    }

    setFeedback(null)
    startTransition(async () => {
      try {
        await deleteBusinessSpot(spotId)
        if (editingSpotId === spotId) {
          handleCancelEdit()
        }
        await refreshSpots('Spot deleted successfully.')
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to delete spot.' })
      }
    })
  }

  const handleCopyId = async (spotId: string) => {
    try {
      await navigator.clipboard.writeText(spotId)
      setFeedback({ ok: true, message: 'Spot ID copied. You can paste it into route stops.' })
    } catch {
      setFeedback({ ok: false, message: 'Could not copy Spot ID.' })
    }
  }

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logout()
    })
  }

  const averageRating = useMemo(() => {
    if (spots.length === 0) return 0
    return spots.reduce((sum, spot) => sum + spot.averageRating, 0) / spots.length
  }, [spots])

  const activeCount = spots.filter((spot) => spot.isActive).length

  return (
    <YStack maxWidth={1240} marginHorizontal="auto" padding="$5" gap="$5">
      <YStack
        padding="$6"
        borderRadius="$5"
        backgroundColor="$primary"
        gap="$5"
        overflow="hidden"
        position="relative"
      >
        <YStack gap="$4" zIndex={1}>
          <XStack justifyContent="space-between" alignItems="flex-start" gap="$3" flexWrap="wrap">
            <YStack gap="$2" maxWidth={760}>
              <XStack alignItems="center" gap="$2">
                <Sparkles size={18} color="#FFFFFF" />
                <Text variant="caption" color="#FFFFFF">BUSINESS PANEL</Text>
              </XStack>
              <Text variant="heading1" color="#FFFFFF">Manage the spots behind your routes</Text>
              <Text variant="bodyLarge" color="#FFFFFF">
                Create and maintain your business spots here, then copy their IDs into route stop planning.
              </Text>
            </YStack>

            <XStack gap="$2" flexWrap="wrap">
              <Button
                variant="outline"
                size="sm"
                onPress={() => router.push('/')}
                icon={<Compass size={14} color="currentColor" />}
              >
                User
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled
                icon={<Building2 size={14} color="#FFFFFF" />}
              >
                Business
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => router.push('/admin')}
                  icon={<Shield size={14} color="currentColor" />}
                >
                  Admin
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onPress={handleLogout}
                loading={isLoggingOut}
                icon={<LogOut size={14} color="#FFFFFF" />}
              >
                Sign Out
              </Button>
            </XStack>
          </XStack>

          <XStack gap="$3" flexWrap="wrap">
            <YStack
              minWidth={180}
              padding="$4"
              borderRadius="$4"
              backgroundColor="rgba(255,255,255,0.12)"
              borderWidth={1}
              borderColor="rgba(255,255,255,0.2)"
              gap="$1"
            >
              <Text variant="caption" color="#FFFFFF">Signed in as</Text>
              <Text variant="heading4" color="#FFFFFF">{userName}</Text>
              <Text variant="caption" color="#FFFFFF">{email}</Text>
            </YStack>

            <YStack
              minWidth={180}
              padding="$4"
              borderRadius="$4"
              backgroundColor="rgba(255,255,255,0.12)"
              borderWidth={1}
              borderColor="rgba(255,255,255,0.2)"
              gap="$1"
            >
              <Text variant="caption" color="#FFFFFF">Roles</Text>
              <Text variant="heading4" color="#FFFFFF">{roles.join(', ')}</Text>
              <Text variant="caption" color="#FFFFFF">Business access is active</Text>
            </YStack>
          </XStack>
        </YStack>
      </YStack>

      <XStack gap="$3" flexWrap="wrap">
        <YStack flex={1} minWidth={220} backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$1.5" borderWidth={1} borderColor="$borderColor">
          <Text variant="caption" color="$mutedForeground">Total spots</Text>
          <Text variant="heading2">{total}</Text>
          <Text variant="body" muted>Published in your business catalog</Text>
        </YStack>
        <YStack flex={1} minWidth={220} backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$1.5" borderWidth={1} borderColor="$borderColor">
          <Text variant="caption" color="$mutedForeground">Active</Text>
          <Text variant="heading2">{activeCount}</Text>
          <Text variant="body" muted>Ready to be used in routes</Text>
        </YStack>
        <YStack flex={1} minWidth={220} backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$1.5" borderWidth={1} borderColor="$borderColor">
          <Text variant="caption" color="$mutedForeground">Average rating</Text>
          <Text variant="heading2">{averageRating > 0 ? averageRating.toFixed(1) : '—'}</Text>
          <Text variant="body" muted>Based on visible spot ratings</Text>
        </YStack>
      </XStack>

      {feedback && (
        <XStack
          alignItems="center"
          gap="$2"
          padding="$3"
          borderRadius="$3"
          borderWidth={1}
          borderColor={feedback.ok ? '$success200' : '$error200'}
          backgroundColor={feedback.ok ? '$success50' : '$error50'}
        >
          <Text variant="body" color={feedback.ok ? '$success500' : '$error500'}>
            {feedback.message}
          </Text>
        </XStack>
      )}

      <XStack gap="$5" flexWrap="wrap" alignItems="flex-start">
        <YStack
          flex={1}
          minWidth={320}
          maxWidth={420}
          backgroundColor="$backgroundStrong"
          borderRadius="$4"
          padding="$5"
          gap="$4"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <YStack gap="$1">
            <Text variant="heading3">Create new spot</Text>
            <Text variant="body" muted>
              Add a destination your business can reuse across routes.
            </Text>
          </YStack>

          <YStack gap="$3">
            <YStack gap="$1.5">
              <Text variant="label" color="$mutedForeground">Name *</Text>
              <Input
                value={createForm.name}
                onChangeText={(value) => setCreateForm((prev) => ({ ...prev, name: value }))}
                variant="outline"
                size="md"
                placeholder="e.g. Cliffside Breakfast Terrace"
              />
            </YStack>

            <YStack gap="$1.5">
              <Text variant="label" color="$mutedForeground">Description</Text>
              <Input
                value={createForm.description}
                onChangeText={(value) => setCreateForm((prev) => ({ ...prev, description: value }))}
                variant="outline"
                size="md"
                placeholder="Tell visitors why this stop matters"
                // @ts-ignore multiline web
                multiline
                numberOfLines={4}
              />
            </YStack>

            <YStack gap="$1.5">
              <Text variant="label" color="$mutedForeground">Photo URL</Text>
              <Input
                value={createForm.photoUrl}
                onChangeText={(value) => setCreateForm((prev) => ({ ...prev, photoUrl: value }))}
                variant="outline"
                size="md"
                placeholder="https://..."
                autoCapitalize="none"
              />
            </YStack>

            <XStack gap="$3" flexWrap="wrap">
              <YStack flex={1} minWidth={140} gap="$1.5">
                <Text variant="label" color="$mutedForeground">Latitude *</Text>
                <Input
                  value={createForm.latitude}
                  onChangeText={(value) => setCreateForm((prev) => ({ ...prev, latitude: value }))}
                  variant="outline"
                  size="md"
                  placeholder="36.8841"
                />
              </YStack>
              <YStack flex={1} minWidth={140} gap="$1.5">
                <Text variant="label" color="$mutedForeground">Longitude *</Text>
                <Input
                  value={createForm.longitude}
                  onChangeText={(value) => setCreateForm((prev) => ({ ...prev, longitude: value }))}
                  variant="outline"
                  size="md"
                  placeholder="30.7056"
                />
              </YStack>
            </XStack>
          </YStack>

          <Button
            variant="solid"
            size="md"
            onPress={handleCreate}
            loading={isPending}
            disabled={isPending}
            icon={<Plus size={16} color="#FFFFFF" />}
          >
            Create Spot
          </Button>
        </YStack>

        <YStack flex={2} minWidth={360} gap="$4">
          <XStack justifyContent="space-between" alignItems="flex-start" gap="$3" flexWrap="wrap">
            <YStack gap="$1">
              <Text variant="heading3">Your spots</Text>
              <Text variant="body" muted>
                Copy IDs from here while editing route stops.
              </Text>
            </YStack>
            <Badge variant="info" size="md">Showing {spots.length}</Badge>
          </XStack>

          {spots.length === 0 ? (
            <YStack backgroundColor="$backgroundStrong" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
              <EmptyState
                Icon={MapPinned}
                title="No spots yet"
                description="Create your first business spot to start building route-ready destinations."
              />
            </YStack>
          ) : (
            <YStack gap="$4">
              {spots.map((spot) => {
                const isEditing = editingSpotId === spot.id

                return (
                  <YStack
                    key={spot.id}
                    backgroundColor="$backgroundStrong"
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor="$borderColor"
                    overflow="hidden"
                  >
                    <XStack gap="$0" flexWrap="wrap">
                      <YStack
                        width={220}
                        minHeight={220}
                        backgroundColor="$muted"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        flexShrink={0}
                      >
                        {spot.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={spot.photoUrl}
                            alt={spot.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <MapPinned size={40} color="var(--color-mutedForeground)" />
                        )}
                      </YStack>

                      <YStack flex={1} minWidth={320} padding="$4" gap="$4">
                        <XStack justifyContent="space-between" alignItems="flex-start" gap="$3" flexWrap="wrap">
                          <YStack gap="$1" flex={1} minWidth={220}>
                            <Text variant="heading3">{spot.name}</Text>
                            <Text variant="caption" muted>{spot.id}</Text>
                          </YStack>

                          <XStack gap="$2" flexWrap="wrap">
                            <Badge variant={spot.isActive ? 'success' : 'warning'} size="sm">
                              {spot.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {spot.averageRating > 0 && (
                              <Badge variant="info" size="sm">{spot.averageRating.toFixed(1)} / 5</Badge>
                            )}
                          </XStack>
                        </XStack>

                        {isEditing ? (
                          <YStack gap="$3">
                            <YStack gap="$1.5">
                              <Text variant="label" color="$mutedForeground">Name *</Text>
                              <Input
                                value={editForm.name}
                                onChangeText={(value) => setEditForm((prev) => ({ ...prev, name: value }))}
                                variant="outline"
                                size="md"
                              />
                            </YStack>

                            <YStack gap="$1.5">
                              <Text variant="label" color="$mutedForeground">Description</Text>
                              <Input
                                value={editForm.description}
                                onChangeText={(value) => setEditForm((prev) => ({ ...prev, description: value }))}
                                variant="outline"
                                size="md"
                                // @ts-ignore multiline web
                                multiline
                                numberOfLines={4}
                              />
                            </YStack>

                            <YStack gap="$1.5">
                              <Text variant="label" color="$mutedForeground">Photo URL</Text>
                              <Input
                                value={editForm.photoUrl}
                                onChangeText={(value) => setEditForm((prev) => ({ ...prev, photoUrl: value }))}
                                variant="outline"
                                size="md"
                                autoCapitalize="none"
                              />
                            </YStack>

                            <XStack gap="$3" flexWrap="wrap">
                              <YStack flex={1} minWidth={140} gap="$1.5">
                                <Text variant="label" color="$mutedForeground">Latitude *</Text>
                                <Input
                                  value={editForm.latitude}
                                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, latitude: value }))}
                                  variant="outline"
                                  size="md"
                                />
                              </YStack>
                              <YStack flex={1} minWidth={140} gap="$1.5">
                                <Text variant="label" color="$mutedForeground">Longitude *</Text>
                                <Input
                                  value={editForm.longitude}
                                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, longitude: value }))}
                                  variant="outline"
                                  size="md"
                                />
                              </YStack>
                            </XStack>

                            <XStack gap="$2" flexWrap="wrap">
                              <Button
                                variant="solid"
                                size="sm"
                                onPress={() => handleSaveEdit(spot.id)}
                                loading={isPending}
                                disabled={isPending}
                                icon={<Edit3 size={14} color="#FFFFFF" />}
                              >
                                Save Changes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onPress={handleCancelEdit}
                                disabled={isPending}
                                icon={<X size={14} color="currentColor" />}
                              >
                                Cancel
                              </Button>
                            </XStack>
                          </YStack>
                        ) : (
                          <>
                            <YStack gap="$2">
                              <Text variant="body">{spot.description || 'No description yet.'}</Text>
                              <XStack gap="$2" flexWrap="wrap">
                                <Badge variant="default" size="sm">Lat {spot.latitude.toFixed(4)}</Badge>
                                <Badge variant="default" size="sm">Lng {spot.longitude.toFixed(4)}</Badge>
                                <Badge variant="default" size="sm">Created {formatDate(spot.createdAt)}</Badge>
                                {spot.averageRating > 0 && (
                                  <Badge variant="default" size="sm">Rated</Badge>
                                )}
                              </XStack>
                            </YStack>

                            <XStack gap="$2" flexWrap="wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onPress={() => handleCopyId(spot.id)}
                                icon={<Copy size={14} color="currentColor" />}
                              >
                                Copy ID
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onPress={() => handleStartEdit(spot)}
                                icon={<Edit3 size={14} color="currentColor" />}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onPress={() => handleDelete(spot.id)}
                                disabled={isPending}
                                icon={<Trash2 size={14} color="var(--color-error500, #DC2626)" />}
                              >
                                <Text variant="label" color="$error500">Delete</Text>
                              </Button>
                            </XStack>
                          </>
                        )}
                      </YStack>
                    </XStack>
                  </YStack>
                )
              })}
            </YStack>
          )}
        </YStack>
      </XStack>
    </YStack>
  )
}
