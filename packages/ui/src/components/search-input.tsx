import React from 'react'
import { XStack, YStack } from '../style-system'
import { Input, type InputProps } from './input'

type SearchInputSize = 'sm' | 'md' | 'lg'

const HEIGHTS = {
  sm: 44,
  md: 52,
  lg: 58,
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
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$backgroundStrong"
      paddingHorizontal="$4"
      gap="$2"
      minHeight={HEIGHTS[size]}
      boxShadow="0 2px 6px rgba(15, 23, 42, 0.04)"
      focusWithinStyle={{
        borderColor: '$primary',
        boxShadow: '0 0 0 4px rgba(0, 86, 150, 0.10)',
      }}
    >
      {icon ?? <DefaultSearchIcon />}
      <Input
        flex={1}
        size={size}
        variant="filled"
        borderWidth={0}
        backgroundColor="transparent"
        paddingHorizontal={0}
        minHeight={0}
        {...props}
      />
      {iconAfter}
    </XStack>
  )
}
