import React from 'react'
import { styled, GetProps, Input as TamaguiInput, Label, Paragraph, YStack } from 'tamagui'

export const Input = styled(TamaguiInput, {
  fontFamily: '$body',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$backgroundStrong',
  color: '$color',
  placeholderTextColor: '$placeholderColor',
  selectionColor: '$primary',
  paddingHorizontal: '$3',

  focusStyle: {
    borderColor: '$primary',
    outlineWidth: 0,
  },
  hoverStyle: {
    borderColor: '$borderColorHover',
  },

  variants: {
    size: {
      sm: { height: '$3', fontSize: '$3' },
      md: { height: '$4', fontSize: '$4' },
      lg: { height: '$5', fontSize: '$5' },
    },
    variant: {
      outline: {},
      filled: {
        backgroundColor: '$muted',
        borderColor: 'transparent',
        focusStyle: {
          borderColor: '$primary',
          backgroundColor: '$backgroundStrong',
        },
      },
      underline: {
        borderRadius: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 1,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
      },
    },
    error: {
      true: {
        borderColor: '$destructive',
        focusStyle: { borderColor: '$destructive' },
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        pointerEvents: 'none',
        cursor: 'not-allowed',
      },
    },
    readOnly: {
      true: {
        backgroundColor: '$muted',
        cursor: 'default',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    variant: 'outline',
  },
})

export type InputProps = GetProps<typeof Input>

export type FieldProps = {
  label?: string
  hint?: string
  error?: string
  children: React.ReactElement
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <YStack gap="$1">
      {label && (
        <Label fontSize="$4" fontWeight="600" color="$color">
          {label}
        </Label>
      )}
      {React.cloneElement(children as React.ReactElement<{ error?: boolean }>, {
        error: !!error,
      })}
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
