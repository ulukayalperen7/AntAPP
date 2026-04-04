import React from 'react'
import { styled, GetProps, XStack, isWeb } from 'tamagui'

const IconButtonFrame = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$full',
  cursor: 'pointer',

  variants: {
    size: {
      sm: { width: 32, height: 32 },
      md: { width: 40, height: 40 },
      lg: { width: 48, height: 48 },
    },
    variant: {
      ghost: {
        backgroundColor: 'transparent',
        pressStyle: { backgroundColor: '$backgroundPress' },
        hoverStyle: { backgroundColor: '$backgroundHover' },
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$borderColor',
        pressStyle: { backgroundColor: '$backgroundPress' },
        hoverStyle: { backgroundColor: '$backgroundHover' },
      },
      solid: {
        backgroundColor: '$primary',
        pressStyle: { backgroundColor: '$primaryPress' },
        hoverStyle: { backgroundColor: '$primaryHover' },
      },
      muted: {
        backgroundColor: '$muted',
        pressStyle: { backgroundColor: '$backgroundPress' },
        hoverStyle: { backgroundColor: '$backgroundHover' },
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    variant: 'ghost',
  },
})

type IconButtonSize = 'sm' | 'md' | 'lg'
type IconButtonVariant = 'ghost' | 'outline' | 'solid' | 'muted'

export type IconButtonProps = Omit<GetProps<typeof IconButtonFrame>, 'variant'> & {
  variant?: IconButtonVariant
  size?: IconButtonSize
  children: React.ReactNode
}

export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  accessibilityLabel,
  accessibilityRole,
  role,
  'aria-label': ariaLabel,
  ...rest
}: IconButtonProps) {
  return (
    <IconButtonFrame
      variant={variant}
      size={size}
      tag={isWeb ? 'button' : undefined}
      type={isWeb ? 'button' : undefined}
      role={isWeb ? (role ?? accessibilityRole ?? 'button') : role}
      aria-label={isWeb ? (ariaLabel ?? accessibilityLabel) : ariaLabel}
      accessibilityRole={isWeb ? undefined : (accessibilityRole ?? 'button')}
      accessibilityLabel={isWeb ? undefined : accessibilityLabel}
      {...rest}
    >
      {children}
    </IconButtonFrame>
  )
}
