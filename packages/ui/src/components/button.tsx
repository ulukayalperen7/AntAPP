import React from 'react'
import { Spinner, Text, XStack, isWeb, useTheme } from '../style-system'

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

const SIZE_STYLES = {
  sm: { minHeight: 42, paddingHorizontal: '$3.5', fontSize: '$4', borderRadius: '$3' },
  md: { minHeight: 50, paddingHorizontal: '$4', fontSize: '$5', borderRadius: '$4' },
  lg: { minHeight: 56, paddingHorizontal: '$5', fontSize: '$5', borderRadius: '$4' },
} as const

const VARIANT_STYLES = {
  solid: {
    backgroundColor: '$primary',
    borderColor: '$primary',
    boxShadow: '0 18px 34px -22px rgba(0, 86, 150, 0.72)',
    hoverStyle: {
      backgroundColor: '$primaryHover',
      borderColor: '$primaryHover',
      boxShadow: '0 22px 38px -24px rgba(0, 86, 150, 0.78)',
    },
    pressStyle: {
      backgroundColor: '$primaryPress',
      borderColor: '$primaryPress',
      boxShadow: '0 12px 22px -18px rgba(0, 86, 150, 0.55)',
      scale: 0.992,
    },
  },
  outline: {
    backgroundColor: '$backgroundStrong',
    borderColor: '$borderColor',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
    hoverStyle: {
      backgroundColor: '$primary50',
      borderColor: '$primary200',
    },
    pressStyle: {
      backgroundColor: '$backgroundHover',
      borderColor: '$borderColorHover',
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    hoverStyle: { backgroundColor: '$backgroundHover' },
    pressStyle: { backgroundColor: '$backgroundPress', scale: 0.995 },
  },
  link: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    hoverStyle: { opacity: 0.82 },
    pressStyle: { opacity: 0.68 },
  },
} as const

const LABEL_COLORS = {
  solid: '$backgroundStrong',
  outline: '$primary',
  ghost: '$primary',
  link: '$primary',
} as const

export type ButtonProps = React.ComponentProps<typeof XStack> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  htmlType?: 'button' | 'submit' | 'reset'
  color?: string
  icon?: React.ReactNode
  iconAfter?: React.ReactNode
  children?: React.ReactNode
}

export function Button({
  children,
  icon,
  iconAfter,
  loading = false,
  disabled = false,
  variant = 'solid',
  size = 'md',
  htmlType,
  color,
  ...rest
}: ButtonProps) {
  const theme = useTheme()
  const isDisabled = disabled || loading
  const labelColor = color ?? LABEL_COLORS[variant]
  const spinnerColor = variant === 'solid' ? theme.backgroundStrong : theme.primary

  return (
    <XStack
      as={isWeb ? 'button' : undefined}
      type={isWeb ? (htmlType ?? 'button') : undefined}
      alignItems="center"
      justifyContent="center"
      gap="$2"
      borderWidth={variant === 'link' ? 0 : 1}
      borderRadius={SIZE_STYLES[size].borderRadius}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      opacity={isDisabled ? 0.56 : 1}
      disabled={isDisabled}
      pointerEvents={isDisabled ? 'none' : undefined}
      minHeight={variant === 'link' ? undefined : SIZE_STYLES[size].minHeight}
      paddingHorizontal={variant === 'link' ? 0 : SIZE_STYLES[size].paddingHorizontal}
      paddingVertical={variant === 'link' ? 0 : size === 'lg' ? '$3' : '$2.5'}
      userSelect="none"
      whiteSpace="nowrap"
      {...VARIANT_STYLES[variant]}
      {...rest}
    >
      {loading ? <Spinner size="small" color={spinnerColor} /> : icon}
      {children != null ? (
        <Text
          variant="label"
          fontSize={SIZE_STYLES[size].fontSize}
          weight="semibold"
          color={labelColor}
          userSelect="none"
        >
          {children}
        </Text>
      ) : null}
      {!loading ? iconAfter : null}
    </XStack>
  )
}
