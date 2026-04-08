'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Card } from '@antapp/ui'
import { LogOut, Grid3x3, Tag, Users, TrendingUp } from 'lucide-react'
import { logout } from '@/features/auth/actions'

type AdminSection = 'overview' | 'categories' | 'routes' | 'users'

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
        id: 'categories',
        label: 'Categories',
        icon: <Tag size={22} />,
        description: 'Manage route categories',
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
    ]

  const handleSelectSection = (sectionId: AdminSection) => {
    setActiveSection(sectionId)
    if (sectionId === 'categories') {
      router.push('/admin/categories')
    } else if (sectionId === 'routes') {
      router.push('/admin/routes')
    } else if (sectionId === 'users') {
      router.push('/admin/users')
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
        <YStack gap="$4">
          <Text variant="heading3">Quick Stats</Text>
          <XStack gap="$4" flexWrap="wrap">
            <Card flex={1} minWidth={200} padding="$4" gap="$2">
              <Text variant="heading2" color="$primary">—</Text>
              <Text variant="caption" muted>Total Routes</Text>
            </Card>
            <Card flex={1} minWidth={200} padding="$4" gap="$2">
              <Text variant="heading2" color="$primary">—</Text>
              <Text variant="caption" muted>Active Users</Text>
            </Card>
            <Card flex={1} minWidth={200} padding="$4" gap="$2">
              <Text variant="heading2" color="$primary">—</Text>
              <Text variant="caption" muted>Categories</Text>
            </Card>
          </XStack>
          <YStack gap="$3" marginTop="$4">
            <Text variant="heading3">Navigation</Text>
            <Text variant="body" muted>
              Select a section from the cards above to manage different parts of the system.
            </Text>
          </YStack>
        </YStack>
      )}
    </YStack>
  )
}
