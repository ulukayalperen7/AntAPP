import React from 'react'
import { styled, GetProps, XStack, YStack } from 'tamagui'

const BarTrack = styled(XStack, {
  width: '100%',
  backgroundColor: '$muted',
  borderRadius: '$full',
  overflow: 'hidden',

  variants: {
    size: {
      sm: { height: 4 },
      md: { height: 8 },
      lg: { height: 12 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
})

const BarFill = styled(YStack, {
  height: '100%',
  backgroundColor: '$primary',
  borderRadius: '$full',
})

type ProgressBarSize = 'sm' | 'md' | 'lg'

export type ProgressBarProps = Omit<GetProps<typeof BarTrack>, 'size'> & {
  value: number
  max?: number
  size?: ProgressBarSize
  color?: string
}

export function ProgressBar({ value, max = 100, size = 'md', color, ...rest }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <BarTrack size={size} {...rest}>
      <BarFill
        width={`${percentage}%`}
        {...(color ? { backgroundColor: color } : {})}
      />
    </BarTrack>
  )
}
