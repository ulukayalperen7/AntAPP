import React from 'react'
import { styled, GetProps, YStack, XStack, Text as TamaguiText, Image } from 'tamagui'

const RouteCardFrame = styled(YStack, {
  backgroundColor: '$card',
  borderRadius: '$4',
  overflow: 'hidden',
  cursor: 'pointer',
  pressStyle: { scale: 0.98, opacity: 0.95 },
  hoverStyle: { opacity: 0.95 },

  variants: {
    orientation: {
      vertical: {},
      horizontal: { flexDirection: 'row' },
    },
  } as const,

  defaultVariants: {
    orientation: 'vertical',
  },
})

const CardImage = styled(YStack, {
  backgroundColor: '$muted',
  overflow: 'hidden',
  position: 'relative',

  variants: {
    orientation: {
      vertical: { width: '100%', height: 180 },
      horizontal: { width: 120, height: '100%' },
    },
  } as const,

  defaultVariants: {
    orientation: 'vertical',
  },
})

const DifficultyBadge = styled(XStack, {
  position: 'absolute',
  top: 10,
  left: 10,
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$2',

  variants: {
    difficulty: {
      easy: { backgroundColor: '#16A34A' },
      moderate: { backgroundColor: '$ant500' },
      hard: { backgroundColor: '#DC2626' },
    },
  } as const,
})

const FavoriteButton = styled(XStack, {
  position: 'absolute',
  top: 10,
  right: 10,
  width: 32,
  height: 32,
  borderRadius: '$full',
  backgroundColor: 'rgba(255,255,255,0.9)',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
})

export type RouteCardData = {
  id: string
  title: string
  location?: string
  image?: string
  rating?: number
  distance?: string
  duration?: string
  difficulty?: 'easy' | 'moderate' | 'hard'
  category?: string
  description?: string
  stopsCount?: number
  isFavorited?: boolean
  isOfficial?: boolean
}

export type RouteCardProps = Omit<GetProps<typeof RouteCardFrame>, 'orientation'> & {
  data: RouteCardData
  orientation?: 'vertical' | 'horizontal'
  onFavoritePress?: () => void
}

export function RouteCard({ data, orientation = 'vertical', onFavoritePress, ...rest }: RouteCardProps) {
  return (
    <RouteCardFrame orientation={orientation} {...rest}>
      <CardImage orientation={orientation}>
        {data.image && (
          <Image source={{ uri: data.image }} width="100%" height="100%" resizeMode="cover" />
        )}
        {data.difficulty && (
          <DifficultyBadge difficulty={data.difficulty}>
            <TamaguiText fontSize="$2" fontWeight="700" color="#FFFFFF" textTransform="uppercase">
              {data.difficulty}
            </TamaguiText>
          </DifficultyBadge>
        )}
        {data.isOfficial && (
          <XStack
            position="absolute"
            top={10}
            left={10}
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$2"
            backgroundColor="$primary"
          >
            <TamaguiText fontSize="$2" fontWeight="700" color="#FFFFFF">
              OFFICIAL
            </TamaguiText>
          </XStack>
        )}
        <FavoriteButton onPress={onFavoritePress}>
          <TamaguiText fontSize="$5" color={data.isFavorited ? '$primary' : '$mutedForeground'}>
            {data.isFavorited ? '\u2665' : '\u2661'}
          </TamaguiText>
        </FavoriteButton>
        {data.rating != null && (
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
            <TamaguiText fontSize="$2" color="$ant500">{'\u2605'}</TamaguiText>
            <TamaguiText fontSize="$3" fontWeight="600" color="$color">{data.rating.toFixed(1)}</TamaguiText>
          </XStack>
        )}
      </CardImage>

      <YStack padding="$3" gap="$1.5" flex={1}>
        {data.category && (
          <TamaguiText fontSize="$2" fontWeight="600" color="$primary" textTransform="uppercase">
            {data.category}
          </TamaguiText>
        )}
        <TamaguiText fontFamily="$heading" fontSize="$5" fontWeight="600" color="$color" numberOfLines={2}>
          {data.title}
        </TamaguiText>
        {data.description && (
          <TamaguiText fontSize="$3" color="$mutedForeground" numberOfLines={2}>
            {data.description}
          </TamaguiText>
        )}
        {data.location && (
          <XStack alignItems="center" gap="$1">
            <TamaguiText fontSize="$3" color="$mutedForeground">{'\u{1F4CD}'}</TamaguiText>
            <TamaguiText fontSize="$3" color="$mutedForeground">{data.location}</TamaguiText>
          </XStack>
        )}
        <XStack alignItems="center" gap="$3" marginTop="$1">
          {data.distance && (
            <XStack alignItems="center" gap="$1">
              <TamaguiText fontSize="$3" color="$mutedForeground">{'\u{1F6B6}'}</TamaguiText>
              <TamaguiText fontSize="$3" color="$mutedForeground">{data.distance}</TamaguiText>
            </XStack>
          )}
          {data.duration && (
            <XStack alignItems="center" gap="$1">
              <TamaguiText fontSize="$3" color="$mutedForeground">{'\u{1F552}'}</TamaguiText>
              <TamaguiText fontSize="$3" color="$mutedForeground">{data.duration}</TamaguiText>
            </XStack>
          )}
          {data.stopsCount != null && (
            <TamaguiText fontSize="$3" color="$mutedForeground">
              {data.stopsCount} Stops
            </TamaguiText>
          )}
        </XStack>
      </YStack>
    </RouteCardFrame>
  )
}
