import React from 'react'
import { styled, GetProps, XStack, Text as TamaguiText, Spinner, useTheme } from 'tamagui'
import { splitAccessibilityProps } from './accessibility-props'

const ButtonFrame = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  borderWidth: 1,
  borderRadius: '$3',
  cursor: 'pointer',

  variants: {
    size: {
      sm: { height: '$3', paddingHorizontal: '$3' },
      md: { height: '$4', paddingHorizontal: '$4' },
      lg: { height: '$5', paddingHorizontal: '$5' },
    },
    variant: {
      solid: {
        backgroundColor: '$primary',
        borderColor: '$primary',
        pressStyle: { backgroundColor: '$primaryPress', borderColor: '$primaryPress' },
        hoverStyle: { backgroundColor: '$primaryHover', borderColor: '$primaryHover' },
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '$borderColor',
        pressStyle: { backgroundColor: '$backgroundPress' },
        hoverStyle: { backgroundColor: '$backgroundHover', borderColor: '$borderColorHover' },
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        pressStyle: { backgroundColor: '$backgroundPress' },
        hoverStyle: { backgroundColor: '$backgroundHover' },
      },
      link: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
        height: 'auto',
        pressStyle: { opacity: 0.7 },
        hoverStyle: { opacity: 0.85 },
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        pointerEvents: 'none',
        cursor: 'not-allowed',
      },
    },
    loading: {
      true: {
        pointerEvents: 'none',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    variant: 'solid',
  },
})

const ButtonLabel = styled(TamaguiText, {
  fontFamily: '$body',
  fontWeight: '600',
  userSelect: 'none',

  variants: {
    variant: {
      solid: { color: '$backgroundStrong' },
      outline: { color: '$primary' },
      ghost: { color: '$primary' },
      link: { color: '$primary' },
    },
    size: {
      sm: { fontSize: '$4' },
      md: { fontSize: '$5' },
      lg: { fontSize: '$6' },
    },
  } as const,

  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
})

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = Omit<GetProps<typeof ButtonFrame>, 'variant'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  color?: any
  icon?: React.ReactNode
  iconAfter?: React.ReactNode
  children?: React.ReactNode
  htmlType?: 'submit' | 'button' | 'reset'
}

export function Button({
  children,
  icon,
  iconAfter,
  loading = false,
  disabled = false,
  variant = 'solid',
  size = 'md',
  color,
  htmlType,
  accessibilityLabel,
  accessibilityRole,
  role,
  'aria-label': ariaLabel,
  ...rest
}: ButtonProps) {
  const theme = useTheme()
  const spinnerColor =
    variant === 'solid'
      ? (theme.backgroundStrong?.get() ?? '#FFFFFF')
      : (theme.primary?.get() ?? '#EA580C')

  const isDisabled = disabled || loading
  const { rest: buttonRest, accessibilityProps } = splitAccessibilityProps(
    {
      ...rest,
      role,
      accessibilityRole,
      accessibilityLabel,
      'aria-label': ariaLabel,
    },
    { defaultRole: 'button' },
  )

  return (
    <ButtonFrame
      variant={variant}
      size={size}
      disabled={isDisabled}
      loading={loading}
      {...accessibilityProps}
      {...buttonRest}
    >
      {loading ? (
        <Spinner size="small" color={spinnerColor} />
      ) : (
        icon
      )}
      {children != null && (
        <ButtonLabel variant={variant} size={size} color={color}>
          {children}
        </ButtonLabel>
      )}
      {!loading && iconAfter}
    </ButtonFrame>
  )
}
