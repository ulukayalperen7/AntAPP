import React from 'react'
import { Image, Text, XStack, YStack, isWeb } from '../style-system'

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <XStack alignItems="center" justifyContent="center">
      <YStack
        width={10}
        height={10}
        borderRadius="$full"
        backgroundColor={filled ? '$primary' : 'transparent'}
        borderWidth={filled ? 0 : 1.5}
        borderColor="$mutedForeground"
      />
      <YStack
        width={10}
        height={10}
        borderRadius="$full"
        backgroundColor={filled ? '$primary' : 'transparent'}
        borderWidth={filled ? 0 : 1.5}
        borderColor="$mutedForeground"
        marginLeft={-4}
      />
      <YStack
        position="absolute"
        bottom={-3}
        width={0}
        height={0}
        borderLeftWidth={8}
        borderRightWidth={8}
        borderTopWidth={8}
        borderLeftColor="transparent"
        borderRightColor="transparent"
        borderTopColor={filled ? '$primary' : 'transparent'}
      />
    </XStack>
  )
}

function SmallDot({ color = '$mutedForeground' }: { color?: string }) {
  return <YStack width={6} height={6} borderRadius="$full" backgroundColor={color} />
}

export type RouteCardData = {
  id: string
  title: string
  location?: string
  image?: string
  rating?: number
  distance?: string
  duration?: string
  difficulty?: 'easy' | 'moderate' | 'hard'
  contentType?: 'Community' | 'Official' | 'Sponsored'
  tag?: string
  description?: string
  stopsCount?: number
  isFavorited?: boolean
  isOfficial?: boolean
}

export type RouteCardProps = React.ComponentProps<typeof YStack> & {
  data: RouteCardData
  orientation?: 'vertical' | 'horizontal'
  onFavoritePress?: () => void
}

export function RouteCard({
  data,
  orientation = 'vertical',
  onFavoritePress,
  ...props
}: RouteCardProps) {
  const handleFavoritePress = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.()
    onFavoritePress?.()
  }

  return (
    <YStack
      as={isWeb ? 'article' : undefined}
      backgroundColor="$card"
      borderRadius="$4"
      overflow="hidden"
      cursor="pointer"
      hoverStyle={{ opacity: 0.95 }}
      pressStyle={{ scale: 0.98, opacity: 0.95 }}
      flexDirection={orientation === 'horizontal' ? 'row' : 'column'}
      {...props}
    >
      <YStack
        backgroundColor="$muted"
        overflow="hidden"
        position="relative"
        width={orientation === 'horizontal' ? 120 : '100%'}
        height={orientation === 'horizontal' ? '100%' : 180}
      >
        {data.image ? <Image src={data.image} width="100%" height="100%" objectFit="cover" alt={data.title} /> : null}
        {(data.contentType === 'Official' || data.isOfficial) ? (
          <XStack position="absolute" top={10} left={10} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2" backgroundColor="$primary">
            <Text variant="caption" fontSize="$2" weight="bold" color="#FFFFFF">OFFICIAL</Text>
          </XStack>
        ) : null}
        {data.contentType === 'Sponsored' ? (
          <XStack position="absolute" top={10} left={10} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2" backgroundColor="$ant500">
            <Text variant="caption" fontSize="$2" weight="bold" color="#FFFFFF">SPONSORED</Text>
          </XStack>
        ) : null}
        <XStack
          as={isWeb ? 'button' : undefined}
          type={isWeb ? 'button' : undefined}
          position="absolute"
          top={10}
          right={10}
          width={32}
          height={32}
          borderRadius="$full"
          backgroundColor="rgba(255,255,255,0.9)"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          accessibilityLabel="Toggle favorite"
          onClick={handleFavoritePress}
          onPress={handleFavoritePress}
        >
          <HeartIcon filled={Boolean(data.isFavorited)} />
        </XStack>
        {data.rating != null ? (
          <XStack
            position="absolute"
            top={10}
            right={50}
            paddingHorizontal="$1.5"
            paddingVertical="$0.5"
            borderRadius="$2"
            backgroundColor="rgba(255,255,255,0.9)"
            alignItems="center"
            gap="$1"
          >
            <YStack width={8} height={8} borderRadius={2} backgroundColor="$ant500" transform={[{ rotate: '45deg' }]} />
            <Text variant="caption" weight="semibold">{data.rating.toFixed(1)}</Text>
          </XStack>
        ) : null}
      </YStack>

      <YStack padding="$3" gap="$1.5" flex={1}>
        {data.tag ? <Text variant="caption" fontSize="$2" weight="semibold" color="$primary" textTransform="uppercase">{data.tag}</Text> : null}
        <Text variant="body" fontFamily="$heading" fontSize="$5" weight="semibold" numberOfLines={2}>
          {data.title}
        </Text>
        {data.description ? <Text variant="caption" muted numberOfLines={2}>{data.description}</Text> : null}
        {data.location ? (
          <XStack alignItems="center" gap="$1.5">
            <SmallDot color="$primary" />
            <Text variant="caption" muted>{data.location}</Text>
          </XStack>
        ) : null}
        <XStack alignItems="center" gap="$3" marginTop="$1">
          {data.distance ? (
            <XStack alignItems="center" gap="$1.5">
              <SmallDot />
              <Text variant="caption" muted>{data.distance}</Text>
            </XStack>
          ) : null}
          {data.duration ? (
            <XStack alignItems="center" gap="$1.5">
              <SmallDot />
              <Text variant="caption" muted>{data.duration}</Text>
            </XStack>
          ) : null}
          {data.stopsCount != null ? <Text variant="caption" muted>{data.stopsCount} Stops</Text> : null}
        </XStack>
      </YStack>
    </YStack>
  )
}
