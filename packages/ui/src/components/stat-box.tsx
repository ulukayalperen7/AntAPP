import React from 'react'
import { GetProps, YStack, Text as TamaguiText } from 'tamagui'

export type StatBoxProps = GetProps<typeof YStack> & {
  value: string | number
  label: string
  icon?: React.ReactNode
}

export function StatBox({ value, label, icon, ...rest }: StatBoxProps) {
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
      {...rest}
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
}
