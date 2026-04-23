import React from 'react'
import { XStack, YStack } from '../style-system'

type CardVariant = 'elevated' | 'outline' | 'filled'
type CardSize = 'sm' | 'md' | 'lg'

const SIZE_STYLES = {
  sm: { borderRadius: '$2', padding: '$3' },
  md: { borderRadius: '$4', padding: '$4' },
  lg: { borderRadius: '$5', padding: '$6' },
} as const

const VARIANT_STYLES = {
  elevated: {
    backgroundColor: '$backgroundStrong',
    borderWidth: 0,
    shadowColor: '$shadowColor',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  outline: {
    backgroundColor: '$card',
    borderWidth: 1,
    borderColor: '$borderColor',
  },
  filled: {
    backgroundColor: '$backgroundStrong',
    borderWidth: 1,
    borderColor: '$borderColor',
  },
} as const

export type CardProps = React.ComponentProps<typeof YStack> & {
  variant?: CardVariant
  size?: CardSize
  pressable?: boolean
}

export function Card({
  variant = 'outline',
  size = 'md',
  pressable = false,
  ...props
}: CardProps) {
  return (
    <YStack
      overflow="hidden"
      cursor={pressable ? 'pointer' : undefined}
      hoverStyle={pressable ? { backgroundColor: '$backgroundHover' } : undefined}
      pressStyle={pressable ? { backgroundColor: '$backgroundPress', scale: 0.99 } : undefined}
      {...VARIANT_STYLES[variant]}
      {...SIZE_STYLES[size]}
      {...props}
    />
  )
}

Card.Header = function CardHeader(props: React.ComponentProps<typeof XStack>) {
  return <XStack alignItems="center" justifyContent="space-between" paddingBottom="$2" {...props} />
}

Card.Content = function CardContent(props: React.ComponentProps<typeof YStack>) {
  return <YStack gap="$2" {...props} />
}

Card.Footer = function CardFooter(props: React.ComponentProps<typeof XStack>) {
  return <XStack alignItems="center" justifyContent="flex-end" gap="$2" {...props} />
}
