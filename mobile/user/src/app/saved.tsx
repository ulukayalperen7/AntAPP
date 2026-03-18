import React from 'react'
import { YStack, XStack, Text, RouteCard, ScrollView } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

const SAVED_ROUTES: RouteCardData[] = []

export default function SavedScreen() {
  const insets = useSafeAreaInsets()

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$4">
          <Text variant="heading2">Saved Routes</Text>
          <Text variant="body" muted>{SAVED_ROUTES.length} routes saved</Text>

          {SAVED_ROUTES.length > 0 ? (
            <YStack gap="$4">
              {SAVED_ROUTES.map((route) => (
                <RouteCard key={route.id} data={route} />
              ))}
            </YStack>
          ) : (
            <YStack alignItems="center" justifyContent="center" paddingVertical="$10" gap="$4">
              <XStack
                width={72}
                height={72}
                borderRadius="$full"
                backgroundColor="$ant50"
                alignItems="center"
                justifyContent="center"
              >
                <Feather name="bookmark" size={32} color="var(--color-primary, #005696)" />
              </XStack>
              <Text variant="heading4" muted>No saved routes yet</Text>
              <Text variant="body" muted align="center" maxWidth={280}>
                Save routes you love to find them easily later
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
