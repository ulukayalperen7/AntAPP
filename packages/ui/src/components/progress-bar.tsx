import React from 'react'
import { XStack, YStack } from '../style-system'

type ProgressBarSize = 'sm' | 'md' | 'lg'

const HEIGHTS = {
  sm: 4,
  md: 8,
  lg: 12,
} as const

export type ProgressBarProps = React.ComponentProps<typeof XStack> & {
  value: number
  max?: number
  size?: ProgressBarSize
  color?: string
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <XStack width="100%" backgroundColor="$muted" borderRadius="$full" overflow="hidden" height={HEIGHTS[size]} {...props}>
      <YStack width={`${percentage}%`} height="100%" borderRadius="$full" backgroundColor={color ?? '$primary'} />
    </XStack>
  )
}
