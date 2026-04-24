'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Text, XStack, YStack } from '@antapp/ui'
import type { RouteListItem } from '@/types/api'
import { createPost } from '@/features/posts/actions'
import { ArrowLeft, ImagePlus, Plus, Trash2 } from 'lucide-react'

type Props = {
  routes: RouteListItem[]
}

export default function CreatePostClient({ routes }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [routeId, setRouteId] = useState(routes[0]?.id ?? '')
  const [content, setContent] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [error, setError] = useState<string | null>(null)

  const routeOptions = useMemo(
    () => routes.map((route) => ({ id: route.id, title: route.title })),
    [routes],
  )

  const updateImage = (index: number, value: string) => {
    setImageUrls((prev) => prev.map((url, idx) => (idx === index ? value : url)))
  }

  const addImageField = () => {
    setImageUrls((prev) => [...prev, ''])
  }

  const removeImageField = (index: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = () => {
    setError(null)

    if (!routeId) {
      setError('Please choose a route.')
      return
    }

    startTransition(async () => {
      try {
        await createPost({
          routeId,
          content: content.trim() || undefined,
          imageUrls: imageUrls.map((url) => url.trim()).filter(Boolean),
        })
        router.push('/dashboard')
      } catch (e) {
        setError((e as Error).message ?? 'Failed to create post.')
      }
    })
  }

  return (
    <YStack gap="$5" flex={1} maxWidth={760}>
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
          <Text variant="heading2">Create Post</Text>
          <Text variant="body" muted>Share a route with optional post images</Text>
        </YStack>
      </XStack>

      <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$5" gap="$4" borderWidth={1} borderColor="$borderColor">
        <YStack gap="$1.5">
          <Text variant="label" color="$mutedForeground">Route *</Text>
          {routeOptions.length > 0 ? (
            <select
              value={routeId}
              onChange={(event) => setRouteId(event.target.value)}
              style={{
                minHeight: 42,
                borderRadius: 10,
                border: '1px solid #D1D5DB',
                padding: '0 12px',
                background: '#fff',
                color: '#111827',
              }}
            >
              {routeOptions.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.title}
                </option>
              ))}
            </select>
          ) : (
            <Text variant="caption" color="$warning500">
              You need at least one public route before creating a post.
            </Text>
          )}
        </YStack>

        <YStack gap="$1.5">
          <Text variant="label" color="$mutedForeground">Post text</Text>
          <Input
            value={content}
            onChangeText={setContent}
            variant="outline"
            size="md"
            placeholder="Write a short caption for this post..."
          />
        </YStack>
      </YStack>

      <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$5" gap="$4" borderWidth={1} borderColor="$borderColor">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text variant="heading4">Image section</Text>
            <Text variant="caption" muted>Add one or more image URLs for this post</Text>
          </YStack>
          <Button variant="outline" size="sm" icon={<Plus size={14} color="currentColor" />} onPress={addImageField}>
            Add image
          </Button>
        </XStack>

        <YStack gap="$3">
          {imageUrls.map((url, index) => (
            <XStack key={`post-image-${index}`} gap="$2" alignItems="center">
              <XStack alignItems="center" justifyContent="center" width={34} height={34} borderRadius="$2" backgroundColor="$muted">
                <ImagePlus size={16} color="var(--color-mutedForeground)" />
              </XStack>
              <Input
                value={url}
                onChangeText={(value) => updateImage(index, value)}
                variant="outline"
                size="md"
                placeholder="https://example.com/image.jpg"
                flex={1}
              />
              {imageUrls.length > 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={14} color="var(--color-error500, #DC2626)" />}
                  onPress={() => removeImageField(index)}
                />
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

      <XStack gap="$3">
        <Button variant="outline" size="md" onPress={() => router.back()}>
          Cancel
        </Button>
        <Button
          variant="solid"
          size="md"
          loading={isPending}
          disabled={isPending || !routeId || routeOptions.length === 0}
          onPress={handleSubmit}
          flex={1}
        >
          Publish post
        </Button>
      </XStack>
    </YStack>
  )
}
