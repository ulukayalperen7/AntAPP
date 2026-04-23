import React from 'react'
import { GetProps, XStack, YStack, Text as TamaguiText } from 'tamagui'
import { splitAccessibilityProps } from './accessibility-props'

export type RatingDisplayProps = GetProps<typeof XStack> & {
  value: number
  maxStars?: number
  showValue?: boolean
  starSize?: number
}

function StarShape({ filled, size = 10 }: { filled: boolean; size?: number }) {
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={2}
      backgroundColor={filled ? '$ant500' : '$muted'}
      transform={[{ rotate: '45deg' }]}
    />
  )
}

export function RatingDisplay({ value, maxStars = 5, showValue = true, starSize = 10, ...rest }: RatingDisplayProps) {
  const { rest: ratingRest, accessibilityProps } = splitAccessibilityProps(rest)

  return (
    <XStack alignItems="center" gap="$1.5" {...accessibilityProps} {...ratingRest}>
      <XStack gap="$1" alignItems="center">
        {Array.from({ length: maxStars }, (_, i) => (
          <StarShape key={i} filled={i < Math.round(value)} size={starSize} />
        ))}
      </XStack>
      {showValue && (
        <TamaguiText fontSize="$4" fontWeight="600" color="$color">
          {value.toFixed(1)}
        </TamaguiText>
      )}
    </XStack>
  )
}
