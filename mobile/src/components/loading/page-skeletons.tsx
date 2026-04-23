import React from 'react'
import {
  ScrollView,
  YStack,
  XStack,
  Skeleton,
  SkeletonText,
  RouteCardSkeleton,
  StatBoxSkeleton,
} from '@antapp/ui'

type InsetProps = {
  topInset?: number
}

function ChipRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <XStack gap="$2" flexWrap="wrap">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} width={index % 2 === 0 ? 72 : 94} height={32} borderRadius="$full" />
      ))}
    </XStack>
  )
}

function SpotCardSkeleton() {
  return (
    <XStack
      backgroundColor="$backgroundStrong"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      padding="$4"
      gap="$3"
    >
      <Skeleton width={52} height={52} borderRadius="$3" />
      <YStack flex={1} gap="$2">
        <Skeleton width="52%" height={18} />
        <SkeletonText lines={2} widths={['92%', '62%']} lineHeight={12} />
        <XStack gap="$2" flexWrap="wrap">
          <Skeleton width={64} height={22} borderRadius="$full" />
          <Skeleton width={64} height={22} borderRadius="$full" />
          <Skeleton width={44} height={22} borderRadius="$full" />
        </XStack>
      </YStack>
      <Skeleton width={24} height={24} circular />
    </XStack>
  )
}

function StopRowSkeleton() {
  return (
    <XStack gap="$3" alignItems="flex-start">
      <YStack alignItems="center" gap="$1">
        <Skeleton width={32} height={32} circular />
        <Skeleton width={2} height={32} borderRadius="$full" />
      </YStack>
      <YStack
        flex={1}
        backgroundColor="$backgroundStrong"
        borderRadius="$4"
        borderWidth={1}
        borderColor="$borderColor"
        padding="$3"
        gap="$2"
      >
        <Skeleton width="44%" height={18} />
        <SkeletonText lines={2} widths={['84%', '58%']} lineHeight={12} />
      </YStack>
    </XStack>
  )
}

export function AppBootstrapSkeleton() {
  return (
    <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" gap="$4" padding="$6">
      <Skeleton width={72} height={72} circular backgroundColor="$primary" opacity={0.18} />
      <Skeleton width={136} height={24} />
      <SkeletonText alignItems="center" lines={2} widths={['52%', '40%']} lineHeight={12} />
    </YStack>
  )
}

