import React from 'react'
import { XStack, isWeb } from '../style-system'

type IconButtonSize = 'sm' | 'md' | 'lg'
type IconButtonVariant = 'ghost' | 'outline' | 'solid' | 'muted'

const SIZE_STYLES = {
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 48, height: 48 },
} as const

const VARIANT_STYLES = {
  ghost: {
    backgroundColor: 'transparent',
    hoverStyle: { backgroundColor: '$backgroundHover' },
    pressStyle: { backgroundColor: '$backgroundPress' },
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '$borderColor',
    hoverStyle: { backgroundColor: '$backgroundHover' },
    pressStyle: { backgroundColor: '$backgroundPress' },
  },
  solid: {
    backgroundColor: '$primary',
    hoverStyle: { backgroundColor: '$primaryHover' },
    pressStyle: { backgroundColor: '$primaryPress' },
  },
  muted: {
    backgroundColor: '$muted',
    hoverStyle: { backgroundColor: '$backgroundHover' },
    pressStyle: { backgroundColor: '$backgroundPress' },
  },
} as const

export type IconButtonProps = React.ComponentProps<typeof XStack> & {
  variant?: IconButtonVariant
  size?: IconButtonSize
  children: React.ReactNode
}

export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  ...props
}: IconButtonProps) {
  return (
    <XStack
      as={isWeb ? 'button' : undefined}
      type={isWeb ? 'button' : undefined}
      alignItems="center"
      justifyContent="center"
      borderRadius="$full"
      cursor="pointer"
      {...SIZE_STYLES[size]}
      {...VARIANT_STYLES[variant]}
      {...props}
    >
      {children}
    </XStack>
  )
}
