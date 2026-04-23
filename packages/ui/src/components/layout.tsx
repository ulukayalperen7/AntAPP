import { styled, GetProps, YStack, XStack } from 'tamagui'

export const VStack = styled(YStack, {
  name: 'VStack',
})

export type VStackProps = GetProps<typeof VStack>

export const HStack = styled(XStack, {
  name: 'HStack',
  alignItems: 'center',
})

export type HStackProps = GetProps<typeof HStack>

export const Center = styled(YStack, {
  name: 'Center',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
})

export type CenterProps = GetProps<typeof Center>

export const Container = styled(YStack, {
  name: 'Container',
  width: '100%',
  maxWidth: 960,
  marginHorizontal: 'auto',
  paddingHorizontal: '$4',
  alignSelf: 'center',
})

export type ContainerProps = GetProps<typeof Container>

export const Divider = styled(YStack, {
  name: 'Divider',
  height: 1,
  width: '100%',
  backgroundColor: '$borderColor',

  variants: {
    orientation: {
      horizontal: {
        height: 1,
        width: '100%',
      },
      vertical: {
        height: '100%',
        width: 1,
      },
    },
  } as const,

  defaultVariants: {
    orientation: 'horizontal',
  },
})

export type DividerProps = GetProps<typeof Divider>
