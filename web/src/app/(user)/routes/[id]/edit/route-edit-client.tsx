'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Input, Divider } from '@antapp/ui'
import type { RouteDetail } from '@/types/api'
import { updateRoute, publishRoute, unpublishRoute, deleteRoute } from '@/features/routes/actions'
import { ArrowLeft, Globe, Lock, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'

type FeedbackState = { ok: boolean; message: string } | null

export default function RouteEditClient({ route }: { route: RouteDetail }) {
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState(route.title)
  const [description, setDescription] = useState(route.description ?? '')
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [isSaving, startSave] = useTransition()

  // Publish/Unpublish
  const [isPublic, setIsPublic] = useState(route.isPublic)
  const [isTogglingPublish, startToggle] = useTransition()

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isDeleting, startDelete] = useTransition()

  const handleSave = () => {
    setFeedback(null)
    if (!title.trim()) {
      setFeedback({ ok: false, message: 'Title is required.' })
      return
    }
    startSave(async () => {
      try {
        await updateRoute(route.id, {
          title: title.trim(),
          description: description.trim() || undefined,
        })
        setFeedback({ ok: true, message: 'Route updated successfully.' })
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to update.' })
      }
    })
  }

  const handleTogglePublish = () => {
    startToggle(async () => {
      try {
        if (isPublic) {
          await unpublishRoute(route.id)
          setIsPublic(false)
        } else {
          await publishRoute(route.id)
          setIsPublic(true)
        }
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to change visibility.' })
      }
    })
  }

  const handleDelete = () => {
    startDelete(async () => {
      try {
        await deleteRoute(route.id)
        router.replace('/profile')
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to delete route.' })
        setDeleteConfirm(false)
      }
    })
  }

  const isDirty = title !== route.title || description !== (route.description ?? '')

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
          <Text variant="heading2">Edit Route</Text>
          <Text variant="body" muted numberOfLines={1}>{route.title}</Text>
        </YStack>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.push(`/routes/${route.id}`)}
        >
          View Route
        </Button>
      </XStack>

      {/* Route Info */}
      <YStack
        backgroundColor="$backgroundStrong"
        borderRadius="$4"
        padding="$5"
        gap="$4"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text variant="heading4">Route Information</Text>

        <YStack gap="$1.5">
          <Text variant="label" color="$mutedForeground">Title *</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            variant="outline"
            size="md"
            placeholder="Route title"
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
            // @ts-ignore multiline web
            multiline
            numberOfLines={4}
          />
        </YStack>

        {feedback && (
          <XStack gap="$2" alignItems="center">
            {feedback.ok
              ? <CheckCircle2 size={16} color="var(--color-success500, #22C55E)" />
              : <AlertCircle size={16} color="var(--color-error500, #DC2626)" />
            }
            <Text variant="caption" color={feedback.ok ? '$success500' : '$error500'}>
              {feedback.message}
            </Text>
          </XStack>
        )}

        <XStack gap="$2">
          <Button
            variant="solid"
            size="md"
            loading={isSaving}
            disabled={isSaving || !isDirty || !title.trim()}
            onPress={handleSave}
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            size="md"
            disabled={isSaving}
            onPress={() => {
              setTitle(route.title)
              setDescription(route.description ?? '')
              setFeedback(null)
            }}
          >
            Discard
          </Button>
        </XStack>
      </YStack>

      {/* Visibility */}
      <YStack
        backgroundColor="$backgroundStrong"
        borderRadius="$4"
        padding="$5"
        gap="$4"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text variant="heading4">Visibility</Text>
        <XStack
          backgroundColor={isPublic ? '$success50' : '$muted'}
          borderRadius="$3"
          padding="$4"
          borderWidth={1}
          borderColor={isPublic ? '$success200' : '$borderColor'}
          gap="$3"
          alignItems="center"
        >
          {isPublic
            ? <Globe size={20} color="var(--color-success500, #22C55E)" />
            : <Lock size={20} color="var(--color-mutedForeground)" />
          }
          <YStack flex={1} gap="$0.5">
            <Text variant="label" weight="semibold">
              {isPublic ? 'Public' : 'Private'}
            </Text>
            <Text variant="caption" muted>
              {isPublic
                ? 'This route is visible to everyone on the platform.'
                : 'Only you can see this route.'
              }
            </Text>
          </YStack>
          <Button
            variant={isPublic ? 'outline' : 'solid'}
            size="sm"
            loading={isTogglingPublish}
            disabled={isTogglingPublish}
            onPress={handleTogglePublish}
          >
            {isPublic ? 'Unpublish' : 'Publish'}
          </Button>
        </XStack>
      </YStack>

      {/* Danger Zone */}
      <YStack
        backgroundColor="$backgroundStrong"
        borderRadius="$4"
        padding="$5"
        gap="$4"
        borderWidth={1}
        borderColor="$error200"
      >
        <Text variant="heading4" color="$error500">Danger Zone</Text>
        <Divider />
        <XStack gap="$4" alignItems="center" flexWrap="wrap">
          <YStack flex={1} gap="$0.5">
            <Text variant="label">Delete Route</Text>
            <Text variant="caption" muted>
              Permanently delete this route. This action cannot be undone.
            </Text>
          </YStack>
          {!deleteConfirm ? (
            <Button
              variant="outline"
              size="sm"
              onPress={() => setDeleteConfirm(true)}
              icon={<Trash2 size={14} color="var(--color-error500, #DC2626)" />}
            >
              <Text variant="label" color="$error500">Delete</Text>
            </Button>
          ) : (
            <XStack gap="$2">
              <Button
                variant="outline"
                size="sm"
                onPress={() => setDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                loading={isDeleting}
                disabled={isDeleting}
                onPress={handleDelete}
                backgroundColor="$error500"
                hoverStyle={{ backgroundColor: '$error400' }}
              >
                <Text variant="label" color="#FFFFFF">Confirm Delete</Text>
              </Button>
            </XStack>
          )}
        </XStack>
      </YStack>
    </YStack>
  )
}
