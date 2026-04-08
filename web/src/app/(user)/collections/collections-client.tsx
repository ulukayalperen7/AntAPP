'use client'

import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Badge } from '@antapp/ui'
import type { Collection } from '@/types/api'
import { Bookmark, FolderOpen, Plus, Globe, Lock } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

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
      hoverStyle={{ borderColor: '$primary', opacity: 0.95 }}
      pressStyle={{ scale: 0.98 }}
      onPress={() => router.push(`/collections/${collection.id}`)}
    >
      {/* Thumbnail placeholder */}
      <YStack
        height={120}
        backgroundColor="$muted"
        alignItems="center"
        justifyContent="center"
      >
        {collection.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={collection.thumbnailUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <FolderOpen size={40} color="var(--color-mutedForeground)" strokeWidth={1.5} />
        )}
      </YStack><YStack padding="$4" gap="$2"><XStack justifyContent="space-between" alignItems="flex-start"><Text variant="heading4" flex={1} numberOfLines={1}>{collection.name}</Text><XStack alignItems="center" gap="$1" marginLeft="$2">
        {collection.isPublic
          ? <Globe size={14} color="var(--color-mutedForeground)" />
          : <Lock size={14} color="var(--color-mutedForeground)" />
        }
      </XStack></XStack>
        {collection.description && (
          <Text variant="caption" muted numberOfLines={2}>{collection.description}</Text>
        )}
        <XStack justifyContent="space-between" alignItems="center" marginTop="$1"><Text variant="caption" muted>{collection.routeCount ?? 0} routes</Text>{collection.isDefault && (
          <Badge variant="info" size="sm">Default</Badge>
        )}</XStack></YStack>
    </YStack>
  )
}

export default function SavedClient({
  collections,
  total,
}: {
  collections: Collection[]
  total: number
}) {
  const router = useRouter()

  return (
    <YStack gap="$5" flex={1}>
      <XStack justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="$3">
        <YStack gap="$1">
          <Text variant="heading2">My Collections</Text>
          <Text variant="body" muted>Save and organize your favorite routes</Text>
        </YStack>
        {collections.length > 0 && (
          <Button
            variant="solid"
            size="md"
            icon={<Plus size={16} color="#fff" />}
            onPress={() => {/* TODO: create collection modal */ }}
          >
            New Collection
          </Button>
        )}
      </XStack>

      {collections.length === 0 ? (
        <EmptyState
          Icon={Bookmark}
          title="No collections yet"
          description="Save routes you love and they'll appear here. Create a collection to organize your adventures."
          actionLabel="Explore Routes"
          onAction={() => router.push('/search')}
        />
      ) : (
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
            hoverStyle={{ borderColor: '$primary' }}
            onPress={() => {/* TODO: create collection modal */ }}
          >
            <XStack
              width={48}
              height={48}
              borderRadius="$full"
              backgroundColor="$muted"
              alignItems="center"
              justifyContent="center"
            >
              <Plus size={24} color="var(--color-mutedForeground)" />
            </XStack>
            <Text variant="label">New Collection</Text>
            <Text variant="caption" muted>Organize your saved routes</Text>
          </YStack>
        </XStack>
      )}
    </YStack>
  )
}
