'use client'

import {
  Theme,
  YStack,
  XStack,
  Card,
  Skeleton,
  SkeletonText,
  RouteCardSkeleton,
  StatBoxSkeleton,
} from '@antapp/ui'

export function AuthScreenSkeleton() {
  return (
    <Theme name="user">
      <YStack flex={1} minHeight="100vh" backgroundColor="$background" justifyContent="center" padding="$6">
        <YStack width="100%" maxWidth={560} alignSelf="center" gap="$5">
          <YStack alignItems="center" gap="$2">
            <Skeleton width={112} height={28} />
            <Skeleton width="56%" height={34} />
            <SkeletonText alignItems="center" lines={2} widths={['72%', '52%']} lineHeight={14} />
          </YStack>

          <YStack position="relative" width="100%">
            <Skeleton
              position="absolute"
              top={-52}
              left={28}
              width={104}
              height={104}
              circular
              backgroundColor="$primary"
              opacity={0.18}
            />
            <Card variant="elevated" size="md" width="100%" borderRadius="$5" paddingTop="$10">
              <YStack gap="$4">
                <Skeleton height={52} borderRadius="$4" />
                <Skeleton height={52} borderRadius="$4" />
                <Skeleton width="34%" height={12} alignSelf="flex-end" />
                <Skeleton height={48} borderRadius="$4" backgroundColor="$primary" opacity={0.2} />
              </YStack>
            </Card>
          </YStack>

          <XStack justifyContent="center" gap="$2">
            <Skeleton width={128} height={12} />
            <Skeleton width={84} height={12} />
          </XStack>
        </YStack>
      </YStack>
    </Theme>
  )
}

export function UserDashboardSkeleton() {
  return (
    <YStack gap="$5" flex={1}>
      <YStack backgroundColor="$ant900" borderRadius="$4" padding="$6" minHeight={160} justifyContent="center" gap="$3">
        <Skeleton width={84} height={22} backgroundColor="$ant700" />
        <Skeleton width="52%" height={32} backgroundColor="$ant700" />
        <SkeletonText widths={['76%', '64%']} lineHeight={14} />
      </YStack>

      <XStack gap="$2" flexWrap="wrap">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} width={index % 3 === 0 ? 92 : 72} height={32} borderRadius="$full" />
        ))}
      </XStack>

      <YStack gap="$3">
        <Skeleton width={220} height={24} />
        <Skeleton height={260} borderRadius="$4" />
      </YStack>

      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Skeleton width={160} height={24} />
          <Skeleton width={72} height={14} />
        </XStack>
        <XStack gap="$4" flexWrap="wrap">
          {Array.from({ length: 3 }).map((_, index) => (
            <RouteCardSkeleton key={index} width={300} flex={1} minWidth={260} />
          ))}
        </XStack>
      </YStack>

      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Skeleton width={180} height={24} />
          <Skeleton width={72} height={14} />
        </XStack>
        <XStack gap="$4" flexWrap="wrap">
          {Array.from({ length: 3 }).map((_, index) => (
            <RouteCardSkeleton key={index} width={300} flex={1} minWidth={260} />
          ))}
        </XStack>
      </YStack>
    </YStack>
  )
}

