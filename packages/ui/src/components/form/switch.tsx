import React from 'react'
import { Switch as NativeSwitch } from 'react-native'
import { Text, XStack, YStack, isWeb, useAntId, useTheme } from '../../style-system'

export type SwitchProps = {
  id?: string
  label?: string
  hint?: string
  error?: string
  checked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function Switch({
  id,
  label,
  hint,
  error,
  checked = false,
  disabled = false,
  onCheckedChange,
}: SwitchProps) {
  const switchId = id ?? useAntId('switch')
  const theme = useTheme()

  if (isWeb) {
    return (
      <YStack gap="$1">
        <label htmlFor={switchId} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <input
            id={switchId}
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
      <XStack alignItems="center" gap="$3">
        <NativeSwitch
          value={checked}
          disabled={disabled}
          onValueChange={(nextValue) => onCheckedChange?.(nextValue)}
          trackColor={{ false: theme.borderColor, true: theme.primary }}
          thumbColor={theme.backgroundStrong}
        />
        {label ? <Text>{label}</Text> : null}
      </XStack>
      {hint && !error ? <Text variant="caption" muted>{hint}</Text> : null}
      {error ? <Text variant="caption" color="$destructive">{error}</Text> : null}
    </YStack>
  )
}
