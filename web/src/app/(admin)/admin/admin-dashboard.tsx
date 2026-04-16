'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Card } from '@antapp/ui'
import { LogOut, Grid3x3, Tag, Users, TrendingUp, MapPin } from 'lucide-react'
import { logout } from '@/features/auth/actions'
import { getAdminStats, type AdminStats } from '@/features/admin/dashboard-actions'
import { useEffect } from 'react'

type AdminSection = 'overview' | 'tags' | 'routes' | 'users' | 'spots'

export default function AdminDashboard({
  userName,
  email,
  roles,
}: {
  userName: string
  email: string
  roles: string[]
}) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    if (activeSection === 'overview') {
      getAdminStats().then(setStats)
    }
  }, [activeSection])

  useEffect(() => {
    // Prefetch routes for instant navigation
    router.prefetch('/admin/tags')
    router.prefetch('/admin/routes')
    router.prefetch('/admin/users')
    router.prefetch('/admin/spots')
  }, [router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  const sections: Array<{
    id: AdminSection
    label: string
    icon: React.ReactNode
    description: string
  }> = [
      {
        id: 'overview',
        label: 'Overview',
        icon: <Grid3x3 size={22} />,
        description: 'Dashboard & analytics',
      },
      {
        id: 'tags',
        label: 'Tags',
        icon: <Tag size={22} />,
        description: 'Manage route tags',
      },
      {
        id: 'routes',
        label: 'Routes',
        icon: <TrendingUp size={22} />,
        description: 'Moderate & promote routes',
      },
      {
        id: 'users',
        label: 'Users',
        icon: <Users size={22} />,
        description: 'Manage user accounts',
      },
      {
        id: 'spots',
        label: 'Spots',
        icon: <MapPin size={22} />,
        description: 'Manage places of interest',
      },
    ]

  const handleSelectSection = (sectionId: AdminSection) => {
    setActiveSection(sectionId)
    if (sectionId === 'tags') {
      router.push('/admin/tags')
    } else if (sectionId === 'routes') {
      router.push('/admin/routes')
    } else if (sectionId === 'users') {
      router.push('/admin/users')
    } else if (sectionId === 'spots') {
      router.push('/admin/spots')
    }
  }

  return (
    <YStack flex={1} gap="$6" padding="$6">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderBottomColor="$borderColor" paddingBottom="$4">
        <XStack alignItems="center" gap="$4" flex={1}>
          <img src="/ant-logo.png" alt="AntAPP Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <YStack gap="$2">
            <Text variant="heading1" color="$primary">Admin Panel</Text>
            <Text variant="body" muted>Welcome, {userName}</Text>
            <Text variant="caption" muted>{email}</Text>
          </YStack>
        </XStack>
        <Button
          size="md"
          variant="outline"
          icon={<LogOut size={16} />}
          loading={isLoggingOut}
          disabled={isLoggingOut}
          onPress={handleLogout}
        >
          Logout
        </Button>
      </XStack>

      {/* Navigation Cards */}
      <YStack gap="$3">
        <Text variant="heading3">Management</Text>
        <XStack gap="$4" flexWrap="wrap">
          {sections.map((section) => (
            <Card
              key={section.id}
              flex={1}
              minWidth={180}
              maxWidth={220}
              padding="$4"
              gap="$3"
              alignItems="flex-start"
              cursor="pointer"
              backgroundColor={
                activeSection === section.id
                  ? '$primary'
                  : '$backgroundStrong'
              }
              borderColor={
                activeSection === section.id
                  ? '$primary'
                  : '$borderColor'
              }
              hoverStyle={{
                borderColor: '$primary',
                scale: 1.02,
              }}
              pressStyle={{ scale: 0.98 }}
              onPress={() => handleSelectSection(section.id)}
              borderRadius="$4"
              borderWidth={2}
            >
              <YStack
                width={40}
                height={40}
                borderRadius="$2"
                backgroundColor={
                  activeSection === section.id
                    ? 'rgba(255,255,255,0.2)'
                    : '$muted'
                }
                justifyContent="center"
                alignItems="center"
              >
                {section.icon}
              </YStack>
              <YStack gap="$1">
                <Text
                  variant="heading4"
                  weight="semibold"
                  color={activeSection === section.id ? '#FFFFFF' : '$color'}
                >
                  {section.label}
                </Text>
                <Text
                  variant="caption"
                  color={
                    activeSection === section.id
                      ? 'rgba(255,255,255,0.8)'
                      : '$mutedForeground'
                  }
                >
                  {section.description}
                </Text>
              </YStack>
            </Card>
          ))}
        </XStack>
      </YStack>

      {/* Overview Content */}
      {activeSection === 'overview' && (
        <YStack gap="$6">
          <YStack gap="$4">
            <Text variant="heading3">System Overview</Text>
            <XStack gap="$4" flexWrap="wrap">
              <Card flex={1} minWidth={150} padding="$4" gap="$2" backgroundColor="$backgroundStrong" borderColor="$borderColor" borderWidth={1}>
                <Text variant="heading2" color="$primary">{stats?.totalRoutes ?? '—'}</Text>
                <Text variant="caption" muted>Total Routes</Text>
              </Card>
              <Card flex={1} minWidth={150} padding="$4" gap="$2" backgroundColor="$backgroundStrong" borderColor="$borderColor" borderWidth={1}>
                <Text variant="heading2" color="$primary">{stats?.activeUsers ?? '—'}</Text>
                <Text variant="caption" muted>Active Users</Text>
              </Card>
              <Card flex={1} minWidth={150} padding="$4" gap="$2" backgroundColor="$backgroundStrong" borderColor="$borderColor" borderWidth={1}>
                <Text variant="heading2" color="$primary">{stats?.totalTags ?? '—'}</Text>
                <Text variant="caption" muted>Total Tags</Text>
              </Card>
            </XStack>
          </YStack>

          <XStack gap="$6" flexWrap="wrap">
            {/* Latest Routes */}
            <YStack flex={1} minWidth={300} gap="$4">
              <Text variant="heading3">Latest Routes</Text>
              <YStack gap="$2">
                {stats?.recentRoutes && stats.recentRoutes.length > 0 ? (
                  stats.recentRoutes.map(route => (
                    <XStack key={route.id} padding="$3" backgroundColor="$backgroundStrong" borderRadius="$3" justifyContent="space-between" alignItems="center">
                      <YStack gap="$1">
                        <Text weight="bold" fontSize={14}>{route.title}</Text>
                        <Text variant="caption" muted>{new Date(route.createdAt).toLocaleDateString()}</Text>
                      </YStack>
                      <Button size="sm" variant="outline" onPress={() => router.push('/admin/routes')}>View in Panel</Button>
                    </XStack>
                  ))
                ) : (
                  <Text variant="caption" muted>No recent routes found.</Text>
                )}
              </YStack>
            </YStack>

            {/* Top Spots */}
            <YStack flex={1} minWidth={300} gap="$4">
              <Text variant="heading3">Top Rated Spots</Text>
              <YStack gap="$2">
                {stats?.topSpots && stats.topSpots.length > 0 ? (
                  stats.topSpots.map(spot => (
                    <XStack key={spot.id} padding="$3" backgroundColor="$backgroundStrong" borderRadius="$3" justifyContent="space-between" alignItems="center">
                      <YStack gap="$1">
                        <Text weight="bold" fontSize={14}>{spot.name}</Text>
                        <Text variant="caption" color="$warning600">★ {spot.averageRating.toFixed(1)}</Text>
                      </YStack>
                      <Button size="sm" variant="outline" onPress={() => handleSelectSection('spots')}>Manage</Button>
                    </XStack>
                  ))
                ) : (
                  <Text variant="caption" muted>No top spots found.</Text>
                )}
              </YStack>
            </YStack>
          </XStack>
        </YStack>
      )}
    </YStack>
  )
}
