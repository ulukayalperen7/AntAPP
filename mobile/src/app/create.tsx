import React, { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import {
  YStack, XStack, Text, Input, Button, ScrollView, Badge,
} from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { createRoute } from '@/features/routes/api'
import { getSpots } from '@/features/spots/api'
import type { SpotListItem } from '@/features/api/types'
import { TextInput, TouchableOpacity, FlatList, View, ActivityIndicator } from 'react-native'

type StopEntry = {
  id: string
  spotId: string
  spotName: string
  customTitle: string
}

function generateTempId() {
  return Math.random().toString(36).slice(2)
}

function emptyStop(): StopEntry {
  return { id: generateTempId(), spotId: '', spotName: '', customTitle: '' }
}

function SpotSearchInput({
  onSelect,
  excludeIds,
}: {
  onSelect: (spot: SpotListItem) => void
  excludeIds: string[]
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await getSpots({ search: query.trim(), pageSize: 5 })
        setResults(res.data.filter((s) => !excludeIds.includes(s.id)))
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query, excludeIds.join(',')])

  const handleSelect = (spot: SpotListItem) => {
    setQuery('')
    setResults([])
    setOpen(false)
    onSelect(spot)
  }

  return (
    <YStack gap="$1">
      <XStack
        backgroundColor="$backgroundStrong"
        borderRadius="$3"
        borderWidth={1}
        borderColor="$borderColor"
        paddingHorizontal="$3"
        alignItems="center"
        gap="$2"
      >
        <Feather name="search" size={16} color="#6B7B8A" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search spots by name..."
          placeholderTextColor="#6B7B8A"
          style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: '#0F1720' }}
        />
        {loading ? <ActivityIndicator size="small" /> : null}
      </XStack>

      {open && results.length > 0 ? (
        <YStack
          backgroundColor="$backgroundStrong"
          borderRadius="$3"
          borderWidth={1}
          borderColor="$borderColor"
          overflow="hidden"
        >
          {results.map((spot, idx) => (
            <XStack
              key={spot.id}
              paddingHorizontal="$3"
              paddingVertical="$3"
              gap="$3"
              alignItems="center"
              cursor="pointer"
              onPress={() => handleSelect(spot)}
              borderTopWidth={idx > 0 ? 1 : 0}
              borderTopColor="$borderColor"
              pressStyle={{ backgroundColor: '$muted' }}
            >
              <Feather name="map-pin" size={16} color="#005696" />
              <YStack flex={1}>
                <Text variant="label">{spot.name}</Text>
                {spot.description ? (
                  <Text variant="caption" muted numberOfLines={1}>{spot.description}</Text>
                ) : null}
              </YStack>
              <Text variant="caption" color="$primary">Add</Text>
            </XStack>
          ))}
        </YStack>
      ) : open && results.length === 0 && !loading ? (
        <YStack
          backgroundColor="$backgroundStrong"
          borderRadius="$3"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$3"
          alignItems="center"
        >
          <Text variant="caption" muted>No spots found</Text>
        </YStack>
      ) : null}
    </YStack>
  )
}

