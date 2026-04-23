import React from 'react'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, isWeb, useAntId, useTheme } from '../../style-system'

export type CheckboxProps = {
  id?: string
  label?: string
  hint?: string
  error?: string
  checked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function Checkbox({
  id,
  label,
  hint,
  error,
  checked = false,
  disabled = false,
  onCheckedChange,
}: CheckboxProps) {
  const checkboxId = id ?? useAntId('checkbox')
  const theme = useTheme()

  if (isWeb) {
    return (
      <YStack gap="$1">
        <label htmlFor={checkboxId} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            style={{ accentColor: theme.primary }}
            onChange={(event) => onCheckedChange?.(event.target.checked)}
          />
          {label ? <Text>{label}</Text> : null}
        </label>
        {hint && !error ? <Text variant="caption" muted>{hint}</Text> : null}
        {error ? <Text variant="caption" color="$destructive">{error}</Text> : null}
      </YStack>
    )
  }

  return (
    <YStack gap="$1">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityState={{ checked, disabled }}
        onPress={() => !disabled && onCheckedChange?.(!checked)}
      >
        <XStack alignItems="center" gap="$2">
          <YStack
            width={20}
            height={20}
            borderRadius="$2"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$backgroundStrong"
            alignItems="center"
            justifyContent="center"
            opacity={disabled ? 0.5 : 1}
          >
            {checked ? <YStack width={10} height={10} borderRadius="$1" backgroundColor="$primary" /> : null}
          </YStack>
          {label ? <Text>{label}</Text> : null}
        </XStack>
      </Pressable>
      {hint && !error ? <Text variant="caption" muted>{hint}</Text> : null}
      {error ? <Text variant="caption" color="$destructive">{error}</Text> : null}
    </YStack>
  )
}
