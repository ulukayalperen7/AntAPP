import React, { useState } from 'react'
import { YStack, XStack, Text, Input, Field, Button, Badge, ScrollView } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

const TAGS = ['Nature', 'History', 'Food', 'Entertainment']
const DIFFICULTIES = ['Easy', 'Moderate', 'Hard']

export default function CreateScreen() {
  const [routeName, setRouteName] = useState('')
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState('Nature')
  const [difficulty, setDifficulty] = useState('Easy')
  const insets = useSafeAreaInsets()

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$5">
          <YStack gap="$1">
            <Text variant="heading2">Create Route</Text>
            <Text variant="body" muted>Share your adventure with the community</Text>
          </YStack>

          <YStack gap="$4">
            <Field label="Route Name">
              <Input
                value={routeName}
                onChangeText={setRouteName}
                placeholder="e.g. Historic Downtown Walk"
                variant="outline"
              />
            </Field>

            <Field label="Description">
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder="Tell the story of this route..."
                variant="outline"
                multiline
                numberOfLines={4}
                height={100}
                textAlignVertical="top"
              />
            </Field>

            <YStack gap="$2">
              <Text variant="label">Tag</Text>
              <XStack flexWrap="wrap" gap="$2">
                {TAGS.map((t) => (
                  <XStack
                    key={t}
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$3"
                    backgroundColor={tag === t ? '$primary' : '$muted'}
                    onPress={() => setTag(t)}
                    cursor="pointer"
                  >
                    <Text
                      variant="label"
                      fontSize="$3"
                      color={tag === t ? '#FFFFFF' : '$color'}
                    >
                      {t}
                    </Text>
                  </XStack>
                ))}
              </XStack>
            </YStack>

            <YStack gap="$2">
              <Text variant="label">Difficulty</Text>
              <XStack gap="$2">
                {DIFFICULTIES.map((d) => (
                  <XStack
                    key={d}
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$3"
                    backgroundColor={difficulty === d ? '$primary' : '$muted'}
                    onPress={() => setDifficulty(d)}
                    cursor="pointer"
                  >
                    <Text
                      variant="label"
                      fontSize="$3"
                      color={difficulty === d ? '#FFFFFF' : '$color'}
                    >
                      {d}
                    </Text>
                  </XStack>
                ))}
              </XStack>
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Text variant="heading4">Add Stops</Text>
            <YStack
              height={250}
              backgroundColor="$muted"
              borderRadius="$4"
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderStyle="dashed"
              borderColor="$borderColor"
              gap="$2"
            >
              <Feather name="map-pin" size={40} color="var(--color-mutedForeground, #999)" />
              <Text variant="body" muted>Tap on the map to add stops</Text>
              <Text variant="caption" muted>Map — Coming Soon</Text>
            </YStack>
          </YStack>

          <Button variant="solid" size="lg">
            Save Draft
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
