import { styled, GetProps, Text as TamaguiText } from 'tamagui'

export const Text = styled(TamaguiText, {
  color: '$color',
  fontFamily: '$body',

  variants: {
    variant: {
      heading1: {
        fontFamily: '$heading',
        fontSize: '$11',
        lineHeight: '$11',
        fontWeight: '700',
        letterSpacing: -0.5,
      },
      heading2: {
        fontFamily: '$heading',
        fontSize: '$9',
        lineHeight: '$9',
        fontWeight: '700',
        letterSpacing: -0.4,
      },
      heading3: {
        fontFamily: '$heading',
        fontSize: '$8',
        lineHeight: '$8',
        fontWeight: '600',
        letterSpacing: -0.3,
      },
      heading4: {
        fontFamily: '$heading',
        fontSize: '$7',
        lineHeight: '$7',
        fontWeight: '600',
        letterSpacing: -0.2,
      },
      body: {
        fontSize: '$5',
        lineHeight: '$5',
        fontWeight: '400',
      },
      bodyLarge: {
        fontSize: '$6',
        lineHeight: '$6',
        fontWeight: '400',
      },
      caption: {
        fontSize: '$3',
        lineHeight: '$3',
        fontWeight: '400',
      },
      label: {
        fontSize: '$4',
        lineHeight: '$4',
        fontWeight: '600',
      },
      code: {
        fontFamily: '$mono',
        fontSize: '$4',
        lineHeight: '$4',
        fontWeight: '400',
      },
    },
    weight: {
      regular: { fontWeight: '400' },
      medium: { fontWeight: '500' },
      semibold: { fontWeight: '600' },
      bold: { fontWeight: '700' },
    },
    align: {
      left: { textAlign: 'left' },
      center: { textAlign: 'center' },
      right: { textAlign: 'right' },
    },
    truncate: {
      true: {
        numberOfLines: 1,
        overflow: 'hidden',
      },
    },
    muted: {
      true: { color: '$mutedForeground' },
    },
  } as const,

  defaultVariants: {
    variant: 'body',
    weight: 'regular',
    align: 'left',
  },
})

export type TextProps = GetProps<typeof Text>
