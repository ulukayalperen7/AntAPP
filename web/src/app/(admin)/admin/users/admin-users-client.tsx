'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import { LogOut, ArrowLeft } from 'lucide-react'
import { logout } from '@/features/auth/actions'
import { updateUserStatus, AdminUserItem } from '@/features/admin/users-actions'

export default function AdminUsersClient({
    userName,
    email,
    initialUsers,
}: {
    userName: string
    email: string
    initialUsers: AdminUserItem[]
}) {
    const router = useRouter()
    const [users, setUsers] = useState(initialUsers)
    const [isPending, startTransition] = useTransition()
    const [isLoggingOut, startLogoutTransition] = useTransition()

    const handleToggleStatus = (id: string, currentStatus: boolean) => {
        startTransition(async () => {
            const success = await updateUserStatus(id, !currentStatus)
            if (success) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u))
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
                            <Text variant="heading2">Users</Text>
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
            </XStack >

            <YStack gap="$3">
                <Text variant="heading3">Active & Banned Users ({users.length})</Text>
                {users.length === 0 ? (
                    <YStack padding="$6" alignItems="center" justifyContent="center" backgroundColor="$muted" borderRadius="$3" minHeight={200}>
                        <Text variant="body" muted>No users found.</Text>
                    </YStack>
                ) : (
                    <YStack gap="$2" overflowX="auto">
                        <XStack padding="$3" backgroundColor="$backgroundStrong" borderBottomWidth={2} borderBottomColor="$borderColor" gap="$3">
                            <XStack flex={2} flexBasis={0} minWidth={0}><Text variant="label" weight="semibold">Email / Username</Text></XStack>
                            <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Roles</Text></XStack>
                            <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Status</Text></XStack>
                            <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Actions</Text></XStack>
                        </XStack>

                        {users.map((user) => (
                            <XStack key={user.id} padding="$3" borderBottomWidth={1} borderBottomColor="$borderColor" gap="$3" alignItems="center">
                                <YStack flex={2} flexBasis={0} minWidth={0}>
                                    <Text variant="body" weight="semibold" numberOfLines={1}>{user.email}</Text>
                                    <Text variant="caption" muted numberOfLines={1}>{user.userName}</Text>
                                </YStack>
                                <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center">
                                    <Text variant="caption" muted textAlign="center">{user.roles.join(', ') || 'User'}</Text>
                                </XStack>
                                <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center">
                                    <Text variant="caption" color={user.isActive ? '$success600' : '$error600'} weight="semibold" textAlign="center">
                                        {user.isActive ? 'Active' : 'Banned'}
                                    </Text>
                                </XStack>

                                <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center" gap="$2">
                                    <Button
                                        size="sm"
                                        variant={user.isActive ? 'outline' : 'solid'}
                                        backgroundColor={user.isActive ? 'transparent' : '$success500'}
                                        borderColor={user.isActive ? '$error500' : undefined}
                                        color={user.isActive ? '$error500' : '#FFFFFF'}
                                        onPress={() => handleToggleStatus(user.id, user.isActive)}
                                        disabled={isPending || user.userName === 'antadmin'}
                                    >
                                        {user.isActive ? 'Suspend' : 'Reactivate'}
                                    </Button>
                                </XStack>
                            </XStack>
                        ))}
                    </YStack>
                )}
            </YStack>
        </YStack >
    )
}
