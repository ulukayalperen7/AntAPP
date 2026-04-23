'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Input, Image } from '@antapp/ui'
import type { Collection } from '@/types/api'
import { Plus, Globe, Lock, X, Trash2, AlertTriangle } from 'lucide-react'
import { createCollection, deleteCollection } from '@/features/collections/actions'

function collectionCoverStyle(id: string) {
  const gradients = [
    'linear-gradient(135deg, #0A4A7A 0%, #1E81B0 52%, #58B9E0 100%)',
    'linear-gradient(135deg, #7A2F0A 0%, #C35B1D 55%, #F9A44B 100%)',
    'linear-gradient(135deg, #0A6A56 0%, #0FA37F 50%, #6BE8C6 100%)',
    'linear-gradient(135deg, #3D3D68 0%, #6262A6 52%, #9E9EEB 100%)',
  ]
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return gradients[seed % gradients.length]
}

function stopEventPropagation(e: unknown) {
  if (e && typeof e === 'object' && 'stopPropagation' in e && typeof (e as { stopPropagation?: unknown }).stopPropagation === 'function') {
    ; (e as { stopPropagation: () => void }).stopPropagation()
  }
}

function CollectionCard({
  collection,
  onDeleteRequest,
}: {
  collection: Collection
  onDeleteRequest: (collection: Collection) => void
}) {
  const router = useRouter()

  return (
    <YStack
      backgroundColor="$backgroundStrong"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      overflow="hidden"
      cursor="pointer"
      onPress={() => router.push(`/collections/${collection.id}`)}
      hoverStyle={{ borderColor: '$primary', opacity: 0.95 }}
      pressStyle={{ scale: 0.985 }}
    >
      <YStack height={160} backgroundColor="$muted" alignItems="center" justifyContent="center">
        {collection.thumbnailUrl ? (
          <Image
            src={collection.thumbnailUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <YStack
            width="100%"
            height="100%"
            justifyContent="space-between"
            padding="$3"
            style={{ background: collectionCoverStyle(collection.id) }}
          >
            <XStack justifyContent="flex-end" alignItems="center">
              <XStack
                backgroundColor="rgba(255,255,255,0.2)"
                borderRadius="$full"
                paddingHorizontal="$2"
                paddingVertical="$1"
              >
                <Text variant="caption" color="#FFFFFF">{collection.routeCount ?? 0} routes</Text>
              </XStack>
            </XStack>
            <XStack />
          </YStack>
        )}
      </YStack>

      <YStack padding="$4" gap="$2">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <Text variant="heading4" flex={1} numberOfLines={1}>{collection.name}</Text>
          <XStack alignItems="center" gap="$1" marginLeft="$2">
            {collection.isPublic ? <Globe size={14} color="var(--color-mutedForeground)" /> : <Lock size={14} color="var(--color-mutedForeground)" />}
          </XStack>
        </XStack>

        {collection.description ? (
          <Text variant="caption" muted numberOfLines={2}>{collection.description}</Text>
        ) : null}

        <XStack justifyContent="space-between" alignItems="center" marginTop="$1">
          <Text variant="caption" muted>{collection.routeCount ?? 0} routes</Text>
          {collection.isDefault ? (
            <Text variant="caption" color="$primary" weight="semibold">Saved Routes</Text>
          ) : null}
        </XStack>
      </YStack>

      {!collection.isDefault ? (
        <XStack
          position="absolute"
          right="$3"
          bottom="$3"
          width={34}
          height={34}
          borderRadius="$full"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          backgroundColor="#EA580C"
          borderWidth={1}
          borderColor="#C2410C"
          style={{ boxShadow: '0 4px 12px rgba(234, 88, 12, 0.36)' }}
          hoverStyle={{ backgroundColor: '#C2410C' }}
          pressStyle={{ scale: 0.96 }}
          onPress={(e) => {
            stopEventPropagation(e)
            onDeleteRequest(collection)
          }}
        >
          <Trash2 size={16} color="#FFFFFF" />
        </XStack>
      ) : null}
    </YStack>
  )
}

function DeleteCollectionModal({
  target,
  deleting,
  error,
  onClose,
  onConfirm,
}: {
  target: Collection
  deleting: boolean
  error: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <YStack
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={220}
      backgroundColor="rgba(0,0,0,0.5)"
      alignItems="center"
      justifyContent="center"
      style={{ backdropFilter: 'blur(4px)' }}
      onPress={onClose}
    >
      <YStack
        backgroundColor="$backgroundStrong"
        borderRadius="$5"
        borderWidth={1}
        borderColor="$borderColor"
        padding="$6"
        gap="$4"
        width={420}
        maxWidth="92vw"
        onPress={stopEventPropagation}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" gap="$2">
            <AlertTriangle size={18} color="var(--color-error500)" />
            <Text variant="heading3">Delete Collection</Text>
          </XStack>
          <XStack cursor="pointer" onPress={onClose} padding="$1">
            <X size={20} color="currentColor" />
          </XStack>
        </XStack>

        <YStack gap="$2">
          <Text variant="body">
            Delete <Text variant="body" weight="semibold">{target.name}</Text>?
          </Text>
          <Text variant="caption" muted>
            This removes only the collection. Routes stay intact.
          </Text>
          <Text variant="caption" muted>
            It currently contains {target.routeCount ?? 0} routes.
          </Text>
          {error ? <Text variant="caption" color="$error500">{error}</Text> : null}
        </YStack>

        <XStack gap="$3" justifyContent="flex-end">
          <Button variant="ghost" size="md" onPress={onClose} disabled={deleting}>Cancel</Button>
          <Button variant="solid" size="md" onPress={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Collection'}
          </Button>
        </XStack>
      </YStack>
    </YStack>
  )
}

function NewCollectionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) { setError('Collection name is required.'); return }
    setLoading(true)
    setError('')
    try {
      await createCollection({ name: name.trim(), description: description.trim() || undefined })
      onCreated()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create collection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={200}
      backgroundColor="rgba(0,0,0,0.5)"
      alignItems="center"
      justifyContent="center"
      style={{ backdropFilter: 'blur(4px)' }}
      onPress={onClose}
    >
      <YStack
        backgroundColor="$backgroundStrong"
        borderRadius="$5"
        borderWidth={1}
        borderColor="$borderColor"
        padding="$6"
        gap="$4"
        width={400}
        maxWidth="90vw"
        onPress={(e: unknown) => {
          if (e && typeof e === 'object' && 'stopPropagation' in e && typeof (e as { stopPropagation?: unknown }).stopPropagation === 'function') {
            ;(e as { stopPropagation: () => void }).stopPropagation()
          }
        }}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">New Collection</Text>
          <XStack cursor="pointer" onPress={onClose} padding="$1">
            <X size={20} color="currentColor" />
          </XStack>
        </XStack>

        <YStack gap="$3">
          <YStack gap="$1">
            <Text variant="label">Name *</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="e.g. Weekend Getaways"
            />
          </YStack>
          <YStack gap="$1">
            <Text variant="label">Description</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description..."
            />
          </YStack>
          {error ? <Text variant="caption" color="$error500">{error}</Text> : null}
        </YStack>

        <XStack gap="$3" justifyContent="flex-end">
          <Button variant="ghost" size="md" onPress={onClose}>Cancel</Button>
          <Button variant="solid" size="md" onPress={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </XStack>
      </YStack>
    </YStack>
  )
}

export default function CollectionsClient({ collections: initialCollections }: { collections: Collection[]; total: number }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [collections, setCollections] = useState(initialCollections)
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setCollections(initialCollections)
  }, [initialCollections])

  const handleCreated = () => {
    // Refresh the page to load the new collection
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteError('')
    setIsDeleting(true)
    try {
      await deleteCollection(deleteTarget.id)
      setCollections((prev) => prev.filter((collection) => collection.id !== deleteTarget.id))
      setDeleteTarget(null)
      router.refresh()
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete collection.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <YStack gap="$5" flex={1}>
      {showModal && (
        <NewCollectionModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
      {deleteTarget && (
        <DeleteCollectionModal
          target={deleteTarget}
          deleting={isDeleting}
          error={deleteError}
          onClose={() => {
            if (isDeleting) return
            setDeleteTarget(null)
            setDeleteError('')
          }}
          onConfirm={handleDelete}
        />
      )}

      <YStack gap="$2">
        <Text variant="heading2">My Collections</Text>
        <Text variant="body" muted>Save and organize your favorite routes</Text>
      </YStack>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {collections.map((col) => (
          <CollectionCard
            key={col.id}
            collection={col}
            onDeleteRequest={(collection) => {
              if (collection.isDefault) return
              setDeleteError('')
              setDeleteTarget(collection)
            }}
          />
        ))}

        {/* New Collection card */}
        <YStack
          borderRadius="$4"
          borderWidth={2}
          borderStyle="dashed"
          borderColor="$borderColor"
          alignItems="center"
          justifyContent="center"
          minHeight={220}
          cursor="pointer"
          gap="$3"
          onPress={() => setShowModal(true)}
          hoverStyle={{ borderColor: '$primary', backgroundColor: '$ant50' }}
          pressStyle={{ scale: 0.98 }}
        >
          <YStack
            backgroundColor="$muted"
            borderRadius="$round"
            padding="$3"
          >
            <Plus size={24} color="var(--color-primary)" />
          </YStack>
          <YStack alignItems="center" gap="$1">
            <Text variant="label" color="$primary">New Collection</Text>
            <Text variant="caption" muted>Organize your saved routes</Text>
          </YStack>
        </YStack>
      </div>
    </YStack>
  )
}
