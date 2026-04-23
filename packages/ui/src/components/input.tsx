import React from 'react'
import { TextInput } from 'react-native'
import { Text, YStack, createResolvedStyle, extractStyleProps, isWeb, useTheme } from '../style-system'

type InputSize = 'sm' | 'md' | 'lg'
type InputVariant = 'outline' | 'filled' | 'underline'

const SIZE_STYLES = {
  sm: { minHeight: 44, fontSize: '$4', lineHeight: '$4', paddingHorizontal: '$3', paddingVertical: '$2', borderRadius: '$3' },
  md: { minHeight: 52, fontSize: '$5', lineHeight: '$5', paddingHorizontal: '$4', paddingVertical: '$2.5', borderRadius: '$4' },
  lg: { minHeight: 58, fontSize: '$5', lineHeight: '$5', paddingHorizontal: '$4', paddingVertical: '$3', borderRadius: '$4' },
} as const

const VARIANT_STYLES = {
  outline: {
    backgroundColor: '$backgroundStrong',
    borderColor: '$borderColor',
  },
  filled: {
    backgroundColor: '#F4F7FA',
    borderColor: 'rgba(15, 23, 42, 0.06)',
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
  const sizeStyle = SIZE_STYLES[resolvedSize]
  const baseStyleProps: Record<string, unknown> = {
    ...sizeStyle,
    ...VARIANT_STYLES[resolvedVariant],
    fontFamily: '$body',
    borderWidth: 1,
    borderColor: error ? '$destructive' : '$borderColor',
    backgroundColor: '$backgroundStrong',
    color: '$color',
    width: '100%',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : undefined,
    style,
  }

  baseStyleProps.minHeight =
    multiline ? (resolvedSize === 'lg' ? 156 : resolvedSize === 'md' ? 140 : 124) : sizeStyle.minHeight
  baseStyleProps.paddingHorizontal = sizeStyle.paddingHorizontal
  baseStyleProps.paddingVertical = multiline ? sizeStyle.paddingVertical : '$0'

  if (readOnly) {
    baseStyleProps.backgroundColor = '$muted'
    baseStyleProps.borderColor = 'rgba(15, 23, 42, 0.04)'
  }

  const { styleProps, restProps } = extractStyleProps(
    {
      ...baseStyleProps,
      ...rawProps,
    },
  )

  const focusStyle = focused
      ? createResolvedStyle(
        resolvedVariant === 'filled'
          ? {
              borderColor: error ? '$destructive' : '$primary',
              backgroundColor: '$backgroundStrong',
              boxShadow: error
                ? '0 0 0 4px rgba(220, 38, 38, 0.10)'
                : '0 0 0 4px rgba(0, 86, 150, 0.12)',
            }
          : {
              borderColor: error ? '$destructive' : '$primary',
              boxShadow: error
                ? '0 0 0 4px rgba(220, 38, 38, 0.10)'
                : '0 0 0 4px rgba(0, 86, 150, 0.12)',
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
        display: 'block',
        width: mergedStyle.width ?? '100%',
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
      onFocus: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFocused(true)
        rawProps.onFocus?.(event as any)
      },
      onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFocused(false)
        rawProps.onBlur?.(event as any)
      },
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
    } else {
      webProps.rows = numberOfLines ?? 5
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
    <YStack gap="$2">
      {label ? <Text variant="label" color="$mutedForeground" fontSize="$3">{label}</Text> : null}
      {React.cloneElement(children as React.ReactElement<{ error?: boolean }>, {
        error: Boolean(error),
      })}
      {hint && !error ? <Text variant="caption" muted>{hint}</Text> : null}
      {error ? <Text variant="caption" color="$destructive">{error}</Text> : null}
    </YStack>
  )
}
