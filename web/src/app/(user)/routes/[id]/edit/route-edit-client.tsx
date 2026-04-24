'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Input, Divider, Badge } from '@antapp/ui'
import type { RouteDetail, RouteStopItem, SpotListItem } from '@/types/api'
import {
  updateRoute,
  publishRoute,
  unpublishRoute,
  deleteRoute,
  getRouteStops,
  addRouteStop,
  updateRouteStop,
  deleteRouteStop,
  reorderRouteStops,
} from '@/features/routes/actions'
import {
  ArrowLeft,
  Globe,
  Lock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronUp,
  ChevronDown,
  Save,
  RotateCcw,
  MapPinned,
  Heart,
} from 'lucide-react'
import SpotSelect from '@/components/spot-select'
import { SavedSpotsPickerModal } from '@/features/spots/saved-spots-picker-modal'

type FeedbackState = { ok: boolean; message: string } | null

type NewStopForm = {
  spotId: string
  customTitle: string
  customDescription: string
}

function createEmptyStopForm(): NewStopForm {
  return {
    spotId: '',
    customTitle: '',
    customDescription: '',
  }
}

function uniqueSpotIds(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)))
}

function reorderArray<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

function scrollToStop(stopId: string) {
  if (typeof document === 'undefined') return
  const element = document.getElementById(`route-stop-${stopId}`)
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export default function RouteEditClient({
  route,
  initialStops,
}: {
  route: RouteDetail
  initialStops: RouteStopItem[]
}) {
  const router = useRouter()

  const [title, setTitle] = useState(route.title)
  const [description, setDescription] = useState(route.description ?? '')
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [isSaving, startSave] = useTransition()

  const [isPublic, setIsPublic] = useState(route.isPublic)
  const [isTogglingPublish, startToggle] = useTransition()

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isDeleting, startDelete] = useTransition()

  const [stops, setStops] = useState<RouteStopItem[]>(initialStops)
  const [savedStops, setSavedStops] = useState<RouteStopItem[]>(initialStops)
  const [newStop, setNewStop] = useState<NewStopForm>(createEmptyStopForm())
  const [showSavedSpotPicker, setShowSavedSpotPicker] = useState(false)
  const [stopFeedback, setStopFeedback] = useState<FeedbackState>(null)
  const [isManagingStops, startManageStops] = useTransition()
  const [isMutatingStops, setIsMutatingStops] = useState(false)
  const isStopActionPending = isManagingStops || isMutatingStops

  const refreshStops = async (successMessage?: string) => {
    const nextStops = await getRouteStops(route.id)
    setStops(nextStops)
    setSavedStops(nextStops)
    if (successMessage) {
      setStopFeedback({ ok: true, message: successMessage })
    }
  }

  const handleSave = () => {
    setFeedback(null)
    if (!title.trim()) {
      setFeedback({ ok: false, message: 'Title is required.' })
      return
    }
    startSave(async () => {
      try {
        await updateRoute(route.id, {
          title: title.trim(),
          description: description.trim() || undefined,
        })
        setFeedback({ ok: true, message: 'Route updated successfully.' })
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to update.' })
      }
    })
  }

  const handleTogglePublish = () => {
    startToggle(async () => {
      try {
        if (isPublic) {
          await unpublishRoute(route.id)
          setIsPublic(false)
        } else {
          await publishRoute(route.id)
          setIsPublic(true)
        }
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to change visibility.' })
      }
    })
  }

  const handleDelete = () => {
    startDelete(async () => {
      try {
        await deleteRoute(route.id)
        router.replace('/profile')
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to delete route.' })
        setDeleteConfirm(false)
      }
    })
  }

  const handleStopFieldChange = (
    stopId: string,
    field: keyof Pick<RouteStopItem, 'customTitle' | 'customDescription'>,
    value: string,
  ) => {
    setStops((prev) => prev.map((stop) => (
      stop.id === stopId
        ? { ...stop, [field]: value }
        : stop
    )))
  }

  const handleResetStop = (stopId: string) => {
    const original = savedStops.find((stop) => stop.id === stopId)
    if (!original) return

    setStops((prev) => prev.map((stop) => (
      stop.id === stopId ? original : stop
    )))
  }

  const isStopDirty = (stop: RouteStopItem) => {
    const original = savedStops.find((item) => item.id === stop.id)
    if (!original) return false

    return (original.customTitle ?? '') !== (stop.customTitle ?? '')
      || (original.customDescription ?? '') !== (stop.customDescription ?? '')
  }

  const handleSaveStop = (stop: RouteStopItem) => {
    if (isStopActionPending) return
    setStopFeedback(null)
    setIsMutatingStops(true)
    startManageStops(async () => {
      try {
        await updateRouteStop(route.id, stop.id, {
          customTitle: (stop.customTitle ?? '').trim(),
          customDescription: (stop.customDescription ?? '').trim(),
        })
        await refreshStops('Stop updated successfully.')
      } catch (e) {
        setStopFeedback({ ok: false, message: (e as Error).message ?? 'Failed to update stop.' })
      } finally {
        setIsMutatingStops(false)
      }
    })
  }

  const handleAddStop = () => {
    if (isStopActionPending) return
    setStopFeedback(null)

    if (!newStop.spotId.trim()) {
      setStopFeedback({ ok: false, message: 'Please select a spot to add a new stop.' })
      return
    }

    setIsMutatingStops(true)
    startManageStops(async () => {
      try {
        await addRouteStop(route.id, {
          spotId: newStop.spotId.trim(),
          customTitle: newStop.customTitle.trim() || undefined,
          customDescription: newStop.customDescription.trim() || undefined,
        })
        setNewStop(createEmptyStopForm())
        await refreshStops('Stop added successfully.')
      } catch (e) {
        setStopFeedback({ ok: false, message: (e as Error).message ?? 'Failed to add stop.' })
      } finally {
        setIsMutatingStops(false)
      }
    })
  }

  const handleAddFromSaved = (pickedSpots: SpotListItem[]) => {
    if (pickedSpots.length === 0) return
    if (isStopActionPending) return

    setStopFeedback(null)
    setIsMutatingStops(true)
    startManageStops(async () => {
      try {
        for (const spot of pickedSpots) {
          await addRouteStop(route.id, {
            spotId: spot.id,
            customTitle: spot.name,
          })
        }
        await refreshStops(`${pickedSpots.length} stop${pickedSpots.length > 1 ? 's' : ''} added from saved spots.`)
      } catch (e) {
        setStopFeedback({ ok: false, message: (e as Error).message ?? 'Failed to add saved spots.' })
      } finally {
        setIsMutatingStops(false)
      }
    })
  }

  const handleDeleteStop = (stopId: string) => {
    if (isStopActionPending) return
    if (!window.confirm('Remove this stop from the route?')) {
      return
    }

    setStopFeedback(null)
    setIsMutatingStops(true)
    startManageStops(async () => {
      try {
        await deleteRouteStop(route.id, stopId)
        await refreshStops('Stop removed from route.')
      } catch (e) {
        setStopFeedback({ ok: false, message: (e as Error).message ?? 'Failed to remove stop.' })
      } finally {
        setIsMutatingStops(false)
      }
    })
  }

  const handleMoveStop = (fromIndex: number, direction: 'up' | 'down') => {
    if (isStopActionPending) return
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= stops.length) {
      return
    }

    const movedStopId = stops[fromIndex]?.id
    const previousStops = stops
    const nextStops = reorderArray(previousStops, fromIndex, toIndex)
    setStops(nextStops)
    setStopFeedback(null)
    setIsMutatingStops(true)

    startManageStops(async () => {
      try {
        await reorderRouteStops(route.id, nextStops.map((stop) => stop.id))
        await refreshStops('Stop order updated.')
        if (movedStopId) {
          setTimeout(() => scrollToStop(movedStopId), 0)
        }
      } catch (e) {
        setStops(previousStops)
        setStopFeedback({ ok: false, message: (e as Error).message ?? 'Failed to reorder stops.' })
      } finally {
        setIsMutatingStops(false)
      }
    })
  }

  const isDirty = title !== route.title || description !== (route.description ?? '')

  return (
    <YStack gap="$5" flex={1} maxWidth={860}>
      <XStack alignItems="center" gap="$3">
        <XStack
          cursor="pointer"
          onPress={() => router.back()}
          padding="$2"
          borderRadius="$full"
          hoverStyle={{ backgroundColor: '$backgroundHover' }}
        >
          <ArrowLeft size={20} color="currentColor" />
        </XStack>
        <YStack flex={1}>
          <Text variant="heading2">Edit Route</Text>
          <Text variant="body" muted numberOfLines={1}>{route.title}</Text>
        </YStack>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.push(`/routes/${route.id}`)}
        >
          View Route
        </Button>
      </XStack>

      <YStack
        backgroundColor="$backgroundStrong"
        borderRadius="$4"
        padding="$5"
        gap="$4"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text variant="heading4">Route Information</Text>

        <YStack gap="$1.5">
          <Text variant="label" color="$mutedForeground">Title *</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            variant="outline"
            size="md"
            placeholder="Route title"
          />
        </YStack>

        <YStack gap="$1.5">
          <Text variant="label" color="$mutedForeground">Description</Text>
          <Input
            value={description}
            onChangeText={setDescription}
            variant="outline"
            size="md"
            placeholder="Describe your route..."

            multiline
            numberOfLines={4}
          />
        </YStack>

        {feedback && (
          <XStack gap="$2" alignItems="center">
            {feedback.ok
              ? <CheckCircle2 size={16} color="var(--color-success500, #22C55E)" />
              : <AlertCircle size={16} color="var(--color-error500, #DC2626)" />
            }
            <Text variant="caption" color={feedback.ok ? '$success500' : '$error500'}>
              {feedback.message}
            </Text>
          </XStack>
        )}

        <XStack gap="$2" flexWrap="wrap">
          <Button
            variant="solid"
            size="md"
            loading={isSaving}
            disabled={isSaving || !isDirty || !title.trim()}
            onPress={handleSave}
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            size="md"
            disabled={isSaving}
            onPress={() => {
              setTitle(route.title)
              setDescription(route.description ?? '')
              setFeedback(null)
            }}
          >
            Discard
          </Button>
        </XStack>
      </YStack>

      <YStack
        backgroundColor="$backgroundStrong"
        borderRadius="$4"
        padding="$5"
        gap="$4"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$3" flexWrap="wrap">
          <YStack gap="$1">
            <Text variant="heading4">Route Stops</Text>
            <Text variant="body" muted>
              Add new spots, override titles and descriptions, remove stops, or change the order.
            </Text>
          </YStack>
          <Badge variant="info" size="md">{stops.length} stops</Badge>
        </XStack>

        <YStack
          gap="$3"
          padding="$4"
          borderRadius="$4"
          backgroundColor="$muted"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <XStack alignItems="center" gap="$2">
            <Plus size={16} color="var(--color-primary)" />
            <Text variant="heading4">Add Stop</Text>
          </XStack>

          <YStack gap="$3">
            <YStack gap="$1.5">
              <XStack justifyContent="space-between" alignItems="center" gap="$2" flexWrap="wrap">
                <Text variant="label" color="$mutedForeground">Select Spot *</Text>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Heart size={14} color="#EA580C" fill="#EA580C" />}
                  onPress={() => setShowSavedSpotPicker(true)}
                  disabled={isStopActionPending}
                >
                  Add from Saved
                </Button>
              </XStack>
              {newStop.spotId ? (
                <XStack
                  backgroundColor="$primary50"
                  padding="$3"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="$primary200"
                  justifyContent="space-between"
                  alignItems="center"
                  gap="$2"
                >
                  <YStack gap="$0.5" flex={1}>
                    <Text variant="label" color="$primary">Spot selected</Text>
                    <Text variant="caption" muted numberOfLines={1}>
                      {newStop.customTitle || newStop.spotId}
                    </Text>
                  </YStack>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => setNewStop(createEmptyStopForm())}
                    disabled={isStopActionPending}
                  >
                    Change
                  </Button>
                </XStack>
              ) : (
                <SpotSelect
                  onSelect={(spot) => {
                    setNewStop((prev) => ({
                      ...prev,
                      spotId: spot.id,
                      customTitle: prev.customTitle.trim() ? prev.customTitle : spot.name,
                    }))
                    setStopFeedback(null)
                  }}
                  excludeIds={uniqueSpotIds(stops.map((s) => s.spotId))}
                />
              )}
            </YStack>

            <XStack gap="$3" flexWrap="wrap">
              <YStack flex={1} minWidth={240} gap="$1.5">
                <Text variant="label" color="$mutedForeground">Custom Title</Text>
                <Input
                  value={newStop.customTitle}
                  onChangeText={(value) => setNewStop((prev) => ({ ...prev, customTitle: value }))}
                  variant="outline"
                  size="md"
                  placeholder="Optional name override"
                />
              </YStack>

              <YStack flex={1} minWidth={240} gap="$1.5">
                <Text variant="label" color="$mutedForeground">Custom Description</Text>
                <Input
                  value={newStop.customDescription}
                  onChangeText={(value) => setNewStop((prev) => ({ ...prev, customDescription: value }))}
                  variant="outline"
                  size="md"
                  placeholder="Optional description override"

                  multiline
                  numberOfLines={3}
                />
              </YStack>
            </XStack>

            <XStack justifyContent="flex-end">
              <Button
                variant="solid"
                size="sm"
                loading={isStopActionPending}
                disabled={isStopActionPending}
                onPress={handleAddStop}
                icon={<Plus size={14} color="#FFFFFF" />}
              >
                Add Stop
              </Button>
            </XStack>
          </YStack>
        </YStack>

        {stopFeedback && (
          <XStack gap="$2" alignItems="center">
            {stopFeedback.ok
              ? <CheckCircle2 size={16} color="var(--color-success500, #22C55E)" />
              : <AlertCircle size={16} color="var(--color-error500, #DC2626)" />
            }
            <Text variant="caption" color={stopFeedback.ok ? '$success500' : '$error500'}>
              {stopFeedback.message}
            </Text>
          </XStack>
        )}

        {stops.length === 0 ? (
          <YStack
            padding="$6"
            borderRadius="$4"
            borderWidth={1}
            borderStyle="dashed"
            borderColor="$borderColor"
            alignItems="center"
            gap="$2"
          >
            <MapPinned size={28} color="var(--color-mutedForeground)" />
            <Text variant="heading4">No stops yet</Text>
            <Text variant="body" muted align="center">
              Add at least one spot to turn this route into a real itinerary.
            </Text>
          </YStack>
        ) : (
          <YStack gap="$4">
            {stops.map((stop, index) => {
              const displayName = (stop.customTitle ?? '').trim() || stop.name
              const displayDescription = (stop.customDescription ?? '').trim() || stop.description
              const dirty = isStopDirty(stop)

              return (
                <XStack key={stop.id} id={`route-stop-${stop.id}`} gap="$3" alignItems="flex-start">
                  <YStack alignItems="center" gap="$1" paddingTop="$2">
                    <XStack
                      width={34}
                      height={34}
                      borderRadius="$full"
                      backgroundColor="$primary"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text variant="label" color="#FFFFFF">{index + 1}</Text>
                    </XStack>
                    {index < stops.length - 1 && (
                      <YStack width={2} minHeight={64} backgroundColor="$borderColor" />
                    )}
                  </YStack>

                  <YStack
                    flex={1}
                    gap="$4"
                    padding="$4"
                    borderRadius="$4"
                    backgroundColor="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <XStack justifyContent="space-between" alignItems="flex-start" gap="$3" flexWrap="wrap">
                      <YStack gap="$1" flex={1} minWidth={220}>
                        <Text variant="heading4">{displayName}</Text>
                        <Text variant="caption" muted>
                          Spot ID: {stop.spotId}
                        </Text>
                      </YStack>

                      <XStack gap="$2" flexWrap="wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={index === 0 || isStopActionPending}
                          onPress={() => handleMoveStop(index, 'up')}
                          icon={<ChevronUp size={14} color="currentColor" />}
                        >
                          Up
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={index === stops.length - 1 || isStopActionPending}
                          onPress={() => handleMoveStop(index, 'down')}
                          icon={<ChevronDown size={14} color="currentColor" />}
                        >
                          Down
                        </Button>
                      </XStack>
                    </XStack>

                    <XStack gap="$3" flexWrap="wrap">
                      <YStack flex={1} minWidth={240} gap="$1.5">
                        <Text variant="label" color="$mutedForeground">Custom Title</Text>
                        <Input
                          value={stop.customTitle ?? ''}
                          onChangeText={(value) => handleStopFieldChange(stop.id, 'customTitle', value)}
                          variant="outline"
                          size="md"
                          placeholder={stop.name}
                        />
                      </YStack>

                      <YStack flex={1} minWidth={240} gap="$1.5">
                        <Text variant="label" color="$mutedForeground">Custom Description</Text>
                        <Input
                          value={stop.customDescription ?? ''}
                          onChangeText={(value) => handleStopFieldChange(stop.id, 'customDescription', value)}
                          variant="outline"
                          size="md"
                          placeholder={stop.description ?? 'Optional description override'}

                          multiline
                          numberOfLines={3}
                        />
                      </YStack>
                    </XStack>

                    <YStack gap="$2">
                      <Text variant="caption" color="$mutedForeground">Current preview</Text>
                      <YStack
                        gap="$2"
                        padding="$3"
                        borderRadius="$3"
                        backgroundColor="$backgroundStrong"
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <Text variant="label">{displayName}</Text>
                        {displayDescription ? (
                          <Text variant="caption" muted>{displayDescription}</Text>
                        ) : (
                          <Text variant="caption" muted>No description</Text>
                        )}
                        <XStack gap="$2" flexWrap="wrap">
                          <Badge variant="default" size="sm">Lat {stop.latitude.toFixed(4)}</Badge>
                          <Badge variant="default" size="sm">Lng {stop.longitude.toFixed(4)}</Badge>
                          {dirty && <Badge variant="warning" size="sm">Unsaved changes</Badge>}
                        </XStack>
                      </YStack>
                    </YStack>

                    <Divider />

                    <XStack justifyContent="space-between" alignItems="center" gap="$3" flexWrap="wrap">
                      <Text variant="caption" muted>
                        Base spot: {stop.name}
                      </Text>

                      <XStack gap="$2" flexWrap="wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!dirty || isStopActionPending}
                          onPress={() => handleResetStop(stop.id)}
                          icon={<RotateCcw size={14} color="currentColor" />}
                        >
                          Reset
                        </Button>
                        <Button
                          variant="solid"
                          size="sm"
                          loading={isStopActionPending}
                          disabled={!dirty || isStopActionPending}
                          onPress={() => handleSaveStop(stop)}
                          icon={<Save size={14} color="#FFFFFF" />}
                        >
                          Save Stop
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isStopActionPending}
                          onPress={() => handleDeleteStop(stop.id)}
                          icon={<Trash2 size={14} color="var(--color-error500, #DC2626)" />}
                        >
                          <Text variant="label" color="$error500">Delete</Text>
                        </Button>
                      </XStack>
                    </XStack>
                  </YStack>
                </XStack>
              )
            })}
          </YStack>
        )}
      </YStack>

      <YStack
        backgroundColor="$backgroundStrong"
        borderRadius="$4"
        padding="$5"
        gap="$4"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text variant="heading4">Visibility</Text>
        <XStack
          backgroundColor={isPublic ? '$success50' : '$muted'}
          borderRadius="$3"
          padding="$4"
          borderWidth={1}
          borderColor={isPublic ? '$success200' : '$borderColor'}
          gap="$3"
          alignItems="center"
        >
          {isPublic
            ? <Globe size={20} color="var(--color-success500, #22C55E)" />
            : <Lock size={20} color="var(--color-mutedForeground)" />
          }
          <YStack flex={1} gap="$0.5">
            <Text variant="label" weight="semibold">
              {isPublic ? 'Public' : 'Private'}
            </Text>
            <Text variant="caption" muted>
              {isPublic
                ? 'This route is visible to everyone on the platform.'
                : 'Only you can see this route.'
              }
            </Text>
          </YStack>
          <Button
            variant={isPublic ? 'outline' : 'solid'}
            size="sm"
            loading={isTogglingPublish}
            disabled={isTogglingPublish}
            onPress={handleTogglePublish}
          >
            {isPublic ? 'Unpublish' : 'Publish'}
          </Button>
        </XStack>
      </YStack>

      <YStack
        backgroundColor="$backgroundStrong"
        borderRadius="$4"
        padding="$5"
        gap="$4"
        borderWidth={1}
        borderColor="$error200"
      >
        <Text variant="heading4" color="$error500">Danger Zone</Text>
        <Divider />
        <XStack gap="$4" alignItems="center" flexWrap="wrap">
          <YStack flex={1} gap="$0.5">
            <Text variant="label">Delete Route</Text>
            <Text variant="caption" muted>
              Permanently delete this route. This action cannot be undone.
            </Text>
          </YStack>
          {!deleteConfirm ? (
            <Button
              variant="outline"
              size="sm"
              onPress={() => setDeleteConfirm(true)}
              icon={<Trash2 size={14} color="var(--color-error500, #DC2626)" />}
            >
              <Text variant="label" color="$error500">Delete</Text>
            </Button>
          ) : (
            <XStack gap="$2">
              <Button
                variant="outline"
                size="sm"
                onPress={() => setDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                loading={isDeleting}
                disabled={isDeleting}
                onPress={handleDelete}
                backgroundColor="$error500"
                hoverStyle={{ backgroundColor: '$error400' }}
              >
                <Text variant="label" color="#FFFFFF">Confirm Delete</Text>
              </Button>
            </XStack>
          )}
        </XStack>
      </YStack>

      <SavedSpotsPickerModal
        isOpen={showSavedSpotPicker}
        onClose={() => setShowSavedSpotPicker(false)}
        onAddSelected={handleAddFromSaved}
        excludeIds={uniqueSpotIds(stops.map((s) => s.spotId))}
      />
    </YStack>
  )
}
