import React from 'react'
import { styled, GetProps, YStack, XStack } from 'tamagui'

const CardFrame = styled(YStack, {
  backgroundColor: '$card',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  overflow: 'hidden',

  variants: {
    variant: {
      elevated: {
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 0,
      },
      outline: {},
      filled: {
        backgroundColor: '$backgroundStrong',
        borderColor: '$borderColor',
      },
    },
    size: {
      sm: { borderRadius: '$2', padding: '$3' },
      md: { borderRadius: '$4', padding: '$4' },
      lg: { borderRadius: '$5', padding: '$6' },
    },
    pressable: {
      true: {
        cursor: 'pointer',
        pressStyle: { backgroundColor: '$backgroundPress', scale: 0.99 },
        hoverStyle: { backgroundColor: '$backgroundHover' },
      },
    },
  } as const,

  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})

const CardHeaderFrame = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$4',
  paddingTop: '$4',
  paddingBottom: '$2',
})

const CardContentFrame = styled(YStack, {
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  gap: '$2',
})

const CardFooterFrame = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '$2',
  paddingHorizontal: '$4',
  paddingBottom: '$4',
  paddingTop: '$2',
})

export type CardProps = GetProps<typeof CardFrame>

export function Card(props: CardProps) {
  return <CardFrame {...props} />
}

Card.Header = CardHeaderFrame
Card.Content = CardContentFrame
Card.Footer = CardFooterFrame
