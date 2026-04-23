import React from 'react'
import { XStack, YStack } from '../style-system'
import { Input, type InputProps } from './input'

type SearchInputSize = 'sm' | 'md' | 'lg'

const HEIGHTS = {
  sm: '$3',
  md: '$4',
  lg: '$5',
} as const

export type SearchInputProps = Omit<InputProps, 'size'> & {
  size?: SearchInputSize
  icon?: React.ReactNode
  iconAfter?: React.ReactNode
}

function DefaultSearchIcon() {
  return (
    <XStack width={18} height={18} alignItems="center" justifyContent="center">
      <YStack
        width={12}
        height={12}
        borderRadius="$full"
        borderWidth={2}
        borderColor="$mutedForeground"
      />
      <YStack
        position="absolute"
        bottom={0}
        right={0}
        width={6}
        height={2}
        backgroundColor="$mutedForeground"
        borderRadius={1}
        transform={[{ rotate: '45deg' }]}
      />
    </XStack>
  )
}

export function SearchInput({ size = 'md', icon, iconAfter, ...props }: SearchInputProps) {
  return (
    <XStack
      alignItems="center"
      borderRadius="$full"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$backgroundStrong"
      paddingHorizontal="$3"
      gap="$2"
      height={HEIGHTS[size]}
      focusWithinStyle={{ borderColor: '$primary' }}
    >
      {icon ?? <DefaultSearchIcon />}
      <Input
        flex={1}
        size={size}
        variant="outline"
        borderWidth={0}
        backgroundColor="transparent"
        paddingHorizontal={0}
        {...props}
      />
      {iconAfter}
    </XStack>
  )
}
