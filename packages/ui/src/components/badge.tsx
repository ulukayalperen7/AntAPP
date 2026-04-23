import React from 'react'
import { Text, XStack } from '../style-system'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
type BadgeSize = 'sm' | 'md'

const SIZE_STYLES = {
  sm: { height: 20, paddingHorizontal: '$1.5', fontSize: '$2' },
  md: { height: 24, paddingHorizontal: '$2', fontSize: '$3' },
} as const

const VARIANT_STYLES = {
  default: { backgroundColor: '$muted', color: '$mutedForeground' },
  success: { backgroundColor: '#D1FADF', color: '$success500' },
  warning: { backgroundColor: '#FDE68A', color: '$warning500' },
  error: { backgroundColor: '#FEE2E2', color: '$error500' },
  info: { backgroundColor: '#DBEAFE', color: '$info500' },
} as const

export type BadgeProps = React.ComponentProps<typeof XStack> & {
  variant?: BadgeVariant
  size?: BadgeSize
  children?: React.ReactNode
}

export function Badge({ children, variant = 'default', size = 'md', ...props }: BadgeProps) {
  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      borderRadius="$full"
      {...SIZE_STYLES[size]}
      backgroundColor={VARIANT_STYLES[variant].backgroundColor}
      {...props}
    >
      <Text variant="caption" fontSize={SIZE_STYLES[size].fontSize} weight="medium" color={VARIANT_STYLES[variant].color}>
        {children}
      </Text>
    </XStack>
  )
}
