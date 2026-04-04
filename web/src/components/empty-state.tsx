'use client'

import { YStack, XStack, Text, Button } from '@antapp/ui'
import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  Icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingVertical="$10"
      gap="$4"
    >
      <XStack
        width={72}
        height={72}
        borderRadius="$full"
        backgroundColor="$ant50"
        alignItems="center"
        justifyContent="center"
      >
        <Icon size={32} color="var(--color-primary)" strokeWidth={1.5} />
      </XStack>
      <YStack alignItems="center" gap="$2" maxWidth={360}>
        <Text variant="heading4" align="center">{title}</Text>
        <Text variant="body" muted align="center">{description}</Text>
      </YStack>
      {actionLabel && onAction && (
        <Button variant="solid" size="md" onPress={onAction}>{actionLabel}</Button>
      )}
    </YStack>
  )
}
