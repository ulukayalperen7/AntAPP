'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Input } from '@antapp/ui'
import type { Collection } from '@/types/api'
import { FolderOpen, Plus, Globe, Lock, X } from 'lucide-react'
import { createCollection } from '@/features/collections/actions'

function CollectionCard({ collection }: { collection: Collection }) {
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
          <img
            src={collection.thumbnailUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <FolderOpen size={40} color="var(--color-mutedForeground)" strokeWidth={1.5} />
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
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create collection.')
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
      // @ts-ignore
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
        onPress={(e: any) => e.stopPropagation()}
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

  const handleCreated = () => {
    // Refresh the page to load the new collection
    router.refresh()
  }

  return (
    <YStack gap="$5" flex={1}>
      {showModal && (
        <NewCollectionModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      <YStack gap="$2">
        <Text variant="heading2">My Collections</Text>
        <Text variant="body" muted>Save and organize your favorite routes</Text>
      </YStack>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {collections.map((col) => (
          <CollectionCard key={col.id} collection={col} />
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
