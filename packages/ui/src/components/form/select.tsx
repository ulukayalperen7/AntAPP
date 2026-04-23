import React from 'react'
import { Input } from '../input'
import { isWeb } from '../../style-system'

export type AntSelectOption = {
  label: string
  value: string
}

export type AntSelectProps = {
  value?: string
  options?: AntSelectOption[]
  placeholder?: string
  disabled?: boolean
  onValueChange?: (value: string) => void
}

export function AntSelect({
  value,
  options = [],
  placeholder,
  disabled = false,
  onValueChange,
}: AntSelectProps) {
  if (isWeb) {
    return (
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => onValueChange?.(event.target.value)}
        style={{
          minHeight: 40,
          borderRadius: 12,
          border: '1px solid #D7DEE7',
          padding: '0 12px',
          backgroundColor: '#FFFFFF',
        }}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  const activeLabel = options.find((option) => option.value === value)?.label ?? placeholder ?? ''
  return <Input value={activeLabel} editable={false} readOnly />
}
