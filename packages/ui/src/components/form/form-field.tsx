import React from 'react'
import { Label, Paragraph, YStack } from 'tamagui'

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
      {label && (
        <Label fontSize="$4" fontWeight="600" color="$color">
          {label}
          {required && (
            <Label fontSize="$4" color="$destructive">
              {' '}*
            </Label>
          )}
        </Label>
      )}
      {children}
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
