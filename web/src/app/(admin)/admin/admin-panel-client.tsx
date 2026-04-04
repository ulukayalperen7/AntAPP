'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Input, Badge, Switch, SearchInput } from '@antapp/ui'
import type { AdminCollection, AdminCollectionDetail, Tag } from '@/types/api'
import { logout } from '@/features/auth/actions'
import {
  createAdminTag,
  deleteAdminCollection,
  deleteAdminTag,
  getAdminCollectionById,
  getAdminCollections,
  getAdminTags,
  removeRouteFromAdminCollection,
  updateAdminCollection,
} from '@/features/admin/actions'
import { EmptyState } from '@/components/empty-state'
import {
  BookMarked,
  Compass,
  FolderOpen,
  LogOut,
  Search,
  Shield,
  Sparkles,
  Tag as TagIcon,
  Trash2,
} from 'lucide-react'

type FeedbackState = {
  ok: boolean
  message: string
} | null

type CollectionFormState = {
  name: string
  description: string
  thumbnailUrl: string
  isPublic: boolean
}

function createEmptyCollectionForm(): CollectionFormState {
  return {
    name: '',
    description: '',
    thumbnailUrl: '',
    isPublic: false,
  }
}

export default function AdminPanelClient({
  userName,
  email,
  roles,
  initialCollections,
  initialTags,
  initialCollectionDetail,
}: {
  userName: string
  email: string
  roles: string[]
  initialCollections: AdminCollection[]
  initialTags: Tag[]
  initialCollectionDetail: AdminCollectionDetail | null
}) {
  const router = useRouter()
  const [collections, setCollections] = useState(initialCollections)
  const [tags, setTags] = useState(initialTags)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(initialCollectionDetail?.id ?? null)
  const [selectedCollectionDetail, setSelectedCollectionDetail] = useState<AdminCollectionDetail | null>(initialCollectionDetail)
  const [collectionsQuery, setCollectionsQuery] = useState('')
  const [tagsQuery, setTagsQuery] = useState('')
  const [deleteConfirmCollectionId, setDeleteConfirmCollectionId] = useState<string | null>(null)
  const [deleteConfirmTagId, setDeleteConfirmTagId] = useState<string | null>(null)
  const [removeRouteConfirmId, setRemoveRouteConfirmId] = useState<string | null>(null)
  const [collectionForm, setCollectionForm] = useState<CollectionFormState>(() => initialCollectionDetail
    ? {
      name: initialCollectionDetail.name,
      description: initialCollectionDetail.description ?? '',
      thumbnailUrl: initialCollectionDetail.thumbnailUrl ?? '',
      isPublic: initialCollectionDetail.isPublic,
    }
    : createEmptyCollectionForm())
  const [newTagName, setNewTagName] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoggingOut, startLogoutTransition] = useTransition()

  const refreshCollections = async (selectedId?: string | null) => {
    const result = await getAdminCollections(1, 50)
    setCollections(result.data)
    setDeleteConfirmCollectionId(null)
    setRemoveRouteConfirmId(null)

    const nextSelectedId = selectedId ?? result.data[0]?.id ?? null
    setSelectedCollectionId(nextSelectedId)

    if (nextSelectedId) {
      const detail = await getAdminCollectionById(nextSelectedId)
      setSelectedCollectionDetail(detail)
      setCollectionForm({
        name: detail.name,
        description: detail.description ?? '',
        thumbnailUrl: detail.thumbnailUrl ?? '',
        isPublic: detail.isPublic,
      })
    } else {
      setSelectedCollectionDetail(null)
      setCollectionForm(createEmptyCollectionForm())
    }
  }

  const refreshTags = async () => {
    const result = await getAdminTags(100)
    setTags(result)
    setDeleteConfirmTagId(null)
  }

  const handleSelectCollection = (collectionId: string) => {
    setFeedback(null)
    startTransition(async () => {
      try {
        const detail = await getAdminCollectionById(collectionId)
        setSelectedCollectionId(collectionId)
        setSelectedCollectionDetail(detail)
        setCollectionForm({
          name: detail.name,
          description: detail.description ?? '',
          thumbnailUrl: detail.thumbnailUrl ?? '',
          isPublic: detail.isPublic,
        })
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to load collection.' })
      }
    })
  }

  const handleSaveCollection = () => {
    if (!selectedCollectionId || !selectedCollectionDetail) return

    if (!collectionForm.name.trim()) {
      setFeedback({ ok: false, message: 'Collection name is required.' })
      return
    }

    setFeedback(null)
    startTransition(async () => {
      try {
        await updateAdminCollection(selectedCollectionId, {
          name: collectionForm.name.trim(),
          description: collectionForm.description.trim() || undefined,
          thumbnailUrl: collectionForm.thumbnailUrl.trim() || undefined,
          isPublic: collectionForm.isPublic,
        })
        await refreshCollections(selectedCollectionId)
        setFeedback({ ok: true, message: 'Collection updated successfully.' })
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to update collection.' })
      }
    })
  }

  const handleDeleteCollection = (collectionId: string) => {
    if (!window.confirm('Delete this collection?')) return

    setFeedback(null)
    startTransition(async () => {
      try {
        await deleteAdminCollection(collectionId)
        await refreshCollections(collectionId === selectedCollectionId ? null : selectedCollectionId)
        setFeedback({ ok: true, message: 'Collection deleted successfully.' })
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to delete collection.' })
      }
    })
  }

  const handleRemoveRoute = (routeId: string) => {
    if (!selectedCollectionId) return
    if (!window.confirm('Remove this route from the collection?')) return

    setFeedback(null)
    startTransition(async () => {
      try {
        await removeRouteFromAdminCollection(selectedCollectionId, routeId)
        await refreshCollections(selectedCollectionId)
        setFeedback({ ok: true, message: 'Route removed from collection.' })
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to remove route.' })
      }
    })
  }

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      setFeedback({ ok: false, message: 'Tag name is required.' })
      return
    }

    setFeedback(null)
    startTransition(async () => {
      try {
        await createAdminTag(newTagName.trim())
        setNewTagName('')
        await refreshTags()
        setFeedback({ ok: true, message: 'Tag created successfully.' })
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to create tag.' })
      }
    })
  }

  const handleDeleteTag = (tagId: string) => {
    if (!window.confirm('Delete this tag?')) return

    setFeedback(null)
    startTransition(async () => {
      try {
        await deleteAdminTag(tagId)
        await refreshTags()
        setFeedback({ ok: true, message: 'Tag deleted successfully.' })
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to delete tag.' })
      }
    })
  }

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logout()
    })
  }

  const totalRoutesInsideCollections = useMemo(
    () => collections.reduce((sum, collection) => sum + collection.routeCount, 0),
    [collections],
  )

  const visibleCollections = useMemo(() => {
    const query = collectionsQuery.trim().toLowerCase()
    if (!query) return collections

    return collections.filter((collection) => {
      const haystack = [collection.name, collection.description, collection.userId, collection.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [collections, collectionsQuery])

  const visibleTags = useMemo(() => {
    const query = tagsQuery.trim().toLowerCase()
    if (!query) return tags

    return tags.filter((tag) => tag.name.toLowerCase().includes(query))
  }, [tags, tagsQuery])

  return (
    <YStack maxWidth={1320} marginHorizontal="auto" padding="$5" gap="$5">
      <YStack
        padding="$6"
        borderRadius="$5"
        backgroundColor="$primary"
        gap="$5"
      >
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$3" flexWrap="wrap">
          <YStack gap="$2" maxWidth={760}>
            <XStack alignItems="center" gap="$2">
              <Shield size={18} color="#FFFFFF" />
              <Text variant="caption" color="#FFFFFF">ADMIN PANEL</Text>
            </XStack>
            <Text variant="heading1" color="#FFFFFF">Moderate collections and taxonomy from one place</Text>
            <Text variant="bodyLarge" color="#FFFFFF">
              Manage user collections, inspect which routes they contain, and keep the tag vocabulary clean.
            </Text>
          </YStack>

          <XStack gap="$2" flexWrap="wrap">
            <Button variant="outline" size="sm" onPress={() => router.push('/')} icon={<Compass size={14} color="currentColor" />}>
              User
            </Button>
            <Button variant="outline" size="sm" onPress={() => router.push('/business')} icon={<BookMarked size={14} color="currentColor" />}>
              Business
            </Button>
            <Button variant="solid" size="sm" disabled icon={<Shield size={14} color="#FFFFFF" />}>
              Admin
            </Button>
            <Button variant="solid" size="sm" onPress={handleLogout} loading={isLoggingOut} icon={<LogOut size={14} color="#FFFFFF" />}>
              Sign Out
            </Button>
          </XStack>
        </XStack>

        <XStack gap="$3" flexWrap="wrap">
          <YStack minWidth={180} padding="$4" borderRadius="$4" backgroundColor="rgba(255,255,255,0.12)" gap="$1">
            <Text variant="caption" color="#FFFFFF">Admin</Text>
            <Text variant="heading4" color="#FFFFFF">{userName}</Text>
            <Text variant="caption" color="#FFFFFF">{email}</Text>
          </YStack>
          <YStack minWidth={180} padding="$4" borderRadius="$4" backgroundColor="rgba(255,255,255,0.12)" gap="$1">
            <Text variant="caption" color="#FFFFFF">Roles</Text>
            <Text variant="heading4" color="#FFFFFF">{roles.join(', ')}</Text>
            <Text variant="caption" color="#FFFFFF">Moderation access active</Text>
          </YStack>
        </XStack>
      </YStack>

      <XStack gap="$3" flexWrap="wrap">
        <YStack flex={1} minWidth={220} backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$1.5" borderWidth={1} borderColor="$borderColor">
          <Text variant="caption" color="$mutedForeground">Collections</Text>
          <Text variant="heading2">{collections.length}</Text>
          <Text variant="body" muted>Loaded into moderation queue</Text>
        </YStack>
        <YStack flex={1} minWidth={220} backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$1.5" borderWidth={1} borderColor="$borderColor">
          <Text variant="caption" color="$mutedForeground">Routes inside collections</Text>
          <Text variant="heading2">{totalRoutesInsideCollections}</Text>
          <Text variant="body" muted>Entries visible in the current page</Text>
        </YStack>
        <YStack flex={1} minWidth={220} backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$1.5" borderWidth={1} borderColor="$borderColor">
          <Text variant="caption" color="$mutedForeground">Tags</Text>
          <Text variant="heading2">{tags.length}</Text>
          <Text variant="body" muted>Available taxonomy items</Text>
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
          <Text variant="body" color={feedback.ok ? '$success500' : '$error500'}>{feedback.message}</Text>
        </XStack>
      )}

      <XStack gap="$5" flexWrap="wrap" alignItems="flex-start">
        <YStack flex={1} minWidth={320} gap="$4">
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$5" gap="$4" borderWidth={1} borderColor="$borderColor">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap="$1">
                <Text variant="heading3">Collections</Text>
                <Text variant="body" muted>Select one to inspect and edit.</Text>
              </YStack>
              <Badge variant="info" size="md">{visibleCollections.length}</Badge>
            </XStack>

            <SearchInput
              value={collectionsQuery}
              onChangeText={setCollectionsQuery}
              placeholder="Search collections by name, user, or ID"
              icon={<Search size={16} color="var(--color-mutedForeground)" />}
            />

            {collections.length === 0 ? (
              <EmptyState
                Icon={FolderOpen}
                title="No collections"
                description="There are no collections to moderate yet."
              />
            ) : visibleCollections.length === 0 ? (
              <EmptyState
                Icon={Search}
                title="No matching collections"
                description="Try a different keyword or clear the search field."
              />
            ) : (
              <YStack gap="$3">
                {visibleCollections.map((collection) => {
                  const isActive = collection.id === selectedCollectionId

                  return (
                    <YStack
                      key={collection.id}
                      padding="$4"
                      borderRadius="$4"
                      borderWidth={1}
                      borderColor={isActive ? '$primary' : '$borderColor'}
                      backgroundColor={isActive ? '$ant50' : '$background'}
                      gap="$3"
                    >
                      <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
                        <YStack gap="$1" flex={1}>
                          <Text variant="heading4">{collection.name}</Text>
                          <Text variant="caption" muted>{collection.userId}</Text>
                        </YStack>
                        <XStack gap="$2" flexWrap="wrap">
                          {collection.isDefault && <Badge variant="default" size="sm">Default</Badge>}
                          <Badge variant={collection.isPublic ? 'success' : 'warning'} size="sm">
                            {collection.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </XStack>
                      </XStack>

                      <Text variant="caption" muted numberOfLines={2}>
                        {collection.description ?? 'No description.'}
                      </Text>

                      <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2">
                        <Text variant="caption" muted>{collection.routeCount} routes</Text>
                        <XStack gap="$2" flexWrap="wrap">
                          <Button
                            variant={isActive ? 'solid' : 'outline'}
                            size="sm"
                            onPress={() => handleSelectCollection(collection.id)}
                          >
                            {isActive ? 'Opened' : 'Open'}
                          </Button>
                          {deleteConfirmCollectionId === collection.id ? (
                            <XStack gap="$2">
                              <Button
                                variant="outline"
                                size="sm"
                                onPress={() => setDeleteConfirmCollectionId(null)}
                                disabled={isPending}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="solid"
                                size="sm"
                                onPress={() => handleDeleteCollection(collection.id)}
                                disabled={isPending}
                                backgroundColor="$error500"
                                hoverStyle={{ backgroundColor: '$error400' }}
                              >
                                Confirm Delete
                              </Button>
                            </XStack>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onPress={() => setDeleteConfirmCollectionId(collection.id)}
                              disabled={isPending}
                              icon={<Trash2 size={14} color="var(--color-error500, #DC2626)" />}
                            >
                              <Text variant="label" color="$error500">Delete</Text>
                            </Button>
                          )}
                        </XStack>
                      </XStack>
                    </YStack>
                  )
                })}
              </YStack>
            )}
          </YStack>

          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$5" gap="$4" borderWidth={1} borderColor="$borderColor">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap="$1">
                <Text variant="heading3">Tags</Text>
                <Text variant="body" muted>Create and remove tags used across the app.</Text>
              </YStack>
              <Sparkles size={18} color="var(--color-primary)" />
            </XStack>

            <SearchInput
              value={tagsQuery}
              onChangeText={setTagsQuery}
              placeholder="Search tags"
              icon={<Search size={16} color="var(--color-mutedForeground)" />}
            />

            <XStack gap="$3" flexWrap="wrap" alignItems="flex-end">
              <YStack flex={1} minWidth={220} gap="$1.5">
                <Text variant="label" color="$mutedForeground">New tag</Text>
                <Input
                  value={newTagName}
                  onChangeText={setNewTagName}
                  variant="outline"
                  size="md"
                  placeholder="e.g. Historical"
                />
              </YStack>
              <Button variant="solid" size="md" onPress={handleCreateTag} loading={isPending} disabled={isPending}>
                Create Tag
              </Button>
            </XStack>

            {tags.length === 0 ? (
              <EmptyState
                Icon={TagIcon}
                title="No tags"
                description="Create the first tag to start structuring route discovery."
              />
            ) : visibleTags.length === 0 ? (
              <EmptyState
                Icon={Search}
                title="No matching tags"
                description="Try a different keyword or clear the search field."
              />
            ) : (
              <XStack gap="$2" flexWrap="wrap">
                {visibleTags.map((tag) => (
                  <XStack
                    key={tag.id}
                    alignItems="center"
                    gap="$2"
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$full"
                    backgroundColor="$muted"
                  >
                    <Text variant="body">{tag.name}</Text>
                    {deleteConfirmTagId === tag.id ? (
                      <XStack gap="$2">
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => setDeleteConfirmTagId(null)}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="solid"
                          size="sm"
                          onPress={() => handleDeleteTag(tag.id)}
                          disabled={isPending}
                          backgroundColor="$error500"
                          hoverStyle={{ backgroundColor: '$error400' }}
                        >
                          Delete
                        </Button>
                      </XStack>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => setDeleteConfirmTagId(tag.id)}
                        disabled={isPending}
                        icon={<Trash2 size={12} color="var(--color-error500, #DC2626)" />}
                      >
                        Remove
                      </Button>
                    )}
                  </XStack>
                ))}
              </XStack>
            )}
          </YStack>
        </YStack>

        <YStack flex={1.2} minWidth={360} gap="$4">
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$5" gap="$4" borderWidth={1} borderColor="$borderColor">
            <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
              <YStack gap="$1">
                <Text variant="heading3">Collection detail</Text>
                <Text variant="body" muted>Edit metadata and remove route entries.</Text>
              </YStack>
              {selectedCollectionDetail && (
                <Badge variant="info" size="md">{selectedCollectionDetail.routes.length} routes</Badge>
              )}
            </XStack>

            {!selectedCollectionDetail ? (
              <EmptyState
                Icon={FolderOpen}
                title="No collection selected"
                description="Pick a collection from the left side to inspect it here."
              />
            ) : (
              <YStack gap="$4">
                <YStack gap="$3">
                  <YStack gap="$1.5">
                    <Text variant="label" color="$mutedForeground">Name *</Text>
                    <Input
                      value={collectionForm.name}
                      onChangeText={(value) => setCollectionForm((prev) => ({ ...prev, name: value }))}
                      variant="outline"
                      size="md"
                    />
                  </YStack>

                  <YStack gap="$1.5">
                    <Text variant="label" color="$mutedForeground">Description</Text>
                    <Input
                      value={collectionForm.description}
                      onChangeText={(value) => setCollectionForm((prev) => ({ ...prev, description: value }))}
                      variant="outline"
                      size="md"
                      // @ts-ignore multiline web
                      multiline
                      numberOfLines={4}
                    />
                  </YStack>

                  <YStack gap="$1.5">
                    <Text variant="label" color="$mutedForeground">Thumbnail URL</Text>
                    <Input
                      value={collectionForm.thumbnailUrl}
                      onChangeText={(value) => setCollectionForm((prev) => ({ ...prev, thumbnailUrl: value }))}
                      variant="outline"
                      size="md"
                      autoCapitalize="none"
                    />
                  </YStack>

                  <Switch
                    label="Collection is public"
                    checked={collectionForm.isPublic}
                    onCheckedChange={(checked) => setCollectionForm((prev) => ({ ...prev, isPublic: Boolean(checked) }))}
                  />

                  <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
                    <Text variant="caption" muted>User ID: {selectedCollectionDetail.userId}</Text>
                    <Button variant="solid" size="md" onPress={handleSaveCollection} loading={isPending} disabled={isPending}>
                      Save Collection
                    </Button>
                  </XStack>
                </YStack>

                <YStack gap="$3">
                  <Text variant="heading4">Routes in collection</Text>
                  {selectedCollectionDetail.routes.length === 0 ? (
                    <YStack padding="$4" borderRadius="$4" backgroundColor="$background" borderWidth={1} borderColor="$borderColor">
                      <Text variant="body" muted>This collection has no routes.</Text>
                    </YStack>
                  ) : (
                    <YStack gap="$3">
                      {selectedCollectionDetail.routes.map((route) => (
                        <YStack key={route.routeId} padding="$4" borderRadius="$4" backgroundColor="$background" borderWidth={1} borderColor="$borderColor" gap="$3">
                          <XStack justifyContent="space-between" alignItems="flex-start" gap="$3" flexWrap="wrap">
                            <YStack gap="$1" flex={1}>
                              <Text variant="heading4">{route.title ?? 'Untitled route'}</Text>
                              <Text variant="caption" muted>{route.routeId}</Text>
                            </YStack>
                            <XStack gap="$2" flexWrap="wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onPress={() => router.push(`/routes/${route.routeId}`)}
                              >
                                Open Route
                              </Button>
                              {removeRouteConfirmId === route.routeId ? (
                                <XStack gap="$2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onPress={() => setRemoveRouteConfirmId(null)}
                                    disabled={isPending}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="solid"
                                    size="sm"
                                    onPress={() => handleRemoveRoute(route.routeId)}
                                    disabled={isPending}
                                    backgroundColor="$error500"
                                    hoverStyle={{ backgroundColor: '$error400' }}
                                  >
                                    Confirm Remove
                                  </Button>
                                </XStack>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onPress={() => setRemoveRouteConfirmId(route.routeId)}
                                  disabled={isPending}
                                  icon={<Trash2 size={14} color="var(--color-error500, #DC2626)" />}
                                >
                                  <Text variant="label" color="$error500">Remove</Text>
                                </Button>
                              )}
                            </XStack>
                          </XStack>
                          <Text variant="caption" muted>
                            Saved {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(route.savedAt))}
                          </Text>
                        </YStack>
                      ))}
                    </YStack>
                  )}
                </YStack>
              </YStack>
            )}
          </YStack>
        </YStack>
      </XStack>
    </YStack>
  )
}
