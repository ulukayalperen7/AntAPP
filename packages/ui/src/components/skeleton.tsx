import React from 'react'
import { styled, GetProps, YStack, XStack } from 'tamagui'

const SkeletonFrame = styled(YStack, {
  backgroundColor: '$muted',
  borderRadius: '$3',
  overflow: 'hidden',
  opacity: 0.85,

  variants: {
    tone: {
      default: {},
      subtle: {
        opacity: 0.6,
      },
      strong: {
        backgroundColor: '$borderColor',
        opacity: 1,
      },
    },
    circular: {
      true: {
        borderRadius: '$full',
      },
    },
  } as const,

  defaultVariants: {
    tone: 'default',
  },
})

export type SkeletonProps = GetProps<typeof SkeletonFrame>

export function Skeleton(props: SkeletonProps) {
  return <SkeletonFrame {...props} />
}

export type SkeletonTextProps = Omit<GetProps<typeof YStack>, 'children'> & {
  lines?: number
  lineHeight?: number
  widths?: Array<number | string>
}

export function SkeletonText({
  lines = 3,
  lineHeight = 12,
  widths,
  gap = '$2',
  ...rest
}: SkeletonTextProps) {
  const resolvedWidths = widths ?? ['100%', '88%', '64%']

  return (
    <YStack gap={gap} {...rest}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={resolvedWidths[index] ?? resolvedWidths[resolvedWidths.length - 1] ?? '100%'}
          height={lineHeight}
        />
      ))}
    </YStack>
  )
}

export type RouteCardSkeletonProps = Omit<GetProps<typeof YStack>, 'orientation'> & {
  orientation?: 'vertical' | 'horizontal'
}

export function RouteCardSkeleton({ orientation = 'vertical', ...rest }: RouteCardSkeletonProps) {
  const isHorizontal = orientation === 'horizontal'

  return (
    <YStack
      backgroundColor="$card"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      overflow="hidden"
      flexDirection={isHorizontal ? 'row' : 'column'}
      {...rest}
    >
      <Skeleton
        width={isHorizontal ? 120 : '100%'}
        height={isHorizontal ? 148 : 180}
        borderRadius="$0"
      />
      <YStack flex={1} padding="$3" gap="$2.5">
        <Skeleton width="30%" height={12} />
        <Skeleton width="86%" height={22} />
        <SkeletonText lines={2} lineHeight={12} widths={['92%', '70%']} />
        <XStack gap="$2">
          <Skeleton width={64} height={12} />
          <Skeleton width={72} height={12} />
          <Skeleton width={52} height={12} />
        </XStack>
      </YStack>
    </YStack>
  )
}

export type StatBoxSkeletonProps = GetProps<typeof YStack>

export function StatBoxSkeleton(props: StatBoxSkeletonProps) {
  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      gap="$2"
      paddingVertical="$3"
      paddingHorizontal="$4"
      backgroundColor="$backgroundStrong"
      borderRadius="$3"
      flex={1}
      {...props}
    >
      <Skeleton width={18} height={18} circular />
      <Skeleton width={44} height={24} />
      <Skeleton width={72} height={10} />
    </YStack>
  )
}
