import React, { useEffect, useState, useTransition } from 'react'
import { Modal, ActivityIndicator } from 'react-native'
import { YStack, XStack, Text, Button, Input, ScrollView } from '@antapp/ui'
import { Feather } from '@expo/vector-icons'
import {
  getCollections,
  addRouteToCollection,
  removeRouteFromCollection,
  createCollection,
  getCollectionById,
} from '@/features/collections/api'
import type { Collection } from '@/features/api/types'

type Props = {
  visible: boolean
  routeId: string
  onClose: () => void
}

export function SaveToCollectionModal({ visible, routeId, onClose }: Props) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [savedInIds, setSavedInIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [isCreating, startCreate] = useTransition()
  const [isToggling, startToggle] = useTransition()

  const load = async () => {
    setLoading(true)
    setFeedback(null)
    try {
      const result = await getCollections(1, 50)
      setCollections(result.data)

      const inIds = new Set<string>()
      await Promise.allSettled(
        result.data.map(async (col) => {
          try {
            const detail = await getCollectionById(col.id)
            if (detail.routes.some((r) => r.routeId === routeId)) {
              inIds.add(col.id)
            }
          } catch {}
        })
      )
      setSavedInIds(inIds)
    } catch {
      setFeedback('Failed to load collections.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      load()
    }
  }, [visible])

  const handleToggle = (collection: Collection) => {
    startToggle(async () => {
      setFeedback(null)
      try {
        if (savedInIds.has(collection.id)) {
          await removeRouteFromCollection(collection.id, routeId)
          setSavedInIds((prev) => {
            const next = new Set(prev)
            next.delete(collection.id)
            return next
          })
        } else {
          await addRouteToCollection(collection.id, routeId)
          setSavedInIds((prev) => new Set(prev).add(collection.id))
        }
      } catch (e) {
        setFeedback((e as Error).message ?? 'Action failed.')
      }
    })
  }

  const handleCreate = () => {
    if (!newName.trim()) return
    startCreate(async () => {
      setFeedback(null)
      try {
        await createCollection({ name: newName.trim() })
        setNewName('')
        await load()
      } catch (e) {
        setFeedback((e as Error).message ?? 'Failed to create collection.')
      }
    })
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <YStack flex={1} backgroundColor="$background">
        <XStack
          paddingHorizontal="$4"
          paddingTop="$5"
          paddingBottom="$3"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          justifyContent="space-between"
          alignItems="center"
        >
          <YStack>
            <Text variant="heading3">Save to Collection</Text>
            <Text variant="caption" muted>Choose where to save this route</Text>
          </YStack>
          <XStack cursor="pointer" onPress={onClose} padding="$2">
            <Feather name="x" size={22} color="currentColor" />
          </XStack>
        </XStack>

        {loading ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <ActivityIndicator />
          </YStack>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack padding="$4" gap="$4">
              {feedback ? (
                <YStack backgroundColor="$error50" borderRadius="$3" padding="$3" borderWidth={1} borderColor="$error200">
                  <Text variant="caption" color="$error500">{feedback}</Text>
                </YStack>
              ) : null}

              {/* Create new collection */}
              <YStack gap="$3" padding="$4" backgroundColor="$backgroundStrong" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
                <XStack alignItems="center" gap="$2">
                  <Feather name="plus-circle" size={16} color="var(--color-primary)" />
                  <Text variant="heading4">New Collection</Text>
                </XStack>
                <XStack gap="$2" alignItems="center">
                  <Input
                    flex={1}
                    value={newName}
                    onChangeText={setNewName}
                    variant="outline"
                    placeholder="Collection name"
                  />
                  <Button
                    variant="solid"
                    size="md"
                    loading={isCreating}
                    disabled={isCreating || !newName.trim()}
                    onPress={handleCreate}
                  >
                    Create
                  </Button>
                </XStack>
              </YStack>

              {/* Collection list */}
              <YStack gap="$2">
                {collections.length === 0 ? (
                  <YStack padding="$5" alignItems="center" gap="$2">
                    <Feather name="folder" size={32} color="var(--color-mutedForeground, #999)" />
                    <Text variant="body" muted>No collections yet</Text>
                  </YStack>
                ) : (
                  collections.map((col) => {
                    const saved = savedInIds.has(col.id)
                    return (
                      <XStack
                        key={col.id}
                        backgroundColor="$backgroundStrong"
                        borderRadius="$4"
                        padding="$4"
                        borderWidth={1}
                        borderColor={saved ? '$primary200' : '$borderColor'}
                        alignItems="center"
                        gap="$3"
                      >
                        <XStack
                          width={36}
                          height={36}
                          borderRadius="$3"
                          backgroundColor={saved ? '$primary50' : '$muted'}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Feather
                            name={col.isDefault ? 'bookmark' : 'folder'}
                            size={16}
                            color={saved ? 'var(--color-primary)' : 'var(--color-mutedForeground, #999)'}
                          />
                        </XStack>
                        <YStack flex={1} gap="$0.5">
                          <XStack alignItems="center" gap="$2">
                            <Text variant="label" weight="semibold">{col.name}</Text>
                            {col.isDefault ? (
                              <XStack
                                backgroundColor="$primary50"
                                paddingHorizontal="$1.5"
                                paddingVertical="$0.5"
                                borderRadius="$full"
                              >
                                <Text variant="caption" color="$primary" fontSize={10}>Default</Text>
                              </XStack>
                            ) : null}
                          </XStack>
                          <Text variant="caption" muted>{col.routeCount} routes</Text>
                        </YStack>
                        <Button
                          variant={saved ? 'outline' : 'solid'}
                          size="sm"
                          loading={isToggling}
                          disabled={isToggling}
                          onPress={() => handleToggle(col)}
                        >
                          {saved ? 'Remove' : 'Add'}
                        </Button>
                      </XStack>
                    )
                  })
                )}
              </YStack>

              <Button variant="outline" size="md" onPress={onClose}>
                Done
              </Button>
            </YStack>
          </ScrollView>
        )}
      </YStack>
    </Modal>
  )
}
