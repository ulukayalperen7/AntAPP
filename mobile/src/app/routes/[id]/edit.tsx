import React, { useState, useTransition, useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Alert } from 'react-native'
import {
  YStack, XStack, Text, Button, Input, Divider, Badge, ScrollView,
} from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import type { RouteDetail, RouteStopItem } from '@/features/api/types'
import {
  getRouteById,
  getRouteStops,
  updateRoute,
  publishRoute,
  unpublishRoute,
  deleteRoute,
  addRouteStop,
  updateRouteStop,
  deleteRouteStop,
  reorderRouteStops,
} from '@/features/routes/api'
import { FormPageSkeleton } from '@/components/loading/page-skeletons'

type FeedbackState = { ok: boolean; message: string } | null

function reorderArray<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export default function RouteEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [route, setRoute] = useState<RouteDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [isSaving, startSave] = useTransition()

  const [isPublic, setIsPublic] = useState(false)
  const [isTogglingPublish, startToggle] = useTransition()

  const [isDeleting, startDelete] = useTransition()

  const [stops, setStops] = useState<RouteStopItem[]>([])
  const [savedStops, setSavedStops] = useState<RouteStopItem[]>([])
  const [newStopSpotId, setNewStopSpotId] = useState('')
  const [newStopCustomTitle, setNewStopCustomTitle] = useState('')
  const [stopFeedback, setStopFeedback] = useState<FeedbackState>(null)
  const [isManagingStops, startManageStops] = useTransition()

  useEffect(() => {
    if (!id) return

    let mounted = true
    setLoading(true)

    Promise.allSettled([getRouteById(id), getRouteStops(id)]).then(([routeRes, stopsRes]) => {
      if (!mounted) return

      if (routeRes.status === 'fulfilled') {
        const r = routeRes.value
        setRoute(r)
        setTitle(r.title)
        setDescription(r.description ?? '')
        setIsPublic(r.isPublic)
      }

      if (stopsRes.status === 'fulfilled') {
        setStops(stopsRes.value)
        setSavedStops(stopsRes.value)
      }

      setLoading(false)
    })

    return () => { mounted = false }
  }, [id])

  const refreshStops = async (successMsg?: string) => {
    if (!id) return
    const nextStops = await getRouteStops(id)
    setStops(nextStops)
    setSavedStops(nextStops)
    if (successMsg) setStopFeedback({ ok: true, message: successMsg })
  }

  const handleSave = () => {
    if (!route) return
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
    if (!route) return
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
    if (!route) return
    Alert.alert(
      'Delete Route',
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            startDelete(async () => {
              try {
                await deleteRoute(route.id)
                router.replace('/profile')
              } catch (e) {
                setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to delete route.' })
              }
            })
          },
        },
      ]
    )
  }

  const handleStopFieldChange = (stopId: string, field: 'customTitle' | 'customDescription', value: string) => {
    setStops((prev) => prev.map((s) => s.id === stopId ? { ...s, [field]: value } : s))
  }

  const handleResetStop = (stopId: string) => {
    const original = savedStops.find((s) => s.id === stopId)
    if (!original) return
    setStops((prev) => prev.map((s) => s.id === stopId ? original : s))
  }

  const isStopDirty = (stop: RouteStopItem) => {
    const original = savedStops.find((s) => s.id === stop.id)
    if (!original) return false
    return (original.customTitle ?? '') !== (stop.customTitle ?? '')
      || (original.customDescription ?? '') !== (stop.customDescription ?? '')
  }

  const handleSaveStop = (stop: RouteStopItem) => {
    if (!route) return
    setStopFeedback(null)
    startManageStops(async () => {
      try {
        await updateRouteStop(route.id, stop.id, {
          customTitle: (stop.customTitle ?? '').trim(),
          customDescription: (stop.customDescription ?? '').trim(),
        })
        await refreshStops('Stop updated.')
      } catch (e) {
        setStopFeedback({ ok: false, message: (e as Error).message ?? 'Failed to update stop.' })
      }
    })
  }

  const handleAddStop = () => {
    if (!route) return
    setStopFeedback(null)
    if (!newStopSpotId.trim()) {
      setStopFeedback({ ok: false, message: 'Spot ID is required.' })
      return
    }
    startManageStops(async () => {
      try {
        await addRouteStop(route.id, {
          spotId: newStopSpotId.trim(),
          customTitle: newStopCustomTitle.trim() || undefined,
        })
        setNewStopSpotId('')
        setNewStopCustomTitle('')
        await refreshStops('Stop added.')
      } catch (e) {
        setStopFeedback({ ok: false, message: (e as Error).message ?? 'Failed to add stop.' })
      }
    })
  }

  const handleDeleteStop = (stopId: string) => {
    if (!route) return
    Alert.alert('Remove Stop', 'Remove this stop from the route?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setStopFeedback(null)
          startManageStops(async () => {
            try {
              await deleteRouteStop(route.id, stopId)
              await refreshStops('Stop removed.')
            } catch (e) {
              setStopFeedback({ ok: false, message: (e as Error).message ?? 'Failed to remove stop.' })
            }
          })
        },
      },
    ])
  }

  const handleMoveStop = (fromIndex: number, direction: 'up' | 'down') => {
    if (!route) return
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= stops.length) return

    const nextStops = reorderArray(stops, fromIndex, toIndex)
    setStops(nextStops)
    setStopFeedback(null)

    startManageStops(async () => {
      try {
        await reorderRouteStops(route.id, nextStops.map((s) => s.id))
        await refreshStops('Order updated.')
      } catch (e) {
        setStops(savedStops)
        setStopFeedback({ ok: false, message: (e as Error).message ?? 'Failed to reorder.' })
      }
    })
  }

  if (loading) {
    return <FormPageSkeleton topInset={insets.top} />
  }

  if (!route) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" padding="$5" gap="$3">
        <Text variant="heading4">Route not found</Text>
        <Button variant="outline" onPress={() => router.back()}>Go Back</Button>
      </YStack>
    )
  }

  const isDirty = title !== route.title || description !== (route.description ?? '')

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$5">
          <XStack alignItems="center" gap="$3">
            <XStack cursor="pointer" onPress={() => router.back()} padding="$2" borderRadius="$full">
              <Feather name="arrow-left" size={20} color="currentColor" />
            </XStack>
            <YStack flex={1}>
              <Text variant="heading2">Edit Route</Text>
              <Text variant="body" muted numberOfLines={1}>{route.title}</Text>
            </YStack>
            <Button variant="ghost" size="sm" onPress={() => router.push(`/routes/${route.id}`)}>
              View
            </Button>
          </XStack>

          {/* Route Info */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$borderColor">
            <Text variant="heading4">Route Information</Text>

            <YStack gap="$1.5">
              <Text variant="label" color="$mutedForeground">Title *</Text>
              <Input value={title} onChangeText={setTitle} variant="outline" placeholder="Route title" />
            </YStack>

            <YStack gap="$1.5">
              <Text variant="label" color="$mutedForeground">Description</Text>
              <Input
                value={description}
                onChangeText={setDescription}
                variant="outline"
                placeholder="Describe your route..."
                multiline
                numberOfLines={4}
                height={90}
                textAlignVertical="top"
              />
            </YStack>

            {feedback ? (
              <XStack gap="$2" alignItems="center">
                <Feather
                  name={feedback.ok ? 'check-circle' : 'alert-circle'}
                  size={16}
                  color={feedback.ok ? 'var(--color-success500, #22C55E)' : 'var(--color-error500, #DC2626)'}
                />
                <Text variant="caption" color={feedback.ok ? '$success500' : '$error500'}>{feedback.message}</Text>
              </XStack>
            ) : null}

            <XStack gap="$2">
              <Button variant="solid" size="md" loading={isSaving} disabled={isSaving || !isDirty || !title.trim()} onPress={handleSave}>
                Save Changes
              </Button>
              <Button
                variant="outline"
                size="md"
                disabled={isSaving}
                onPress={() => { setTitle(route.title); setDescription(route.description ?? ''); setFeedback(null) }}
              >
                Discard
              </Button>
            </XStack>
          </YStack>

          {/* Stops */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$borderColor">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap="$0.5">
                <Text variant="heading4">Route Stops</Text>
                <Text variant="caption" muted>Add, reorder, or remove stops</Text>
              </YStack>
              <Badge variant="info" size="md">{stops.length}</Badge>
            </XStack>

            {/* Add Stop Form */}
            <YStack gap="$3" padding="$3" borderRadius="$4" backgroundColor="$muted" borderWidth={1} borderColor="$borderColor">
              <XStack alignItems="center" gap="$2">
                <Feather name="plus" size={16} color="var(--color-primary)" />
                <Text variant="heading4">Add Stop</Text>
              </XStack>

              <YStack gap="$1.5">
                <Text variant="label" color="$mutedForeground">Spot ID *</Text>
                <Input
                  value={newStopSpotId}
                  onChangeText={setNewStopSpotId}
                  variant="outline"
                  placeholder="Paste Spot UUID"
                  autoCapitalize="none"
                />
              </YStack>

              <YStack gap="$1.5">
                <Text variant="label" color="$mutedForeground">Custom Title (optional)</Text>
                <Input
                  value={newStopCustomTitle}
                  onChangeText={setNewStopCustomTitle}
                  variant="outline"
                  placeholder="Override spot name"
                />
              </YStack>

              <XStack justifyContent="flex-end">
                <Button variant="solid" size="sm" loading={isManagingStops} disabled={isManagingStops} onPress={handleAddStop}>
                  Add Stop
                </Button>
              </XStack>
            </YStack>

            {stopFeedback ? (
              <XStack gap="$2" alignItems="center">
                <Feather
                  name={stopFeedback.ok ? 'check-circle' : 'alert-circle'}
                  size={16}
                  color={stopFeedback.ok ? 'var(--color-success500, #22C55E)' : 'var(--color-error500, #DC2626)'}
                />
                <Text variant="caption" color={stopFeedback.ok ? '$success500' : '$error500'}>{stopFeedback.message}</Text>
              </XStack>
            ) : null}

            {stops.length === 0 ? (
              <YStack padding="$5" borderRadius="$4" borderWidth={1} borderStyle="dashed" borderColor="$borderColor" alignItems="center" gap="$2">
                <Feather name="map-pin" size={28} color="var(--color-mutedForeground, #999)" />
                <Text variant="heading4">No stops yet</Text>
                <Text variant="body" muted align="center">Add at least one spot above.</Text>
              </YStack>
            ) : (
              <YStack gap="$4">
                {stops.map((stop, index) => {
                  const displayName = (stop.customTitle ?? '').trim() || stop.name
                  const dirty = isStopDirty(stop)

                  return (
                    <XStack key={stop.id} gap="$3" alignItems="flex-start">
                      <YStack alignItems="center" gap="$1" paddingTop="$2">
                        <XStack width={34} height={34} borderRadius="$full" backgroundColor="$primary" alignItems="center" justifyContent="center">
                          <Text variant="label" color="#FFFFFF">{index + 1}</Text>
                        </XStack>
                        {index < stops.length - 1 ? (
                          <YStack width={2} height={40} backgroundColor="$borderColor" />
                        ) : null}
                      </YStack>

                      <YStack flex={1} gap="$3" padding="$3" borderRadius="$4" backgroundColor="$background" borderWidth={1} borderColor="$borderColor">
                        <XStack justifyContent="space-between" alignItems="flex-start" gap="$2">
                          <YStack gap="$0.5" flex={1}>
                            <Text variant="heading4">{displayName}</Text>
                            <Text variant="caption" muted numberOfLines={1}>Lat {stop.latitude.toFixed(4)} · Lng {stop.longitude.toFixed(4)}</Text>
                          </YStack>
                          <XStack gap="$1">
                            <XStack
                              padding="$2"
                              borderRadius="$2"
                              borderWidth={1}
                              borderColor="$borderColor"
                              cursor="pointer"
                              disabled={index === 0 || isManagingStops}
                              opacity={index === 0 ? 0.4 : 1}
                              onPress={() => handleMoveStop(index, 'up')}
                            >
                              <Feather name="chevron-up" size={14} color="currentColor" />
                            </XStack>
                            <XStack
                              padding="$2"
                              borderRadius="$2"
                              borderWidth={1}
                              borderColor="$borderColor"
                              cursor="pointer"
                              disabled={index === stops.length - 1 || isManagingStops}
                              opacity={index === stops.length - 1 ? 0.4 : 1}
                              onPress={() => handleMoveStop(index, 'down')}
                            >
                              <Feather name="chevron-down" size={14} color="currentColor" />
                            </XStack>
                          </XStack>
                        </XStack>

                        <YStack gap="$1.5">
                          <Text variant="label" color="$mutedForeground">Custom Title</Text>
                          <Input
                            value={stop.customTitle ?? ''}
                            onChangeText={(v) => handleStopFieldChange(stop.id, 'customTitle', v)}
                            variant="outline"
                            placeholder={stop.name}
                          />
                        </YStack>

                        <YStack gap="$1.5">
                          <Text variant="label" color="$mutedForeground">Custom Description</Text>
                          <Input
                            value={stop.customDescription ?? ''}
                            onChangeText={(v) => handleStopFieldChange(stop.id, 'customDescription', v)}
                            variant="outline"
                            placeholder={stop.description ?? 'Optional override'}
                            multiline
                            numberOfLines={2}
                            height={60}
                            textAlignVertical="top"
                          />
                        </YStack>

                        {dirty ? (
                          <XStack gap="$1" flexWrap="wrap">
                            <Badge variant="warning" size="sm">Unsaved</Badge>
                          </XStack>
                        ) : null}

                        <Divider />

                        <XStack gap="$2" justifyContent="flex-end" flexWrap="wrap">
                          <Button variant="outline" size="sm" disabled={!dirty || isManagingStops} onPress={() => handleResetStop(stop.id)}>
                            Reset
                          </Button>
                          <Button variant="solid" size="sm" loading={isManagingStops} disabled={!dirty || isManagingStops} onPress={() => handleSaveStop(stop)}>
                            Save Stop
                          </Button>
                          <Button variant="outline" size="sm" disabled={isManagingStops} onPress={() => handleDeleteStop(stop.id)}>
                            <Text variant="label" color="$error500">Delete</Text>
                          </Button>
                        </XStack>
                      </YStack>
                    </XStack>
                  )
                })}
              </YStack>
            )}
          </YStack>

          {/* Visibility */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$borderColor">
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
              <Feather name={isPublic ? 'globe' : 'lock'} size={20} color={isPublic ? 'var(--color-success500, #22C55E)' : 'var(--color-mutedForeground, #999)'} />
              <YStack flex={1} gap="$0.5">
                <Text variant="label" weight="semibold">{isPublic ? 'Public' : 'Private'}</Text>
                <Text variant="caption" muted>
                  {isPublic ? 'Visible to everyone.' : 'Only you can see this.'}
                </Text>
              </YStack>
              <Button variant={isPublic ? 'outline' : 'solid'} size="sm" loading={isTogglingPublish} disabled={isTogglingPublish} onPress={handleTogglePublish}>
                {isPublic ? 'Unpublish' : 'Publish'}
              </Button>
            </XStack>
          </YStack>

          {/* Danger Zone */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$error200">
            <Text variant="heading4" color="$error500">Danger Zone</Text>
            <Divider />
            <XStack gap="$4" alignItems="center" flexWrap="wrap">
              <YStack flex={1} gap="$0.5">
                <Text variant="label">Delete Route</Text>
                <Text variant="caption" muted>Permanently delete this route. Cannot be undone.</Text>
              </YStack>
              <Button variant="outline" size="sm" loading={isDeleting} disabled={isDeleting} onPress={handleDelete}>
                <Text variant="label" color="$error500">Delete</Text>
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
