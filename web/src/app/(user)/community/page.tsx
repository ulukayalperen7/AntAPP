'use client'

import { YStack, Text } from '@antapp/ui'
import { Users } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

export default function CommunityPage() {
  return (
    <YStack gap="$5" flex={1}>
      <YStack gap="$1">
        <Text variant="heading2">Community</Text>
        <Text variant="body" muted>Connect with fellow explorers</Text>
      </YStack>

      <EmptyState
        Icon={Users}
        title="Community is coming soon"
        description="Soon you'll be able to follow explorers, join groups, and share your adventures together."
      />
    </YStack>
  )
}
