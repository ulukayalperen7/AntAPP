import React from 'react'
import { styled, GetProps, YStack, XStack, Text as TamaguiText, Image } from 'tamagui'
import { splitAccessibilityProps } from './accessibility-props'

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

const ContentTypeBadge = styled(XStack, {
  position: 'absolute',
  top: 10,
  left: 10,
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$2',

  variants: {
    type: {
      Official: { backgroundColor: '$primary' },
      Sponsored: { backgroundColor: '$ant500' },
      Community: { display: 'none' },
    },
  } as const,

  defaultVariants: {
    type: 'Community',
  },
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
  /** @deprecated - backend has no difficulty field, use contentType */
  difficulty?: 'easy' | 'moderate' | 'hard'
  contentType?: 'Community' | 'Official' | 'Sponsored'
  tag?: string
  description?: string
  stopsCount?: number
  isFavorited?: boolean
  /** @deprecated - use contentType === 'Official' */
  isOfficial?: boolean
}

export type RouteCardProps = Omit<GetProps<typeof RouteCardFrame>, 'orientation'> & {
  data: RouteCardData
  orientation?: 'vertical' | 'horizontal'
  onFavoritePress?: () => void
}

export const RouteCard = React.memo(function RouteCard({ data, orientation = 'vertical', onFavoritePress, ...rest }: RouteCardProps) {
  const { rest: cardRest, accessibilityProps } = splitAccessibilityProps(rest)

  return (
    <RouteCardFrame orientation={orientation} {...accessibilityProps} {...cardRest}>
      <CardImage orientation={orientation}>
        {data.image && (
          <Image
            src={data.image}
            width="100%"
            height="100%"
            objectFit="cover"
          />
        )}
        {/* ContentType badge — Official/Sponsored only */}
        {(data.contentType === 'Official' || data.isOfficial) && (
          <ContentTypeBadge type="Official">
            <TamaguiText fontSize="$2" fontWeight="700" color="#FFFFFF">OFFICIAL</TamaguiText>
          </ContentTypeBadge>
        )}
        {data.contentType === 'Sponsored' && (
          <ContentTypeBadge type="Sponsored">
            <TamaguiText fontSize="$2" fontWeight="700" color="#FFFFFF">SPONSORED</TamaguiText>
          </ContentTypeBadge>
        )}
        <FavoriteButton onPress={onFavoritePress}>
          <HeartIcon filled={!!data.isFavorited} />
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
            <YStack width={8} height={8} borderRadius={2} backgroundColor="$ant500" transform={[{ rotate: '45deg' }]} />
            <TamaguiText fontSize="$3" fontWeight="600" color="$color">{data.rating.toFixed(1)}</TamaguiText>
          </XStack>
        )}
      </CardImage>

      <YStack padding="$3" gap="$1.5" flex={1}>
        {data.tag && (
          <TamaguiText fontSize="$2" fontWeight="600" color="$primary" textTransform="uppercase">
            {data.tag}
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
          <XStack alignItems="center" gap="$1.5">
            <SmallDot color="$primary" />
            <TamaguiText fontSize="$3" color="$mutedForeground">{data.location}</TamaguiText>
          </XStack>
        )}
        <XStack alignItems="center" gap="$3" marginTop="$1">
          {data.distance && (
            <XStack alignItems="center" gap="$1.5">
              <SmallDot />
              <TamaguiText fontSize="$3" color="$mutedForeground">{data.distance}</TamaguiText>
            </XStack>
          )}
          {data.duration && (
            <XStack alignItems="center" gap="$1.5">
              <SmallDot />
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
})
