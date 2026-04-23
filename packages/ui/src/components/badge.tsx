import React from 'react'
import { styled, GetProps, XStack, Text as TamaguiText } from 'tamagui'
import { splitAccessibilityProps } from './accessibility-props'

const BadgeFrame = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$full',
  paddingHorizontal: '$2',

  variants: {
    size: {
      sm: { height: 20, paddingHorizontal: '$1.5' },
      md: { height: 24, paddingHorizontal: '$2' },
    },
    variant: {
      default: {
        backgroundColor: '$muted',
      },
      success: {
        backgroundColor: '#D1FADF',
      },
      warning: {
        backgroundColor: '#FDE68A',
      },
      error: {
        backgroundColor: '#FEE2E2',
      },
      info: {
        backgroundColor: '#DBEAFE',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

const BadgeLabel = styled(TamaguiText, {
  fontFamily: '$body',
  fontWeight: '500',

  variants: {
    size: {
      sm: { fontSize: '$2', lineHeight: '$2' },
      md: { fontSize: '$3', lineHeight: '$3' },
    },
    variant: {
      default: { color: '$mutedForeground' },
      success: { color: '#16A34A' },
      warning: { color: '#D97706' },
      error: { color: '#DC2626' },
      info: { color: '#2563EB' },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
type BadgeSize = 'sm' | 'md'

export type BadgeProps = Omit<GetProps<typeof BadgeFrame>, 'variant'> & {
  variant?: BadgeVariant
  size?: BadgeSize
  children?: React.ReactNode
}

export function Badge({ children, variant = 'default', size = 'md', ...rest }: BadgeProps) {
  const { rest: badgeRest, accessibilityProps } = splitAccessibilityProps(rest)

  return (
    <BadgeFrame variant={variant} size={size} {...accessibilityProps} {...badgeRest}>
      <BadgeLabel variant={variant} size={size}>
        {children}
      </BadgeLabel>
    </BadgeFrame>
  )
}
