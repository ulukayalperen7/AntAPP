import React from 'react'
import { YStack } from 'tamagui'
import { Button, Card, Text, VStack, Divider, Badge } from '@antapp/ui'
import { useAuth } from '../features/auth/context'

export default function HomeScreen() {
  const { user, logout } = useAuth()

  return (
    <YStack flex={1} backgroundColor="$background" paddingHorizontal="$4" paddingTop="$8">
      <VStack gap="$4">
        <VStack gap="$1">
          <Text variant="heading2">Hoş geldin 👋</Text>
          <Text variant="body" muted>
            {user?.userName}
          </Text>
        </VStack>

        <Card variant="elevated">
          <Card.Content>
            <VStack gap="$3">
              <VStack gap="$1">
                <Text variant="label" muted>Email</Text>
                <Text variant="body">{user?.email}</Text>
              </VStack>

              <Divider />

              <VStack gap="$1">
                <Text variant="label" muted>Roller</Text>
                <YStack flexDirection="row" flexWrap="wrap" gap="$2">
                  {user?.roles.map((role) => (
                    <Badge key={role} variant="info">{role}</Badge>
                  ))}
                </YStack>
              </VStack>
            </VStack>
          </Card.Content>
        </Card>

        <Button variant="outline" onPress={logout}>
          Çıkış yap
        </Button>
      </VStack>
    </YStack>
  )
}
