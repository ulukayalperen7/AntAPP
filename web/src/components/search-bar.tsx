'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { XStack, YStack, Text } from '@antapp/ui'
import { Search, MapPin, X } from 'lucide-react'

interface SearchBarProps {
  onSearch?: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  const clearSearch = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 520 }}>
      <XStack
        alignItems="center"
        gap="$3"
        paddingHorizontal="$4"
        paddingVertical="$2.5"
        backgroundColor={isFocused ? '$background' : '$backgroundStrong'}
        borderRadius="$full"
        borderWidth={1}
        borderColor={isFocused ? '$primary' : '$borderColor'}
        style={{
          transition: 'all 0.2s ease',
          boxShadow: isFocused ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
        }}
        hoverStyle={{
          borderColor: '$primary',
        }}
      >
        {/* Search Icon */}
        <Search 
          size={20} 
          color={isFocused ? 'var(--color-primary)' : 'var(--color-mutedForeground)'}
          style={{ flexShrink: 0 }}
        />

        {/* Input Container */}
        <YStack flex={1}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search routes, cities..."
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              fontSize: 16,
              fontFamily: 'inherit',
              color: 'var(--color-color)',
              outline: 'none',
              padding: 0,
              margin: 0,
              lineHeight: 1.5,
            }}
          />
        </YStack>

        {/* Location Icon + Clear Button */}
        {query ? (
          <button
            type="button"
            onClick={clearSearch}
            style={{
              background: 'none',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
            }}
          >
            <X size={16} color="var(--color-mutedForeground)" />
          </button>
        ) : (
          <MapPin 
            size={18} 
            color="var(--color-mutedForeground)" 
            style={{ flexShrink: 0 }}
          />
        )}
      </XStack>
    </form>
  )
}
