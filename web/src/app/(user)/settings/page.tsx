'use client'

import { YStack, Text } from '@antapp/ui'
import { Settings } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

export default function SettingsPage() {
  return (
    <YStack gap="$5" flex={1}>
      <YStack gap="$1">
        <Text variant="heading2">Settings</Text>
        <Text variant="body" muted>Manage your account and preferences</Text>
      </YStack>

      <EmptyState
        Icon={Settings}
        title="Settings coming soon"
        description="Account settings, notification preferences, and privacy controls will be available here."
      />
    </YStack>
  )
}
