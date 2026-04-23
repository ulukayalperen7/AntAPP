import React from 'react'
import { Image, Text, XStack } from '../style-system'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_STYLES = {
  sm: { width: 32, height: 32, fontSize: '$2' },
  md: { width: 40, height: 40, fontSize: '$3' },
  lg: { width: 56, height: 56, fontSize: '$5' },
  xl: { width: 80, height: 80, fontSize: '$7' },
} as const

export type AvatarProps = React.ComponentProps<typeof XStack> & {
  size?: AvatarSize
  initials?: string
  src?: string
}

export function Avatar({ size = 'md', initials, src, ...props }: AvatarProps) {
  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      borderRadius="$full"
      backgroundColor="$muted"
      overflow="hidden"
      {...SIZE_STYLES[size]}
      {...props}
    >
      {src ? (
        <Image src={src} width="100%" height="100%" objectFit="cover" alt={initials ? `${initials} avatar` : 'avatar'} />
      ) : initials ? (
        <Text fontSize={SIZE_STYLES[size].fontSize} weight="semibold" color="$mutedForeground">
          {initials}
        </Text>
      ) : null}
    </XStack>
  )
}
