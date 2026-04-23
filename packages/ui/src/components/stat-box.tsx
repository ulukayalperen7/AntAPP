import React from 'react'
import { GetProps, YStack, Text as TamaguiText } from 'tamagui'
import { splitAccessibilityProps } from './accessibility-props'

export type StatBoxProps = GetProps<typeof YStack> & {
  value: string | number
  label: string
  icon?: React.ReactNode
}

export const StatBox = React.memo(function StatBox({ value, label, icon, ...rest }: StatBoxProps) {
  const { rest: boxRest, accessibilityProps } = splitAccessibilityProps(rest)

  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      gap="$1"
      paddingVertical="$3"
      paddingHorizontal="$4"
      backgroundColor="$backgroundStrong"
      borderRadius="$3"
      flex={1}
      {...accessibilityProps}
      {...boxRest}
    >
      {icon}
      <TamaguiText fontFamily="$heading" fontSize="$7" fontWeight="700" color="$color">
        {value}
      </TamaguiText>
      <TamaguiText fontSize="$2" fontWeight="500" color="$mutedForeground" textTransform="uppercase">
        {label}
      </TamaguiText>
    </YStack>
  )
})
