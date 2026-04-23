import React from 'react'
import { Checkbox as TamaguiCheckbox, GetProps, XStack, Label, YStack, useTheme } from 'tamagui'

export type CheckboxProps = Omit<GetProps<typeof TamaguiCheckbox>, 'id'> & {
  id?: string
  label?: string
  hint?: string
  error?: string
}

export function Checkbox({ id, label, hint, error, ...rest }: CheckboxProps) {
  const checkboxId = id ?? `checkbox-${Math.random().toString(36).slice(2)}`

  return (
    <YStack gap="$1">
      <XStack alignItems="center" gap="$2">
        <TamaguiCheckbox
          id={checkboxId}
          size="$4"
          borderColor="$borderColor"
          backgroundColor="$backgroundStrong"
          borderRadius="$2"
          {...rest}
        >
          <TamaguiCheckbox.Indicator>
            <YStack
              width={10}
              height={10}
              backgroundColor="$primary"
              borderRadius="$1"
            />
          </TamaguiCheckbox.Indicator>
        </TamaguiCheckbox>
        {label && (
          <Label htmlFor={checkboxId} fontSize="$4" color="$color" cursor="pointer">
            {label}
          </Label>
        )}
      </XStack>
      {hint && !error && (
        <Label fontSize="$3" color="$mutedForeground" paddingLeft="$6">
          {hint}
        </Label>
      )}
      {error && (
        <Label fontSize="$3" color="$destructive" paddingLeft="$6">
          {error}
        </Label>
      )}
    </YStack>
  )
}
