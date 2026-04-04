import React, { useEffect, useState, useTransition } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { YStack, XStack, Text, Button, Input, ScrollView, Switch } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import type { CollectionDetail } from '@/features/api/types'
import {
  deleteCollection,
  getCollectionById,
  removeRouteFromCollection,
  updateCollection,
} from '@/features/collections/api'

type FeedbackState = {
  ok: boolean
  message: string
} | null

export default function SavedCollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [collection, setCollection] = useState<CollectionDetail | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadCollection = async () => {
    if (!id) return

    setLoading(true)
    try {
      const detail = await getCollectionById(id)
      setCollection(detail)
      setName(detail.name)
      setDescription(detail.description ?? '')
      setThumbnailUrl(detail.thumbnailUrl ?? '')
      setIsPublic(detail.isPublic)
      setFeedback(null)
    } catch (error) {
      setFeedback({ ok: false, message: error instanceof Error ? error.message : 'Failed to load collection.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollection().catch(() => {})
  }, [id])

  const handleSave = () => {
    if (!collection) return
    if (!name.trim()) {
      setFeedback({ ok: false, message: 'Collection name is required.' })
      return
    }

    startTransition(async () => {
      try {
        await updateCollection(collection.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          isPublic,
        })
        await loadCollection()
        setFeedback({ ok: true, message: 'Collection updated successfully.' })
      } catch (error) {
        setFeedback({ ok: false, message: error instanceof Error ? error.message : 'Failed to update collection.' })
      }
    })
  }

  const handleDelete = () => {
    if (!collection || collection.isDefault) return

    startTransition(async () => {
      try {
        await deleteCollection(collection.id)
        router.replace('/saved')
      } catch (error) {
        setFeedback({ ok: false, message: error instanceof Error ? error.message : 'Failed to delete collection.' })
      }
    })
  }

  const handleRemoveRoute = (routeId: string) => {
    if (!collection) return

    startTransition(async () => {
      try {
        await removeRouteFromCollection(collection.id, routeId)
        await loadCollection()
        setFeedback({ ok: true, message: 'Route removed from collection.' })
      } catch (error) {
        setFeedback({ ok: false, message: error instanceof Error ? error.message : 'Failed to remove route.' })
      }
    })
  }

  if (loading && !collection) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Text variant="body" muted>Loading collection...</Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$4">
          <Button variant="ghost" size="sm" alignSelf="flex-start" onPress={() => router.back()}>
            Back
          </Button>

          <YStack gap="$1">
            <Text variant="heading2">{collection?.name ?? 'Collection'}</Text>
            <Text variant="body" muted>Manage collection details and route entries</Text>
          </YStack>

          {feedback ? (
            <YStack
              padding="$3"
              borderRadius="$3"
              borderWidth={1}
              borderColor={feedback.ok ? '$success200' : '$error200'}
              backgroundColor={feedback.ok ? '$success50' : '$error50'}
            >
              <Text variant="body" color={feedback.ok ? '$success500' : '$error500'}>{feedback.message}</Text>
            </YStack>
          ) : null}

          {collection ? (
            <>
              <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$borderColor">
                <Text variant="heading4">Collection Settings</Text>
                <YStack gap="$3">
                  <YStack gap="$1.5">
                    <Text variant="label" color="$mutedForeground">Name *</Text>
                    <Input value={name} onChangeText={setName} variant="outline" />
                  </YStack>
                  <YStack gap="$1.5">
                    <Text variant="label" color="$mutedForeground">Description</Text>
                    <Input
                      value={description}
                      onChangeText={setDescription}
                      variant="outline"
                      multiline
                      numberOfLines={3}
                    />
                  </YStack>
                  <YStack gap="$1.5">
                    <Text variant="label" color="$mutedForeground">Thumbnail URL</Text>
                    <Input value={thumbnailUrl} onChangeText={setThumbnailUrl} variant="outline" autoCapitalize="none" />
                  </YStack>
                  <Switch label="Public collection" checked={isPublic} onCheckedChange={(checked) => setIsPublic(Boolean(checked))} />
                </YStack>
                <XStack gap="$3">
                  <Button variant="solid" flex={1} onPress={handleSave} loading={isPending} disabled={isPending}>
                    Save Changes
                  </Button>
                  {!collection.isDefault ? (
                    <Button variant="outline" onPress={handleDelete} loading={isPending} disabled={isPending}>
                      Delete
                    </Button>
                  ) : null}
                </XStack>
              </YStack>

              <YStack gap="$3">
                <Text variant="heading3">Routes ({collection.routes.length})</Text>
                {collection.routes.length > 0 ? (
                  <YStack gap="$3">
                    {collection.routes.map((route) => (
                      <YStack
                        key={route.routeId}
                        backgroundColor="$backgroundStrong"
                        borderRadius="$4"
                        borderWidth={1}
                        borderColor="$borderColor"
                        padding="$4"
                        gap="$3"
                      >
                        <YStack gap="$1">
                          <Text variant="heading4">{route.title ?? 'Untitled route'}</Text>
                          <Text variant="caption" muted>{new Date(route.savedAt).toLocaleString()}</Text>
                        </YStack>
                        <XStack gap="$3">
                          <Button variant="outline" flex={1} onPress={() => router.push(`/routes/${route.routeId}`)}>
                            Open Route
                          </Button>
                          <Button variant="outline" onPress={() => handleRemoveRoute(route.routeId)} loading={isPending} disabled={isPending}>
                            Remove
                          </Button>
                        </XStack>
                      </YStack>
                    ))}
                  </YStack>
                ) : (
                  <YStack
                    alignItems="center"
                    justifyContent="center"
                    padding="$6"
                    gap="$3"
                    backgroundColor="$backgroundStrong"
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Feather name="folder" size={32} color="var(--color-mutedForeground, #999)" />
                    <Text variant="heading4" muted>No routes yet</Text>
                    <Text variant="body" muted align="center">
                      Saved routes added to this collection will appear here.
                    </Text>
                  </YStack>
                )}
              </YStack>
            </>
          ) : null}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
