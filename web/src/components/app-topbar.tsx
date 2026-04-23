'use client'

import Link from 'next/link'
import { XStack, Text, SearchInput, IconButton, Button } from '@antapp/ui'
import { Bell, Plus, Search } from 'lucide-react'

export function AppTopBar() {
  return (
    <XStack
      height={64}
      paddingHorizontal="$5"
      alignItems="center"
      justifyContent="space-between"
      backgroundColor="$backgroundStrong"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      gap="$4"
    >
      <XStack flex={1} maxWidth={560}>
        <SearchInput
          placeholder="Search routes, cities, or places..."
          size="md"
          flex={1}
          icon={<Search size={18} color="var(--color-mutedForeground)" />}
        />
      </XStack>

      <XStack alignItems="center" gap="$3">
        <IconButton variant="ghost" size="md">
          <Bell size={22} color="currentColor" />
        </IconButton>

        <Link href="/routes/create" style={{ textDecoration: 'none' }}>
          <Button variant="solid" size="sm">
            <XStack alignItems="center" gap="$1.5">
              <Plus size={16} color="#FFFFFF" />
              <Text variant="label" color="#FFFFFF" fontSize="$3">Create Route</Text>
            </XStack>
          </Button>
        </Link>
      </XStack>
    </XStack>
  )
}
