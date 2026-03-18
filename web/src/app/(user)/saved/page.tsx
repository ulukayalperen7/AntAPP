'use client'

import { YStack, XStack, Text } from '@antapp/ui'
import { Bookmark } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

export default function SavedPage() {
  const savedRoutes: unknown[] = []

  return (
    <YStack gap="$5" flex={1}>
      <YStack gap="$1">
        <Text variant="heading2">Saved Routes</Text>
        <Text variant="body" muted>Routes you've bookmarked for later</Text>
      </YStack>

      {savedRoutes.length === 0 ? (
        <EmptyState
          Icon={Bookmark}
          title="No saved routes yet"
          description="Save routes you love and they'll appear here for quick access."
          actionLabel="Explore Routes"
        />
      ) : null}
    </YStack>
  )
}
