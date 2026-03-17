import React from 'react'
import { GetProps, XStack, Text as TamaguiText } from 'tamagui'

export type RatingDisplayProps = GetProps<typeof XStack> & {
  value: number
  maxStars?: number
  showValue?: boolean
}

export function RatingDisplay({ value, maxStars = 5, showValue = true, ...rest }: RatingDisplayProps) {
  const stars = Array.from({ length: maxStars }, (_, i) => {
    if (i < Math.floor(value)) return '\u2605'
    if (i < value) return '\u2605'
    return '\u2606'
  })

  return (
    <XStack alignItems="center" gap="$1" {...rest}>
      <TamaguiText fontSize="$3" color="$ant500">
        {stars.join('')}
      </TamaguiText>
      {showValue && (
        <TamaguiText fontSize="$4" fontWeight="600" color="$color">
          {value.toFixed(1)}
        </TamaguiText>
      )}
    </XStack>
  )
}
