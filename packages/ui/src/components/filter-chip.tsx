import React from 'react'
import { styled, GetProps, XStack, Text as TamaguiText } from 'tamagui'
import { splitAccessibilityProps } from './accessibility-props'

const ChipFrame = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$full',
  paddingHorizontal: '$3',
  height: 36,
  cursor: 'pointer',
  gap: '$1.5',

  variants: {
    active: {
      true: {
        backgroundColor: '$primary',
      },
      false: {
        backgroundColor: '$muted',
        hoverStyle: { backgroundColor: '$backgroundHover' },
        pressStyle: { backgroundColor: '$backgroundPress' },
      },
    },
  } as const,

  defaultVariants: {
    active: false,
  },
})

const ChipLabel = styled(TamaguiText, {
  fontFamily: '$body',
  fontSize: '$4',
  fontWeight: '500',

  variants: {
    active: {
      true: { color: '#FFFFFF' },
      false: { color: '$color' },
    },
  } as const,

  defaultVariants: {
    active: false,
  },
})

export type FilterChipProps = Omit<GetProps<typeof ChipFrame>, 'active'> & {
  active?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

export function FilterChip({ active = false, icon, children, ...rest }: FilterChipProps) {
  const { rest: chipRest, accessibilityProps } = splitAccessibilityProps(rest)

  return (
    <ChipFrame active={active} {...accessibilityProps} {...chipRest}>
      {icon}
      <ChipLabel active={active}>{children}</ChipLabel>
    </ChipFrame>
  )
}
