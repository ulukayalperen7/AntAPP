import React, { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, Button, Input, Badge, ScrollView, Switch } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import type { Collection } from '@/features/api/types'
import {
  createCollection,
  deleteCollection,
  getCollections,
} from '@/features/collections/api'

type FeedbackState = {
  ok: boolean
  message: string
} | null

export default function SavedScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [collections, setCollections] = useState<Collection[]>([])
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isPending, startTransition] = useTransition()

  const loadCollections = async () => {
    try {
      const result = await getCollections(1, 50)
      setCollections(result.data)
    } catch (error) {
      setFeedback({ ok: false, message: error instanceof Error ? error.message : 'Failed to load collections.' })
    }
  }

  useEffect(() => {
    loadCollections().catch(() => {})
  }, [])

  const handleCreateCollection = () => {
    if (!name.trim()) {
      setFeedback({ ok: false, message: 'Collection name is required.' })
      return
    }

    setFeedback(null)
    startTransition(async () => {
      try {
        await createCollection({
          name: name.trim(),
          description: description.trim() || undefined,
          isPublic,
        })
        setName('')
        setDescription('')
        setIsPublic(false)
        setShowCreateForm(false)
        await loadCollections()
        setFeedback({ ok: true, message: 'Collection created successfully.' })
      } catch (error) {
        setFeedback({ ok: false, message: error instanceof Error ? error.message : 'Failed to create collection.' })
      }
    })
  }

  const handleDeleteCollection = (collectionId: string) => {
    setFeedback(null)
    startTransition(async () => {
      try {
        await deleteCollection(collectionId)
        await loadCollections()
        setFeedback({ ok: true, message: 'Collection deleted successfully.' })
      } catch (error) {
        setFeedback({ ok: false, message: error instanceof Error ? error.message : 'Failed to delete collection.' })
      }
    })
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$4">
          <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
            <YStack gap="$1">
              <Text variant="heading2">My Collections</Text>
              <Text variant="body" muted>Save and organize your favorite routes</Text>
            </YStack>
            <Button variant="solid" size="sm" onPress={() => setShowCreateForm((value) => !value)}>
              {showCreateForm ? 'Close' : 'New'}
            </Button>
          </XStack>

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

          {showCreateForm ? (
            <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$borderColor">
              <Text variant="heading4">Create collection</Text>
              <YStack gap="$3">
                <YStack gap="$1.5">
                  <Text variant="label" color="$mutedForeground">Name *</Text>
                  <Input value={name} onChangeText={setName} placeholder="Weekend favorites" variant="outline" />
                </YStack>
                <YStack gap="$1.5">
                  <Text variant="label" color="$mutedForeground">Description</Text>
                  <Input
                    value={description}
                    onChangeText={setDescription}
                    placeholder="A short description"
                    variant="outline"
                    multiline
                    numberOfLines={3}
                  />
                </YStack>
                <Switch
                  label="Public collection"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(Boolean(checked))}
                />
              </YStack>
              <Button variant="solid" onPress={handleCreateCollection} loading={isPending} disabled={isPending}>
                Create Collection
              </Button>
            </YStack>
          ) : null}

          {collections.length > 0 ? (
            <YStack gap="$4">
              {collections.map((collection) => (
                <YStack
                  key={collection.id}
                  backgroundColor="$backgroundStrong"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor="$borderColor"
                  padding="$4"
                  gap="$3"
                >
                  <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
                    <YStack flex={1} gap="$1">
                      <Text variant="heading4">{collection.name}</Text>
                      {collection.description ? <Text variant="caption" muted>{collection.description}</Text> : null}
                    </YStack>
                    <XStack gap="$2">
                      {collection.isDefault ? <Badge variant="info" size="sm">Default</Badge> : null}
                      <Badge variant={collection.isPublic ? 'success' : 'warning'} size="sm">
                        {collection.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </XStack>
                  </XStack>

                  <Text variant="caption" muted>{collection.routeCount} routes</Text>

                  <XStack gap="$3">
                    <Button variant="outline" flex={1} onPress={() => router.push(`/saved/${collection.id}`)}>
                      Open
                    </Button>
                    {!collection.isDefault ? (
                      <Button
                        variant="outline"
                        onPress={() => handleDeleteCollection(collection.id)}
                        loading={isPending}
                        disabled={isPending}
                      >
                        Delete
                      </Button>
                    ) : null}
                  </XStack>
                </YStack>
              ))}
            </YStack>
          ) : (
            <YStack alignItems="center" justifyContent="center" paddingVertical="$10" gap="$4">
              <XStack
                width={72}
                height={72}
                borderRadius="$full"
                backgroundColor="$ant50"
                alignItems="center"
                justifyContent="center"
              >
                <Feather name="bookmark" size={32} color="#005696" />
              </XStack>
              <Text variant="heading4" muted>No collections yet</Text>
              <Text variant="body" muted align="center" maxWidth={280}>
                Save routes you love and create collections to keep them organized.
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
