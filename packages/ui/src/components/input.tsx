import React from 'react'
import { TextInput } from 'react-native'
import { Text, YStack, createResolvedStyle, extractStyleProps, isWeb, useTheme } from '../style-system'

type InputSize = 'sm' | 'md' | 'lg'
type InputVariant = 'outline' | 'filled' | 'underline'

const SIZE_STYLES = {
  sm: { height: '$3', fontSize: '$3' },
  md: { height: '$4', fontSize: '$4' },
  lg: { height: '$5', fontSize: '$5' },
} as const

const VARIANT_STYLES = {
  outline: {},
  filled: {
    backgroundColor: '$muted',
    borderColor: 'transparent',
  },
  underline: {
    borderRadius: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
} as const

export type InputProps = React.ComponentProps<typeof TextInput> & {
  [key: string]: any
  size?: InputSize
  variant?: InputVariant
  error?: boolean
  disabled?: boolean
  readOnly?: boolean
  type?: string
  onChangeText?: (value: string) => void
  onSubmitEditing?: () => void
}

export const Input = React.forwardRef<any, InputProps>(function Input(
  {
    size = 'md',
    variant = 'outline',
    error = false,
    disabled = false,
    readOnly = false,
    multiline = false,
    numberOfLines,
    onChangeText,
    onSubmitEditing,
    secureTextEntry,
    keyboardType,
    type,
    selectionColor,
    style,
    ...rawProps
  },
  ref,
) {
  const theme = useTheme()
  const [focused, setFocused] = React.useState(false)
  const resolvedSize = (size ?? 'md') as InputSize
  const resolvedVariant = (variant ?? 'outline') as InputVariant

  const { styleProps, restProps } = extractStyleProps(
    {
      fontFamily: '$body',
      borderRadius: '$3',
      borderWidth: 1,
      borderColor: error ? '$destructive' : '$borderColor',
      backgroundColor: '$backgroundStrong',
      color: '$color',
      paddingHorizontal: '$3',
      paddingVertical: multiline ? '$2' : '$0',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : undefined,
      ...(readOnly ? { backgroundColor: '$muted' } : {}),
      ...SIZE_STYLES[resolvedSize],
      ...VARIANT_STYLES[resolvedVariant],
      style,
    },
  )

  const focusStyle = focused
    ? createResolvedStyle(
        resolvedVariant === 'filled'
          ? {
              borderColor: error ? '$destructive' : '$primary',
              backgroundColor: '$backgroundStrong',
            }
          : {
              borderColor: error ? '$destructive' : '$primary',
            },
        theme,
      )
    : undefined

  const mergedStyle = {
    ...createResolvedStyle(styleProps, theme),
    ...focusStyle,
  }

  if (isWeb) {
    const Element = multiline ? 'textarea' : 'input'
    const inputType =
      type ??
      (secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'email' : 'text')

    const inputMode =
      keyboardType === 'numeric'
        ? 'numeric'
        : keyboardType === 'decimal-pad'
          ? 'decimal'
          : keyboardType === 'phone-pad'
            ? 'tel'
            : keyboardType === 'email-address'
              ? 'email'
              : undefined

    const webProps: Record<string, any> = {
      ...restProps,
      ref,
      style: {
        ...mergedStyle,
        outline: 'none',
        resize: multiline ? 'vertical' : undefined,
        caretColor: selectionColor ?? theme.primary,
      },
      disabled,
      readOnly,
      inputMode,
      autoCorrect: rawProps.autoCorrect ? 'on' : 'off',
      spellCheck: rawProps.spellCheck,
      autoCapitalize: rawProps.autoCapitalize,
      autoComplete: rawProps.autoComplete,
      value: rawProps.value ?? '',
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChangeText?.(event.target.value)
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !multiline) {
          onSubmitEditing?.()
        }
      },
    }

    if (!multiline) {
      webProps.type = inputType
    } else if (numberOfLines) {
      webProps.rows = numberOfLines
    }

    return React.createElement(Element, webProps)
  }

  return (
    <TextInput
      ref={ref}
      {...rawProps}
      style={mergedStyle}
      editable={!disabled && !readOnly}
      multiline={multiline}
      numberOfLines={numberOfLines}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      selectionColor={selectionColor ?? theme.primary}
      placeholderTextColor={theme.placeholderColor}
      onFocus={(event) => {
        setFocused(true)
        rawProps.onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        rawProps.onBlur?.(event)
      }}
    />
  )
})

export type FieldProps = {
  label?: string
  hint?: string
  error?: string
  children: React.ReactElement
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <YStack gap="$1.5">
      {label ? <Text variant="label">{label}</Text> : null}
      {React.cloneElement(children as React.ReactElement<{ error?: boolean }>, {
        error: Boolean(error),
      })}
      {hint && !error ? <Text variant="caption" muted>{hint}</Text> : null}
      {error ? <Text variant="caption" color="$destructive">{error}</Text> : null}
    </YStack>
  )
}
