import React from 'react'
import { Spinner, Text, XStack, isWeb, useTheme } from '../style-system'

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

const SIZE_STYLES = {
  sm: { height: '$3', paddingHorizontal: '$3', fontSize: '$4' },
  md: { height: '$4', paddingHorizontal: '$4', fontSize: '$5' },
  lg: { height: '$5', paddingHorizontal: '$5', fontSize: '$6' },
} as const

const VARIANT_STYLES = {
  solid: {
    backgroundColor: '$primary',
    borderColor: '$primary',
    hoverStyle: { backgroundColor: '$primaryHover', borderColor: '$primaryHover' },
    pressStyle: { backgroundColor: '$primaryPress', borderColor: '$primaryPress' },
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '$borderColor',
    hoverStyle: { backgroundColor: '$backgroundHover', borderColor: '$borderColorHover' },
    pressStyle: { backgroundColor: '$backgroundPress' },
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    hoverStyle: { backgroundColor: '$backgroundHover' },
    pressStyle: { backgroundColor: '$backgroundPress' },
  },
  link: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    hoverStyle: { opacity: 0.85 },
    pressStyle: { opacity: 0.7 },
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
      borderRadius="$3"
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      opacity={isDisabled ? 0.5 : 1}
      disabled={isDisabled}
      pointerEvents={isDisabled ? 'none' : undefined}
      height={variant === 'link' ? undefined : SIZE_STYLES[size].height}
      paddingHorizontal={variant === 'link' ? 0 : SIZE_STYLES[size].paddingHorizontal}
      paddingVertical={variant === 'link' ? 0 : '$1.5'}
      {...VARIANT_STYLES[variant]}
      {...rest}
    >
      {loading ? <Spinner size="small" color={spinnerColor} /> : icon}
      {children != null ? (
        <Text
          variant="label"
          fontSize={SIZE_STYLES[size].fontSize}
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
