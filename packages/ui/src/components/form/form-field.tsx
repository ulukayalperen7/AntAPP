import React from 'react'
import { Text, YStack } from '../../style-system'

export type FormFieldProps = {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, hint, error, required = false, children }: FormFieldProps) {
  return (
    <YStack gap="$1.5">
      {label ? (
        <Text variant="label">
          {label}
          {required ? <Text variant="label" color="$destructive"> *</Text> : null}
        </Text>
      ) : null}
      {children}
      {hint && !error ? <Text variant="caption" muted>{hint}</Text> : null}
      {error ? <Text variant="caption" color="$destructive">{error}</Text> : null}
    </YStack>
  )
}