export function SpotsDirectorySkeleton() {
  return (
    <YStack gap="$5" flex={1}>
      <YStack borderRadius="$4" backgroundColor="$backgroundStrong" borderWidth={1} borderColor="$borderColor" padding="$5" gap="$4">
        <YStack gap="$2" maxWidth={760}>
          <Skeleton width={112} height={16} />
          <Skeleton width="48%" height={30} />
          <SkeletonText widths={['88%', '72%']} lineHeight={14} />
        </YStack>

        <XStack gap="$3" flexWrap="wrap" alignItems="center">
          <Skeleton flex={1} minWidth={280} height={44} borderRadius="$full" />
          <XStack gap="$2">
            <Skeleton width={96} height={36} borderRadius="$4" />
            <Skeleton width={108} height={36} borderRadius="$4" />
          </XStack>
          <Skeleton width={96} height={28} borderRadius="$full" />
        </XStack>
      </YStack>

      <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
        <YStack gap="$1">
          <Skeleton width={120} height={24} />
          <Skeleton width={148} height={14} />
        </YStack>
        <Skeleton width={184} height={14} />
      </XStack>

      <XStack gap="$4" flexWrap="wrap">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card
            key={index}
            backgroundColor="$backgroundStrong"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            overflow="hidden"
            width={320}
            flex={1}
            minWidth={280}
          >
            <Skeleton height={200} borderRadius="$0" />
            <YStack padding="$4" gap="$3">
              <XStack justifyContent="space-between" alignItems="flex-start" gap="$2">
                <YStack gap="$2" flex={1}>
                  <Skeleton width="72%" height={18} />
                  <SkeletonText lines={2} widths={['96%', '68%']} lineHeight={12} />
                </YStack>
                <Skeleton width={44} height={22} borderRadius="$full" />
              </XStack>
              <XStack gap="$2" flexWrap="wrap">
                <Skeleton width={76} height={22} borderRadius="$full" />
                <Skeleton width={76} height={22} borderRadius="$full" />
                <Skeleton width={56} height={22} borderRadius="$full" />
              </XStack>
              <Skeleton height={34} borderRadius="$3" />
            </YStack>
          </Card>
        ))}
      </XStack>
    </YStack>
  )
}

export function DetailPageSkeleton() {
  return (
    <YStack gap="$5" flex={1}>
      <YStack backgroundColor="$ant900" borderRadius="$4" padding="$6" minHeight={180} justifyContent="center" gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Skeleton width={96} height={16} backgroundColor="$ant700" />
          <XStack gap="$2">
            <Skeleton width={28} height={28} circular backgroundColor="$ant700" />
            <Skeleton width={28} height={28} circular backgroundColor="$ant700" />
          </XStack>
        </XStack>
        <Skeleton width="58%" height={34} backgroundColor="$ant700" />
        <XStack gap="$2" flexWrap="wrap">
          <Skeleton width={72} height={24} borderRadius="$full" backgroundColor="$ant700" />
          <Skeleton width={84} height={24} borderRadius="$full" backgroundColor="$ant700" />
        </XStack>
      </YStack>

      <XStack gap="$3" flexWrap="wrap">
        {Array.from({ length: 3 }).map((_, index) => (
          <StatBoxSkeleton key={index} minWidth={140} />
        ))}
      </XStack>

      <YStack gap="$3">
        <Skeleton width={180} height={24} />
        <SkeletonText lines={3} widths={['96%', '88%', '64%']} lineHeight={14} />
      </YStack>

      <YStack gap="$3">
        <Skeleton width={220} height={24} />
        <Skeleton height={260} borderRadius="$4" />
      </YStack>

      <YStack gap="$3">
        <Skeleton width={168} height={24} />
        {Array.from({ length: 4 }).map((_, index) => (
          <XStack key={index} gap="$3" alignItems="flex-start">
            <Skeleton width={32} height={32} circular />
            <YStack flex={1} backgroundColor="$backgroundStrong" borderRadius="$4" borderWidth={1} borderColor="$borderColor" padding="$4" gap="$2">
              <Skeleton width="42%" height={18} />
              <SkeletonText lines={2} widths={['84%', '56%']} lineHeight={12} />
            </YStack>
          </XStack>
        ))}
      </YStack>
    </YStack>
  )
}

export function FeaturedRouteCardsSkeleton() {
  return (
    <XStack gap="$4" flexWrap="wrap" justifyContent="center">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={index}
          flex={1}
          minWidth={280}
          maxWidth={300}
          overflow="hidden"
          borderRadius="$4"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Skeleton height={160} borderRadius="$0" />
          <YStack padding="$4" gap="$3">
            <Skeleton width="82%" height={20} />
            <SkeletonText lines={2} widths={['96%', '66%']} lineHeight={12} />
            <Skeleton width={88} height={14} />
          </YStack>
        </Card>
      ))}
    </XStack>
  )
}
