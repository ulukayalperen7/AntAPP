'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Input } from '@antapp/ui'
import { Plus, Trash2, LogOut, ArrowLeft } from 'lucide-react'
import { logout } from '@/features/auth/actions'
import { createAdminTag, deleteAdminTag, getAdminTags } from '@/features/admin/tags-actions'
import type { Tag } from '@/types/api'

type FeedbackState = {
  ok: boolean
  message: string
} | null

export default function AdminTagsClient({
  userName,
  email,
  initialTags,
}: {
  userName: string
  email: string
  initialTags: Array<Tag & { id: string }>
}) {
  const router = useRouter()
  const [Tags, setTags] = useState(initialTags)
  const [showForm, setShowForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagDesc, setNewTagDesc] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoggingOut, startLogoutTransition] = useTransition()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      setFeedback({ ok: false, message: 'Tag name is required.' })
      return
    }

    setFeedback(null)
    startTransition(async () => {
      try {
        await createAdminTag(newTagName, newTagDesc || undefined)
        const updated = await getAdminTags()
        setTags(updated)
        setNewTagName('')
        setNewTagDesc('')
        setShowForm(false)
        setFeedback({ ok: true, message: 'Tag added successfully!' })
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to add Tag' })
      }
    })
  }

  const handleDeleteTag = (id: string) => {
    setFeedback(null)
    startTransition(async () => {
      try {
        await deleteAdminTag(id)
        const updated = await getAdminTags()
        setTags(updated)
        setDeleteConfirmId(null)
        setFeedback({ ok: true, message: 'Tag deleted!' })
      } catch (e) {
        setFeedback({ ok: false, message: (e as Error).message ?? 'Failed to delete Tag' })
      }
    })
  }

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logout()
    })
  }

  return (
    <YStack flex={1} gap="$6" padding="$6">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderBottomColor="$borderColor" paddingBottom="$4">
        <XStack gap="$3" alignItems="center" flex={1}>
          <Button
            size="md"
            variant="ghost"
            icon={<ArrowLeft size={18} />}
            onPress={() => router.push('/admin')}
          >
            Back
          </Button>
          <img src="/ant-logo.png" alt="AntAPP Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <YStack gap="$1">
            <XStack alignItems="center" gap="$2">
              <Text variant="heading2">Tags</Text>
            </XStack>
            <Text variant="caption" muted>{userName} ({email})</Text>
          </YStack>
        </XStack>
        <Button
          variant="ghost"
          size="md"
          icon={<LogOut size={16} />}
          loading={isLoggingOut}
          disabled={isLoggingOut}
          onPress={handleLogout}
        >
          Logout
        </Button>
      </XStack>

      {/* Feedback */}
      {feedback && (
        <YStack
          padding="$3"
          borderRadius="$3"
          backgroundColor={feedback.ok ? '$success50' : '$error50'}
          borderWidth={1}
          borderColor={feedback.ok ? '$success200' : '$error200'}
        >
          <Text
            variant="caption"
            color={feedback.ok ? '$success600' : '$error600'}
          >
            {feedback.message}
          </Text>
        </YStack>
      )}

      {/* Add Tag Form */}
      {showForm ? (
        <YStack gap="$3" padding="$4" backgroundColor="$muted" borderRadius="$3">
          <Text variant="heading4">Add New Tag</Text>
          <YStack gap="$2">
            <Text variant="label">Tag Name *</Text>
            <Input
              value={newTagName}
              onChangeText={setNewTagName}
              placeholder="e.g. Heritage, Adventure, Food"
              variant="outline"
              size="md"
            />
          </YStack>
          <YStack gap="$2">
            <Text variant="label">Description (optional)</Text>
            <Input
              value={newTagDesc}
              onChangeText={setNewTagDesc}
              placeholder="Brief description..."
              variant="outline"
              size="md"
            />
          </YStack>
          <XStack gap="$2">
            <Button
              size="md"
              backgroundColor="$primary"
              color="#FFFFFF"
              loading={isPending}
              disabled={isPending}
              onPress={handleAddTag}
            >
              Save Tag
            </Button>
            <Button
              size="md"
              variant="ghost"
              onPress={() => {
                setShowForm(false)
                setNewTagName('')
                setNewTagDesc('')
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </XStack>
        </YStack>
      ) : (
        <Button
          size="md"
          icon={<Plus size={16} />}
          backgroundColor="$primary"
          color="#FFFFFF"
          onPress={() => setShowForm(true)}
        >
          Add New Tag
        </Button>
      )}

      {/* Tags Table */}
      <YStack gap="$3">
        <Text variant="heading3">Tags ({Tags.length})</Text>
        {Tags.length === 0 ? (
          <YStack
            padding="$6"
            alignItems="center"
            justifyContent="center"
            backgroundColor="$muted"
            borderRadius="$3"
            minHeight={200}
          >
            <Text variant="body" muted>No Tags yet. Create one to get started!</Text>
          </YStack>
        ) : (
          <YStack gap="$2" overflowX="auto">
            {/* Table Header */}
            <XStack
              padding="$3"
              backgroundColor="$backgroundStrong"
              borderBottomWidth={2}
              borderBottomColor="$borderColor"
              gap="$3"
            >
              <Text flex={2} variant="label" weight="semibold">Name</Text>
              <Text flex={3} variant="label" weight="semibold">Description</Text>
              <Text flex={1} variant="label" weight="semibold" textAlign="center">Actions</Text>
            </XStack>

            {/* Table Rows */}
            {Tags.map((cat) => (
              <XStack
                key={cat.id}
                padding="$3"
                borderBottomWidth={1}
                borderBottomColor="$borderColor"
                gap="$3"
                alignItems="center"
              >
                <Text flex={2} variant="body">{cat.name}</Text>
                <Text flex={3} variant="caption" muted numberOfLines={2}>
                  {cat.description || '—'}
                </Text>
                <XStack flex={1} justifyContent="center">
                  {deleteConfirmId === cat.id ? (
                    <XStack gap="$1.5" alignItems="center">
                      <Button
                        size="sm"
                        backgroundColor="$error500"
                        color="#FFFFFF"
                        onPress={() => handleDeleteTag(cat.id)}
                        loading={isPending}
                        disabled={isPending}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => setDeleteConfirmId(null)}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                    </XStack>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Trash2 size={14} />}
                      onPress={() => setDeleteConfirmId(cat.id)}
                    />
                  )}
                </XStack>
              </XStack>
            ))}
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
