import React from 'react'
import { Switch as TamaguiSwitch, GetProps, XStack, Label, YStack, Paragraph } from 'tamagui'

export type SwitchProps = Omit<GetProps<typeof TamaguiSwitch>, 'id'> & {
  id?: string
  label?: string
  hint?: string
  error?: string
}

export function Switch({ id, label, hint, error, ...rest }: SwitchProps) {
  const switchId = id ?? `switch-${Math.random().toString(36).slice(2)}`

  return (
    <YStack gap="$1">
      <XStack alignItems="center" gap="$3">
        <TamaguiSwitch
          id={switchId}
          size="$3"
          backgroundColor="$muted"
          borderColor="$borderColor"
          {...rest}
        >
          <TamaguiSwitch.Thumb
            backgroundColor="$backgroundStrong"
          />
        </TamaguiSwitch>
        {label && (
          <Label htmlFor={switchId} fontSize="$4" color="$color" cursor="pointer">
            {label}
          </Label>
        )}
      </XStack>
      {hint && !error && (
        <Paragraph size="$3" color="$mutedForeground">
          {hint}
        </Paragraph>
      )}
      {error && (
        <Paragraph size="$3" color="$destructive">
          {error}
        </Paragraph>
      )}
    </YStack>
  )
}
