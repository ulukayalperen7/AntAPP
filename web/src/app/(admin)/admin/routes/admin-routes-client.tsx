'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import { LogOut, ArrowLeft, Star } from 'lucide-react'
import { logout } from '@/features/auth/actions'
import { promoteRoute } from '@/features/admin/routes-actions'
import type { RouteListItem } from '@/types/api'

export default function AdminRoutesClient({
    userName,
    email,
    initialRoutes,
}: {
    userName: string
    email: string
    initialRoutes: RouteListItem[]
}) {
    const router = useRouter()
    const [routes, setRoutes] = useState(initialRoutes)
    const [isPending, startTransition] = useTransition()
    const [isLoggingOut, startLogoutTransition] = useTransition()

    const handlePromote = (id: string, newType: 'Official' | 'Sponsored' | 'Community') => {
        startTransition(async () => {
            const success = await promoteRoute(id, newType)
            if (success) {
                setRoutes(prev => prev.map(r => r.id === id ? { ...r, contentType: newType } : r))
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
                            <Text variant="heading2">Routes</Text>
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
                <Text variant="heading3">All Routes ({routes.length})</Text>
                {routes.length === 0 ? (
                    <YStack padding="$6" alignItems="center" justifyContent="center" backgroundColor="$muted" borderRadius="$3" minHeight={200}>
                        <Text variant="body" muted>No routes found in the system.</Text>
                    </YStack>
                ) : (
                    <YStack gap="$2" overflowX="auto">
                        <XStack padding="$3" backgroundColor="$backgroundStrong" borderBottomWidth={2} borderBottomColor="$borderColor" gap="$3">
                            <Text flex={2} variant="label" weight="semibold">Title</Text>
                            <Text flex={1} variant="label" weight="semibold">Visibility</Text>
                            <Text flex={1} variant="label" weight="semibold">Type</Text>
                            <Text flex={1} variant="label" weight="semibold">Rating</Text>
                            <Text flex={2} variant="label" weight="semibold" textAlign="center">Moderation Actions</Text>
                        </XStack>

                        {routes.map((route) => (
                            <XStack key={route.id} padding="$3" borderBottomWidth={1} borderBottomColor="$borderColor" gap="$3" alignItems="center">
                                <Text flex={2} variant="body" numberOfLines={1}>{route.title}</Text>
                                <Text flex={1} variant="caption" muted>{route.isPublic ? 'Public' : 'Private'}</Text>
                                <YStack flex={1}>
                                    <Text variant="caption" weight={route.contentType !== 'Community' ? 'bold' : undefined} color={route.contentType === 'Official' ? '$primary' : (route.contentType === 'Sponsored' ? '$success600' : '$color')}>
                                        {route.contentType}
                                    </Text>
                                </YStack>
                                <XStack flex={1} alignItems="center" gap="$1">
                                    {route.averageRating > 0 ? (
                                        <>
                                            <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                            <Text variant="caption">{route.averageRating.toFixed(1)}</Text>
                                        </>
                                    ) : (
                                        <Text variant="caption" muted>N/A</Text>
                                    )}
                                </XStack>
                                <XStack flex={2} justifyContent="center" gap="$2">
                                    {route.contentType === 'Community' && (
                                        <>
                                            <Button size="sm" variant="outline" onPress={() => handlePromote(route.id, 'Official')} disabled={isPending}>Make Official</Button>
                                            <Button size="sm" variant="outline" onPress={() => handlePromote(route.id, 'Sponsored')} disabled={isPending}>Make Sponsored</Button>
                                        </>
                                    )}
                                    {route.contentType !== 'Community' && (
                                        <Button size="sm" variant="outline" onPress={() => handlePromote(route.id, 'Community')} disabled={isPending}>Revert to Community</Button>
                                    )}
                                </XStack>
                            </XStack>
                        ))}
                    </YStack>
                )}
            </YStack>
        </YStack >
    )
}
