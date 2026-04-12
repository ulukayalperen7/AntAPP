'use client'

import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import type { Collection } from '@/types/api'
import { FolderOpen, Plus, Globe, Lock } from 'lucide-react'

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
    >
      <YStack height={120} backgroundColor="$muted" alignItems="center" justifyContent="center">
        {collection.thumbnailUrl ? (
          <img
            src={collection.thumbnailUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <FolderOpen size={40} color="var(--color-mutedForeground)" strokeWidth={1.5} />
        )}
      </YStack>

      <YStack padding="$4" gap="$2">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <Text variant="heading4" flex={1} numberOfLines={1}>{collection.name}</Text>
          <XStack alignItems="center" gap="$1" marginLeft="$2">
            {collection.isPublic ? <Globe size={14} /> : <Lock size={14} />}
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

export default function SavedClient({ collections }: { collections: Collection[]; total: number }) {
  const router = useRouter()

  return (
    <YStack gap="$5" flex={1}>
      <XStack justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="$3">
        <YStack gap="$1">
          <Text variant="heading2">My Collections</Text>
          <Text variant="body" muted>Save and organize your favorite routes</Text>
        </YStack>
        <Button variant="solid" size="md" icon={<Plus size={16} />} onPress={() => { }}>
          New Collection
        </Button>
      </XStack>

      <XStack flexWrap="wrap" gap="$4">
        {collections.map((col) => (
          <YStack key={col.id} flex={1} minWidth={240} maxWidth="33.3%">
            <CollectionCard collection={col} />
          </YStack>
        ))}

        <YStack
          flex={1}
          minWidth={240}
          maxWidth="33.3%"
          borderRadius="$4"
          borderWidth={2}
          borderStyle="dashed"
          borderColor="$borderColor"
          alignItems="center"
          justifyContent="center"
          minHeight={200}
          cursor="pointer"
          gap="$2"
          onPress={() => { }}
        >
          <Plus size={24} />
          <Text variant="label">New Collection</Text>
        </YStack>
      </XStack>
    </YStack>
  )
}