export function HomeScreenSkeleton({ topInset = 0 }: InsetProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={topInset + 12} paddingBottom={100} gap="$5">
          <XStack justifyContent="space-between" alignItems="center">
            <YStack gap="$1">
              <Skeleton width={176} height={28} />
              <Skeleton width={132} height={12} />
            </YStack>
            <Skeleton width={36} height={36} circular />
          </XStack>

          <YStack backgroundColor="$ant900" borderRadius="$4" padding="$5" gap="$3">
            <Skeleton width={84} height={22} borderRadius="$2" backgroundColor="$ant700" />
            <Skeleton width="64%" height={28} backgroundColor="$ant700" />
            <SkeletonText widths={['88%', '74%']} lineHeight={12} />
          </YStack>

          <Skeleton height={40} borderRadius="$full" />
          <ChipRowSkeleton count={6} />

          <YStack gap="$2">
            <Skeleton width={220} height={24} />
            <Skeleton height={220} borderRadius="$4" />
          </YStack>

          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Skeleton width={132} height={24} />
              <Skeleton width={56} height={14} />
            </XStack>
            <YStack gap="$4">
              {Array.from({ length: 3 }).map((_, index) => (
                <RouteCardSkeleton key={index} />
              ))}
            </YStack>
          </YStack>

          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Skeleton width={152} height={24} />
              <Skeleton width={56} height={14} />
            </XStack>
            <YStack gap="$4">
              {Array.from({ length: 3 }).map((_, index) => (
                <RouteCardSkeleton key={index} />
              ))}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

export function ExploreScreenSkeleton({ topInset = 0 }: InsetProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={topInset + 12} paddingBottom={100} gap="$4">
          <YStack gap="$3">
            <Skeleton width={168} height={32} />
            <Skeleton height={40} borderRadius="$full" />
          </YStack>

          <ChipRowSkeleton count={3} />
          <ChipRowSkeleton count={6} />

          <XStack justifyContent="space-between" alignItems="center">
            <Skeleton width={72} height={22} />
            <Skeleton width={116} height={14} />
          </XStack>

          <YStack gap="$4">
            {Array.from({ length: 4 }).map((_, index) => (
              <RouteCardSkeleton key={index} />
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

export function ProfileScreenSkeleton({ topInset = 0 }: InsetProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={topInset + 12} paddingBottom={100} gap="$5">
          <XStack justifyContent="flex-end" gap="$2">
            <Skeleton width={36} height={36} circular />
            <Skeleton width={112} height={32} borderRadius="$4" />
          </XStack>

          <YStack alignItems="center" gap="$3">
            <Skeleton width={88} height={88} circular />
            <YStack alignItems="center" gap="$2">
              <Skeleton width={172} height={28} />
              <Skeleton width={216} height={14} />
            </YStack>
            <XStack gap="$2" flexWrap="wrap" justifyContent="center">
              <Skeleton width={120} height={26} borderRadius="$full" />
              <Skeleton width={84} height={26} borderRadius="$full" />
            </XStack>
          </YStack>

          <XStack gap="$2" flexWrap="wrap">
            {Array.from({ length: 3 }).map((_, index) => (
              <StatBoxSkeleton key={index} minWidth={100} />
            ))}
          </XStack>

          <YStack gap="$3">
            <Skeleton width={124} height={24} />
            <YStack gap="$4">
              {Array.from({ length: 3 }).map((_, index) => (
                <RouteCardSkeleton key={index} />
              ))}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

export function SpotsScreenSkeleton({ topInset = 0 }: InsetProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={topInset + 12} paddingBottom={100} gap="$4">
          <YStack
            backgroundColor="$backgroundStrong"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$4"
            gap="$3"
          >
            <Skeleton width={124} height={16} />
            <Skeleton width="68%" height={30} />
            <SkeletonText widths={['92%', '76%']} lineHeight={12} />
            <XStack gap="$2" flexWrap="wrap">
              <Skeleton flex={1} minWidth={180} height={42} borderRadius="$3" />
              <XStack gap="$1">
                <Skeleton width={72} height={34} borderRadius="$3" />
                <Skeleton width={84} height={34} borderRadius="$3" />
              </XStack>
              <Skeleton width={44} height={24} borderRadius="$full" />
            </XStack>
          </YStack>

          <XStack justifyContent="space-between" alignItems="center">
            <Skeleton width={120} height={24} />
            <Skeleton width={82} height={14} />
          </XStack>

          <YStack gap="$3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SpotCardSkeleton key={index} />
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

export function SpotDetailSkeleton({ topInset = 0 }: InsetProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingBottom={100}>
          <YStack backgroundColor="$ant900" paddingHorizontal="$4" paddingTop={topInset + 12} paddingBottom="$5" gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Skeleton width={84} height={16} backgroundColor="$ant700" />
              <Skeleton width={24} height={24} circular backgroundColor="$ant700" />
            </XStack>
            <Skeleton width="58%" height={30} backgroundColor="$ant700" />
            <Skeleton width={136} height={14} backgroundColor="$ant700" />
          </YStack>

          <XStack gap="$2" padding="$4" flexWrap="wrap">
            {Array.from({ length: 3 }).map((_, index) => (
              <StatBoxSkeleton key={index} minWidth={100} />
            ))}
          </XStack>

          <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$2">
            <Skeleton width={132} height={24} />
            <SkeletonText lines={3} widths={['94%', '88%', '62%']} lineHeight={12} />
          </YStack>

          <YStack paddingHorizontal="$4" paddingBottom="$4">
            <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$3" borderWidth={1} borderColor="$borderColor">
              <Skeleton width={104} height={24} />
              <Skeleton height={120} borderRadius="$3" />
            </YStack>
          </YStack>

          <YStack paddingHorizontal="$4" paddingBottom="$4">
            <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$borderColor">
              <Skeleton width={112} height={24} />
              <XStack gap="$2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} width={24} height={24} circular />
                ))}
              </XStack>
            </YStack>
          </YStack>

          <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$3">
            <Skeleton width={212} height={24} />
            <YStack gap="$3">
              {Array.from({ length: 3 }).map((_, index) => (
                <SpotCardSkeleton key={index} />
              ))}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal="$4"
        paddingTop="$3"
        paddingBottom="$4"
        backgroundColor="$backgroundStrong"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <Skeleton height={48} borderRadius="$4" />
      </YStack>
    </YStack>
  )
}

export function RouteDetailSkeleton({ topInset = 0 }: InsetProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingBottom={140}>
          <YStack backgroundColor="$ant900" paddingHorizontal="$4" paddingTop={topInset + 12} paddingBottom="$5" gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Skeleton width={84} height={16} backgroundColor="$ant700" />
              <XStack gap="$2">
                <Skeleton width={24} height={24} circular backgroundColor="$ant700" />
                <Skeleton width={24} height={24} circular backgroundColor="$ant700" />
              </XStack>
            </XStack>
            <Skeleton width="60%" height={30} backgroundColor="$ant700" />
            <XStack gap="$2" flexWrap="wrap">
              <Skeleton width={72} height={24} borderRadius="$full" backgroundColor="$ant700" />
              <Skeleton width={84} height={24} borderRadius="$full" backgroundColor="$ant700" />
            </XStack>
          </YStack>

          <XStack gap="$2" padding="$4" flexWrap="wrap">
            {Array.from({ length: 3 }).map((_, index) => (
              <StatBoxSkeleton key={index} minWidth={100} />
            ))}
          </XStack>

          <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$2">
            <Skeleton width={136} height={24} />
            <SkeletonText lines={3} widths={['94%', '88%', '62%']} lineHeight={12} />
          </YStack>

          <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$2">
            <Skeleton width={184} height={24} />
            <Skeleton height={240} borderRadius="$4" />
          </YStack>

          <YStack marginHorizontal="$4" marginBottom="$4" gap="$3">
            <Skeleton width={148} height={24} />
            <YStack gap="$3">
              {Array.from({ length: 4 }).map((_, index) => (
                <StopRowSkeleton key={index} />
              ))}
            </YStack>
          </YStack>

          <YStack paddingHorizontal="$4" gap="$4" marginBottom="$4">
            <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$borderColor">
              <Skeleton width={168} height={24} />
              <XStack gap="$2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} width={24} height={24} circular />
                ))}
              </XStack>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal="$4"
        paddingTop="$3"
        paddingBottom="$4"
        backgroundColor="$backgroundStrong"
        borderTopWidth={1}
        borderTopColor="$borderColor"
        gap="$2"
      >
        <XStack gap="$2">
          <Skeleton flex={1} height={48} borderRadius="$4" />
          <Skeleton flex={1} height={48} borderRadius="$4" />
        </XStack>
      </YStack>
    </YStack>
  )
}

export function FormPageSkeleton({ topInset = 0 }: InsetProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={topInset + 12} paddingBottom={100} gap="$5">
          <XStack alignItems="center" gap="$3">
            <Skeleton width={36} height={36} circular />
            <YStack flex={1} gap="$1">
              <Skeleton width={148} height={28} />
              <Skeleton width={184} height={14} />
            </YStack>
            <Skeleton width={72} height={32} borderRadius="$4" />
          </XStack>

          {Array.from({ length: 3 }).map((_, index) => (
            <YStack
              key={index}
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              padding="$4"
              gap="$4"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Skeleton width={144} height={24} />
              <YStack gap="$3">
                <Skeleton height={44} borderRadius="$4" />
                <Skeleton height={44} borderRadius="$4" />
                <Skeleton height={88} borderRadius="$4" />
              </YStack>
              <XStack gap="$2" flexWrap="wrap">
                <Skeleton width={120} height={36} borderRadius="$4" />
                <Skeleton width={96} height={36} borderRadius="$4" />
              </XStack>
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
