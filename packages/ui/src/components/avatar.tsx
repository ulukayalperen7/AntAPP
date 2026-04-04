import React from 'react'
import { styled, GetProps, XStack, Text as TamaguiText, Image } from 'tamagui'
import { splitAccessibilityProps } from './accessibility-props'

const AvatarFrame = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$full',
  backgroundColor: '$muted',
  overflow: 'hidden',

  variants: {
    size: {
      sm: { width: 32, height: 32 },
      md: { width: 40, height: 40 },
      lg: { width: 56, height: 56 },
      xl: { width: 80, height: 80 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
})

const initialsSize = { sm: '$2' as const, md: '$3' as const, lg: '$5' as const, xl: '$7' as const }

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export type AvatarProps = Omit<GetProps<typeof AvatarFrame>, 'size'> & {
  size?: AvatarSize
  initials?: string
  src?: string
}

export function Avatar({ size = 'md', initials, src, ...rest }: AvatarProps) {
  const { rest: avatarRest, accessibilityProps } = splitAccessibilityProps(rest)

  return (
    <AvatarFrame size={size} {...accessibilityProps} {...avatarRest}>
      {src ? (
        <Image source={{ uri: src }} width="100%" height="100%" objectFit="cover" />
      ) : initials ? (
        <TamaguiText fontSize={initialsSize[size]} fontWeight="600" color="$mutedForeground">
          {initials}
        </TamaguiText>
      ) : null}
    </AvatarFrame>
  )
}
