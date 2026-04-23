import React from 'react'
import { Text, YStack } from '../style-system'

export type StatBoxProps = React.ComponentProps<typeof YStack> & {
  value: string | number
  label: string
  icon?: React.ReactNode
}

export function StatBox({ value, label, icon, ...props }: StatBoxProps) {
  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      gap="$1"
      paddingVertical="$3"
      paddingHorizontal="$4"
      backgroundColor="$backgroundStrong"
      borderRadius="$3"
      flex={1}
      {...props}
    >
      {icon}
      <Text variant="heading4" weight="bold">{value}</Text>
      <Text variant="caption" weight="medium" muted textTransform="uppercase">
        {label}
      </Text>
    </YStack>
  )
}
