'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Input } from '@antapp/ui'
import { createRoute } from '@/features/routes/actions'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

type StopEntry = {
  id: string
  spotId: string
  customTitle: string
  customDescription: string
}

function generateTempId() {
  return Math.random().toString(36).slice(2)
}

export default function CreateRoutePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stops, setStops] = useState<StopEntry[]>([
    { id: generateTempId(), spotId: '', customTitle: '', customDescription: '' },
    { id: generateTempId(), spotId: '', customTitle: '', customDescription: '' },
  ])
  const [error, setError] = useState<string | null>(null)

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      { id: generateTempId(), spotId: '', customTitle: '', customDescription: '' },
    ])
  }

  const removeStop = (id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id))
  }

  const updateStop = (id: string, field: keyof Omit<StopEntry, 'id'>, value: string) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const handleSubmit = () => {
    setError(null)

    if (!title.trim()) {
      setError('Route title is required.')
      return
    }

    const validStops = stops.filter((s) => s.spotId.trim())
    if (validStops.length < 2) {
      setError('A route must have at least 2 spots with valid Spot IDs.')
      return
    }

    startTransition(async () => {
      try {
        const routeId = await createRoute({
          title: title.trim(),
          description: description.trim() || undefined,
          spots: validStops.map((s) => ({
            spotId: s.spotId.trim(),
            customTitle: s.customTitle.trim() || undefined,
            customDescription: s.customDescription.trim() || undefined,
          })),
        })
        router.push(`/routes/${routeId}`)
      } catch (e) {
        setError((e as Error).message ?? 'Failed to create route.')
      }
    })
  }

  return (
    <YStack gap="$5" flex={1} maxWidth={720}>
      {/* Header */}
      <XStack alignItems="center" gap="$3">
        <XStack
          cursor="pointer"
          onPress={() => router.back()}
          padding="$2"
          borderRadius="$full"
          hoverStyle={{ backgroundColor: '$backgroundHover' }}
        >
          <ArrowLeft size={20} color="currentColor" />
        </XStack>
        <YStack flex={1}>
          <Text variant="heading2">Create Route</Text>
          <Text variant="body" muted>Build your adventure</Text>
        </YStack>
      </XStack>

      {/* Route Info */}
      <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$5" gap="$4" borderWidth={1} borderColor="$borderColor">
        <Text variant="heading4">Route Information</Text>

        <YStack gap="$1.5">
          <Text variant="label" color="$mutedForeground">Title *</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            variant="outline"
            size="md"
            placeholder="e.g. Classic Kaleici History Tour"
          />
        </YStack>

        <YStack gap="$1.5">
          <Text variant="label" color="$mutedForeground">Description</Text>
          <Input
            value={description}
            onChangeText={setDescription}
            variant="outline"
            size="md"
            placeholder="Describe your route..."
            // @ts-ignore — multiline works on web
            multiline
            numberOfLines={3}
          />
        </YStack>
      </YStack>

      {/* Route Stops */}
      <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$5" gap="$4" borderWidth={1} borderColor="$borderColor">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text variant="heading4">Route Stops</Text>
            <Text variant="caption" muted>Add at least 2 stops (enter Spot IDs from the system)</Text>
          </YStack>
          <Button variant="outline" size="sm" icon={<Plus size={14} color="currentColor" />} onPress={addStop}>
            Add Stop
          </Button>
        </XStack>

        <YStack gap="$4">
          {stops.map((stop, idx) => (
            <XStack key={stop.id} gap="$3" alignItems="flex-start">
              {/* Step number */}
              <YStack alignItems="center" gap="$1" paddingTop="$3">
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
                {idx < stops.length - 1 && (
                  <YStack width={2} height={20} backgroundColor="$borderColor" />
                )}
              </YStack>

              {/* Stop fields */}
              <YStack flex={1} gap="$2">
                <YStack gap="$1">
                  <Text variant="caption" color="$mutedForeground">Spot ID *</Text>
                  <Input
                    value={stop.spotId}
                    onChangeText={(v) => updateStop(stop.id, 'spotId', v)}
                    variant="outline"
                    size="md"
                    placeholder="Paste Spot UUID..."
                    autoCapitalize="none"
                  />
                </YStack>
                <XStack gap="$2">
                  <YStack flex={1} gap="$1">
                    <Text variant="caption" color="$mutedForeground">Custom Title (optional)</Text>
                    <Input
                      value={stop.customTitle}
                      onChangeText={(v) => updateStop(stop.id, 'customTitle', v)}
                      variant="outline"
                      size="md"
                      placeholder="Override spot name..."
                    />
                  </YStack>
                </XStack>
              </YStack>

              {/* Remove */}
              {stops.length > 2 && (
                <XStack
                  paddingTop="$3"
                  cursor="pointer"
                  onPress={() => removeStop(stop.id)}
                  hoverStyle={{ opacity: 0.7 }}
                  padding="$2"
                >
                  <Trash2 size={16} color="var(--color-error500, #DC2626)" />
                </XStack>
              )}
            </XStack>
          ))}
        </YStack>
      </YStack>

      {/* Error */}
      {error && (
        <YStack
          backgroundColor="$error50"
          borderRadius="$3"
          padding="$3"
          borderWidth={1}
          borderColor="$error200"
        >
          <Text variant="caption" color="$error500">{error}</Text>
        </YStack>
      )}

      {/* Footer Actions */}
      <XStack gap="$3">
        <Button variant="outline" size="md" onPress={() => router.back()}>
          Cancel
        </Button>
        <Button
          variant="solid"
          size="md"
          loading={isPending}
          disabled={isPending || !title.trim()}
          onPress={handleSubmit}
          flex={1}
        >
          Create Route
        </Button>
      </XStack>
    </YStack>
  )
}
