import React from 'react'
import { styled, GetProps, XStack, Input as TamaguiInput, Text as TamaguiText } from 'tamagui'

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

export function SearchInput({ size = 'md', icon, iconAfter, ...rest }: SearchInputProps) {
  return (
    <SearchFrame size={size}>
      {icon ?? (
        <TamaguiText fontSize="$4" color="$mutedForeground">
          &#x1F50D;
        </TamaguiText>
      )}
      <SearchInputField {...rest} />
      {iconAfter}
    </SearchFrame>
  )
}
