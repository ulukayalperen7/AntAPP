import React from 'react'
import { Text, XStack, isWeb } from '../style-system'

export type FilterChipProps = React.ComponentProps<typeof XStack> & {
  active?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

export function FilterChip({ active = false, icon, children, ...props }: FilterChipProps) {
  return (
    <XStack
      as={isWeb ? 'button' : undefined}
      type={isWeb ? 'button' : undefined}
      alignItems="center"
      justifyContent="center"
      borderRadius="$full"
      paddingHorizontal="$3"
      height={36}
      cursor="pointer"
      gap="$1.5"
      backgroundColor={active ? '$primary' : '$muted'}
      hoverStyle={active ? undefined : { backgroundColor: '$backgroundHover' }}
      pressStyle={active ? { opacity: 0.92 } : { backgroundColor: '$backgroundPress' }}
      {...props}
    >
      {icon}
      <Text variant="body" fontSize="$4" weight="medium" color={active ? '#FFFFFF' : '$color'}>
        {children}
      </Text>
    </XStack>
  )
}
