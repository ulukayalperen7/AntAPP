'use client'

import Link from 'next/link'
import { XStack, Text, IconButton, Button, Image } from '@antapp/ui'
import { Bell, Plus } from 'lucide-react'
import { SearchBar } from './search-bar'

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
      <XStack flex={1} alignItems="center" gap="$4">
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <XStack alignItems="center" gap="$2" cursor="pointer" hoverStyle={{ opacity: 0.8 }}>
            <Image src="/ant-logo.png" alt="AntAPP" width={32} height={32} style={{ objectFit: 'contain' }} />
            <Text variant="heading4" color="$color" display="none" $md={{ display: 'flex' }}>AntAPP</Text>
          </XStack>
        </Link>
        <SearchBar />
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