export default function CreateScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stops, setStops] = useState<StopEntry[]>([emptyStop(), emptyStop()])
  const [addingStopIndex, setAddingStopIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const excludeIds = stops.map((s) => s.spotId).filter(Boolean)

  const handleSelectSpot = (index: number, spot: SpotListItem) => {
    setStops((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, spotId: spot.id, spotName: spot.name, customTitle: spot.name }
          : s
      )
    )
    setAddingStopIndex(null)
  }

  const handleClearStop = (index: number) => {
    setStops((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, spotId: '', spotName: '', customTitle: '' } : s
      )
    )
  }

  const handleAddStop = () => {
    setStops((prev) => [...prev, emptyStop()])
  }

  const handleRemoveStop = (id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id))
  }

  const handleSubmit = () => {
    setError(null)

    if (!title.trim()) {
      setError('Route title is required.')
      return
    }

    const validStops = stops.filter((s) => s.spotId.trim())
    if (validStops.length < 2) {
      setError('A route must have at least 2 spots.')
      return
    }

    startTransition(async () => {
      try {
        const routeId = await createRoute({
          title: title.trim(),
          description: description.trim() || undefined,
          spots: validStops.map((s) => ({
            spotId: s.spotId,
            customTitle: s.customTitle.trim() || undefined,
          })),
        })
        router.replace(`/routes/${routeId}`)
      } catch (e) {
        setError((e as Error).message ?? 'Failed to create route.')
      }
    })
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={120} gap="$5">
          <YStack gap="$1">
            <Text variant="heading2">Create Route</Text>
            <Text variant="body" muted>Build your adventure</Text>
          </YStack>

          {/* Route Info */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$borderColor">
            <Text variant="heading4">Route Information</Text>

            <YStack gap="$1.5">
              <Text variant="label" color="$mutedForeground">Title *</Text>
              <Input
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Classic Kaleici History Tour"
                variant="outline"
              />
            </YStack>

            <YStack gap="$1.5">
              <Text variant="label" color="$mutedForeground">Description</Text>
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your route..."
                variant="outline"
                multiline
                numberOfLines={3}
                height={80}
                textAlignVertical="top"
              />
            </YStack>
          </YStack>

          {/* Route Stops */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$4" borderWidth={1} borderColor="$borderColor">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack>
                <Text variant="heading4">Route Stops</Text>
                <Text variant="caption" muted>Search and add at least 2 spots</Text>
              </YStack>
              <Button variant="outline" size="sm" onPress={handleAddStop} icon={<Feather name="plus" size={14} />}>
                Add Stop
              </Button>
            </XStack>

            <YStack gap="$4">
              {stops.map((stop, idx) => (
                <XStack key={stop.id} gap="$3" alignItems="flex-start">
                  {/* Step number */}
                  <YStack alignItems="center" gap="$1" paddingTop="$1">
                    <XStack
                      width={32}
                      height={32}
                      borderRadius="$full"
                      backgroundColor={stop.spotId ? '$primary' : '$muted'}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text variant="label" color={stop.spotId ? '#FFFFFF' : '$mutedForeground'} fontSize="$3">
                        {idx + 1}
                      </Text>
                    </XStack>
                    {idx < stops.length - 1 ? (
                      <YStack width={2} height={20} backgroundColor="$borderColor" />
                    ) : null}
                  </YStack>

                  {/* Stop content */}
                  <YStack flex={1} gap="$2">
                    {stop.spotId ? (
                      <XStack
                        backgroundColor="$primary50"
                        padding="$3"
                        borderRadius="$3"
                        alignItems="center"
                        justifyContent="space-between"
                        borderWidth={1}
                        borderColor="$primary200"
                      >
                        <XStack gap="$2" alignItems="center" flex={1}>
                          <Feather name="map-pin" size={14} color="#005696" />
                          <Text variant="label" weight="semibold" numberOfLines={1} flex={1}>{stop.customTitle || stop.spotName}</Text>
                        </XStack>
                        <Button variant="ghost" size="sm" onPress={() => handleClearStop(idx)}>
                          Change
                        </Button>
                      </XStack>
                    ) : addingStopIndex === idx ? (
                      <SpotSearchInput
                        onSelect={(spot) => handleSelectSpot(idx, spot)}
                        excludeIds={excludeIds}
                      />
                    ) : (
                      <XStack
                        backgroundColor="$muted"
                        padding="$3"
                        borderRadius="$3"
                        borderWidth={1}
                        borderStyle="dashed"
                        borderColor="$borderColor"
                        alignItems="center"
                        gap="$2"
                        cursor="pointer"
                        onPress={() => setAddingStopIndex(idx)}
                      >
                        <Feather name="search" size={14} color="#6B7B8A" />
                        <Text variant="caption" muted>Tap to search for a spot</Text>
                      </XStack>
                    )}
                  </YStack>

                  {stops.length > 2 ? (
                    <XStack paddingTop="$1" cursor="pointer" onPress={() => handleRemoveStop(stop.id)} padding="$2">
                      <Feather name="trash-2" size={16} color="#DC2626" />
                    </XStack>
                  ) : null}
                </XStack>
              ))}
            </YStack>
          </YStack>

          {error ? (
            <YStack backgroundColor="$error50" borderRadius="$3" padding="$3" borderWidth={1} borderColor="$error200">
              <Text variant="caption" color="$error500">{error}</Text>
            </YStack>
          ) : null}
        </YStack>
      </ScrollView>

      {/* Sticky bottom actions */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal="$4"
        paddingTop="$3"
        paddingBottom={insets.bottom + 12}
        backgroundColor="$backgroundStrong"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <Button
          variant="solid"
          size="lg"
          loading={isPending}
          disabled={isPending || !title.trim()}
          onPress={handleSubmit}
        >
          Create Route
        </Button>
      </YStack>
    </YStack>
  )
}
