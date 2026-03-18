import React from 'react'
import { styled, GetProps, XStack, YStack, Input as TamaguiInput } from 'tamagui'

const SearchFrame = styled(XStack, {
  alignItems: 'center',
  borderRadius: '$full',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$backgroundStrong',
  paddingHorizontal: '$3',
  gap: '$2',

  focusWithinStyle: {
    borderColor: '$primary',
  },

  variants: {
    size: {
      sm: { height: '$3' },
      md: { height: '$4' },
      lg: { height: '$5' },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
})

const SearchInputField = styled(TamaguiInput, {
  flex: 1,
  fontFamily: '$body',
  fontSize: '$4',
  backgroundColor: 'transparent',
  borderWidth: 0,
  color: '$color',
  placeholderTextColor: '$placeholderColor',
  outlineWidth: 0,
  focusStyle: { outlineWidth: 0 },
})

type SearchInputSize = 'sm' | 'md' | 'lg'

export type SearchInputProps = Omit<GetProps<typeof SearchInputField>, 'size'> & {
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

export function SearchInput({ size = 'md', icon, iconAfter, ...rest }: SearchInputProps) {
  return (
    <SearchFrame size={size}>
      {icon ?? <DefaultSearchIcon />}
      <SearchInputField {...rest} />
      {iconAfter}
    </SearchFrame>
  )
}
