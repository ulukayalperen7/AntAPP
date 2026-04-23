import React from 'react'
import { HStack as BaseHStack, VStack as BaseVStack, YStack } from '../style-system'

export const VStack = BaseVStack
export type VStackProps = React.ComponentProps<typeof VStack>

export const HStack = BaseHStack
export type HStackProps = React.ComponentProps<typeof HStack>

export function Center(props: React.ComponentProps<typeof YStack>) {
  return <YStack flex={1} alignItems="center" justifyContent="center" {...props} />
}

export type CenterProps = React.ComponentProps<typeof Center>

export function Container(props: React.ComponentProps<typeof YStack>) {
  return (
    <YStack
      width="100%"
      maxWidth={1120}
      marginHorizontal="auto"
      paddingHorizontal="$4"
      alignSelf="center"
      {...props}
    />
  )
}

export type ContainerProps = React.ComponentProps<typeof Container>

export function Divider({
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof YStack> & {
  orientation?: 'horizontal' | 'vertical'
}) {
  return (
    <YStack
      backgroundColor="$borderColor"
      width={orientation === 'horizontal' ? '100%' : 1}
      height={orientation === 'horizontal' ? 1 : '100%'}
      {...props}
    />
  )
}

export type DividerProps = React.ComponentProps<typeof Divider>
