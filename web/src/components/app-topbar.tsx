'use client'

import Link from 'next/link'
import { XStack, Text, SearchInput, IconButton, Button } from '@antapp/ui'

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
      <XStack flex={1} maxWidth={480}>
        <SearchInput
          placeholder="Search routes, cities, or national parks..."
          size="md"
          flex={1}
        />
      </XStack>

      <XStack alignItems="center" gap="$3">
        <IconButton variant="ghost" size="md">
          <Text fontSize="$6">{'\u{1F514}'}</Text>
        </IconButton>

        <Link href="/create" style={{ textDecoration: 'none' }}>
          <Button variant="solid" size="sm">
            + Create Route
          </Button>
        </Link>
      </XStack>
    </XStack>
  )
}
