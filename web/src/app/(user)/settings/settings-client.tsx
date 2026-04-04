'use client'

import { useState, useTransition } from 'react'
import { YStack, XStack, Text, Button, Input, Avatar, Divider } from '@antapp/ui'
import type { CurrentUser } from '@/types/api'
import { updateProfile, changePassword } from '@/features/account/actions'
import { User, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

type FeedbackState = { ok: boolean; message: string } | null

export default function SettingsClient({ user }: { user: CurrentUser | null }) {
  // Profile form
  const [userName, setUserName] = useState(user?.userName ?? '')
  const [profileFeedback, setProfileFeedback] = useState<FeedbackState>(null)
  const [isUpdatingProfile, startProfileUpdate] = useTransition()

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState>(null)
  const [isChangingPw, startPwChange] = useTransition()

  const handleProfileSave = () => {
    setProfileFeedback(null)
    startProfileUpdate(async () => {
      try {
        await updateProfile({ userName })
        setProfileFeedback({ ok: true, message: 'Profile updated successfully.' })
      } catch (e) {
        setProfileFeedback({ ok: false, message: (e as Error).message ?? 'Failed to update profile.' })
      }
    })
  }

  const handlePasswordChange = () => {
    setPasswordFeedback(null)
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ ok: false, message: 'Passwords do not match.' })
      return
    }
    startPwChange(async () => {
      try {
        await changePassword({ currentPassword, newPassword, confirmPassword })
        setPasswordFeedback({ ok: true, message: 'Password changed successfully.' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } catch (e) {
        setPasswordFeedback({ ok: false, message: (e as Error).message ?? 'Failed to change password.' })
      }
    })
  }

  const initials = user?.userName?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <YStack gap="$6" flex={1} maxWidth={680}>
      <YStack gap="$1">
        <Text variant="heading2">Settings</Text>
        <Text variant="body" muted>Manage your account and preferences</Text>
      </YStack>

      {/* Profile Section */}
      <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$5" gap="$4" borderWidth={1} borderColor="$borderColor">
        <XStack alignItems="center" gap="$3">
          <User size={20} color="var(--color-primary)" />
          <Text variant="heading4">Profile Information</Text>
        </XStack>

        <Divider />

        <XStack gap="$4" alignItems="center">
          <Avatar size="lg" initials={initials} />
          <YStack gap="$0.5">
            <Text variant="body" weight="semibold">{user?.userName ?? '—'}</Text>
            <Text variant="caption" muted>{user?.email ?? '—'}</Text>
            {user && !user.isVerified && (
              <XStack
                backgroundColor="$warning50"
                paddingHorizontal="$2"
                paddingVertical="$0.5"
                borderRadius="$2"
                alignSelf="flex-start"
              >
                <Text variant="caption" color="$warning500">Email not verified</Text>
              </XStack>
            )}
          </YStack>
        </XStack>

        <YStack gap="$1.5">
          <Text variant="label" color="$mutedForeground">Username</Text>
          <Input
            value={userName}
            onChangeText={setUserName}
            variant="outline"
            size="md"
            placeholder="Your username"
            autoCapitalize="none"
          />
        </YStack>

        {profileFeedback && (
          <XStack gap="$2" alignItems="center">
            {profileFeedback.ok
              ? <CheckCircle2 size={16} color="var(--color-success500, #22C55E)" />
              : <AlertCircle size={16} color="var(--color-error500, #DC2626)" />
            }
            <Text variant="caption" color={profileFeedback.ok ? '$success500' : '$error500'}>
              {profileFeedback.message}
            </Text>
          </XStack>
        )}

        <Button
          variant="solid"
          size="md"
          alignSelf="flex-start"
          loading={isUpdatingProfile}
          disabled={isUpdatingProfile || !userName.trim() || userName === user?.userName}
          onPress={handleProfileSave}
        >
          Save Changes
        </Button>
      </YStack>

      {/* Password Section */}
      <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$5" gap="$4" borderWidth={1} borderColor="$borderColor">
        <XStack alignItems="center" gap="$3">
          <Lock size={20} color="var(--color-primary)" />
          <Text variant="heading4">Change Password</Text>
        </XStack>

        <Divider />

        <YStack gap="$3">
          <YStack gap="$1.5">
            <Text variant="label" color="$mutedForeground">Current Password</Text>
            <Input
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              variant="outline"
              size="md"
              placeholder="••••••••"
            />
          </YStack>

          <YStack gap="$1.5">
            <Text variant="label" color="$mutedForeground">New Password</Text>
            <Input
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              variant="outline"
              size="md"
              placeholder="••••••••"
            />
          </YStack>

          <YStack gap="$1.5">
            <Text variant="label" color="$mutedForeground">Confirm New Password</Text>
            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              variant="outline"
              size="md"
              placeholder="••••••••"
              error={!!confirmPassword && confirmPassword !== newPassword}
            />
          </YStack>
        </YStack>

        {passwordFeedback && (
          <XStack gap="$2" alignItems="center">
            {passwordFeedback.ok
              ? <CheckCircle2 size={16} color="var(--color-success500, #22C55E)" />
              : <AlertCircle size={16} color="var(--color-error500, #DC2626)" />
            }
            <Text variant="caption" color={passwordFeedback.ok ? '$success500' : '$error500'}>
              {passwordFeedback.message}
            </Text>
          </XStack>
        )}

        <Button
          variant="solid"
          size="md"
          alignSelf="flex-start"
          loading={isChangingPw}
          disabled={isChangingPw || !currentPassword || !newPassword || newPassword !== confirmPassword}
          onPress={handlePasswordChange}
        >
          Change Password
        </Button>
      </YStack>

      {/* Account Info */}
      {user && (
        <YStack backgroundColor="$muted" borderRadius="$4" padding="$4" gap="$2">
          <Text variant="label" color="$mutedForeground">Account Details</Text>
          <XStack gap="$4" flexWrap="wrap">
            <YStack gap="$0.5">
              <Text variant="caption" muted>Roles</Text>
              <Text variant="body">{user.roles.join(', ')}</Text>
            </YStack>
            <YStack gap="$0.5">
              <Text variant="caption" muted>Email Status</Text>
              <Text variant="body" color={user.isVerified ? '$success500' : '$warning500'}>
                {user.isVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </YStack>
          </XStack>
        </YStack>
      )}
    </YStack>
  )
}
