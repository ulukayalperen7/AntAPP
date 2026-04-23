import React from 'react'
import { Text, XStack, YStack } from '../style-system'

export type RatingDisplayProps = React.ComponentProps<typeof XStack> & {
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

export function RatingDisplay({
  value,
  maxStars = 5,
  showValue = true,
  starSize = 10,
  ...props
}: RatingDisplayProps) {
  return (
    <XStack alignItems="center" gap="$1.5" {...props}>
      <XStack gap="$1" alignItems="center">
        {Array.from({ length: maxStars }, (_, index) => (
          <StarShape key={index} filled={index < Math.round(value)} size={starSize} />
        ))}
      </XStack>
      {showValue ? <Text variant="body" weight="semibold">{value.toFixed(1)}</Text> : null}
    </XStack>
  )
}
