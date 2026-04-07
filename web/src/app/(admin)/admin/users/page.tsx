'use client'

import { YStack, XStack, Text, Button } from '@antapp/ui'
import { ArrowLeft } from 'lucide-react'

export default function AdminUsersPage() {

  return (
    <YStack flex={1} gap="$6" padding="$6">
      <XStack justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderBottomColor="$borderColor" paddingBottomVertical="$4">
        <XStack gap="$3" alignItems="center">
          <a href="/admin">
            <Button size="md" variant="ghost" icon={<ArrowLeft size={18} />}>
              Back
            </Button>
          </a>
          <img src="/ant-logo.png" alt="AntAPP Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <Text variant="heading2">User Management</Text>
        </XStack>
      </XStack>

      <YStack gap="$4" alignItems="center" justifyContent="center" flex={1}>
        <Text variant="heading3">Coming Soon</Text>
        <Text variant="body" muted>User management panel will be available soon.</Text>
      </YStack>
    </YStack>
  )
}
