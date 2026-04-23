'use client'

import { useRouter } from 'next/navigation'
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  Theme,
  Image,
} from '@antapp/ui'
import { MapPin, Download, LogIn, Star, Users, Zap } from 'lucide-react'
import type { RouteListItem } from '@/types/api'

type FeaturedRoute = RouteListItem

export function LandingPageClient({
  featuredRoutes,
}: {
  featuredRoutes: FeaturedRoute[]
}) {
  const router = useRouter()

  return (
    <Theme name="light">
      <YStack flex={1} backgroundColor="$background">
        <XStack
          paddingVertical="$4"
          paddingHorizontal="$6"
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <XStack alignItems="center" gap="$2">
            <Image src="/ant-logo.png" alt="AntAPP Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
            <Text variant="heading3" weight="bold" color="$primary">
              AntAPP
            </Text>
          </XStack>
          <XStack gap="$3">
            <Button variant="ghost" size="md" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button
              size="md"
              backgroundColor="$primary"
              color="#FFFFFF"
              onClick={() => router.push('/register')}
            >
              Sign Up
            </Button>
          </XStack>
        </XStack>

        <YStack
          flex={1}
          backgroundColor="linear-gradient(135deg, $primary 0%, $primaryDeep 100%)"
          paddingVertical="$12"
          paddingHorizontal="$6"
          justifyContent="center"
          alignItems="center"
          gap="$6"
          position="relative"
          overflow="hidden"
        >
          <YStack
            position="absolute"
            width={300}
            height={300}
            borderRadius="$full"
            backgroundColor="rgba(255, 140, 0, 0.1)"
            top={-100}
            right={-100}
          />
          <YStack
            position="absolute"
            width={250}
            height={250}
            borderRadius="$full"
            backgroundColor="rgba(0, 206, 201, 0.1)"
            bottom={-50}
            left={-50}
          />

          <YStack gap="$4" alignItems="center" justifyContent="center" maxWidth={600} zIndex={1}>
            <Text
              variant="heading1"
              weight="bold"
              color="#000000"
              textAlign="center"
              fontSize="$10"
              lineHeight={1.2}
            >
              Discover The Hidden Gems of Your City
            </Text>
            <Text variant="body" color="#1a1a1a" textAlign="center" fontSize="$5">
              Plan better routes, discover amazing stops, and share your adventures with the AntAPP community
            </Text>

            <XStack gap="$4" marginTop="$6" flexWrap="wrap" justifyContent="center">
              <Button
                size="lg"
                backgroundColor="#FF8C00"
                color="#FFFFFF"
                icon={<LogIn size={16} color="#FFFFFF" />}
                onClick={() => router.push('/register')}
                borderRadius="$4"
              >
                Join Now
              </Button>
              <Button
                size="lg"
                backgroundColor="#FF8C00"
                color="#FFFFFF"
                icon={<Download size={16} color="#FFFFFF" />}
                borderRadius="$4"
              >
                Download App
              </Button>
            </XStack>
          </YStack>
        </YStack>

        <YStack paddingVertical="$12" paddingHorizontal="$6" gap="$6">
          <YStack gap="$2" alignItems="center">
            <Text variant="heading2" weight="bold" textAlign="center">
              Featured Official Routes
            </Text>
            <Text variant="body" muted textAlign="center">
              Explore curated routes from our community experts
            </Text>
          </YStack>

          {featuredRoutes.length === 0 ? (
            <Text textAlign="center" muted>No routes available</Text>
          ) : (
            <XStack gap="$4" flexWrap="wrap" justifyContent="center">
              {featuredRoutes.map((route) => (
                <Card
                  key={route.id}
                  flex={1}
                  minWidth={280}
                  maxWidth={300}
                  overflow="hidden"
                  cursor="pointer"
                  hoverStyle={{ borderColor: '$primary', scale: 1.02 }}
                  pressStyle={{ scale: 0.98 }}
                  onClick={() => router.push(`/routes/${route.id}`)}
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <YStack
                    height={160}
                    backgroundColor="$muted"
                    justifyContent="center"
                    alignItems="center"
                  >
                    {route.thumbnailUrl ? (
                      <Image
                        src={route.thumbnailUrl}
                        alt={route.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <MapPin size={40} color="var(--color-mutedForeground)" />
                    )}
                  </YStack>

                  <YStack padding="$4" gap="$3">
                    <Text variant="heading4" numberOfLines={2}>
                      {route.title}
                    </Text>
                    <Text variant="caption" muted numberOfLines={2}>
                      {route.description}
                    </Text>

                    <XStack gap="$1" alignItems="center">
                      <Star size={14} fill="#FF8C00" color="#FF8C00" />
                      <Text variant="caption" weight="semibold">
                        {route.averageRating?.toFixed(1) || 'N/A'} / 5
                      </Text>
                    </XStack>
                  </YStack>
                </Card>
              ))}
            </XStack>
          )}
        </YStack>

        <YStack
          paddingVertical="$12"
          paddingHorizontal="$6"
          gap="$6"
          backgroundColor="$muted"
        >
          <YStack gap="$2" alignItems="center">
            <Text variant="heading2" weight="bold" textAlign="center">
              Why Choose AntAPP?
            </Text>
          </YStack>

          <XStack gap="$6" flexWrap="wrap" justifyContent="center">
            {[
              {
                icon: <MapPin size={32} color="$primary" />,
                title: 'Discover Routes',
                desc: 'Find the best routes in your city',
              },
              {
                icon: <Users size={32} color="$primary" />,
                title: 'Share Community',
                desc: 'Create and share your routes',
              },
              {
                icon: <Zap size={32} color="$primary" />,
                title: 'Save Favorites',
                desc: 'Keep your favorite spots organized',
              },
            ].map((feature, idx) => (
              <YStack
                key={idx}
                flex={1}
                minWidth={200}
                gap="$3"
                alignItems="center"
              >
                <YStack
                  width={60}
                  height={60}
                  borderRadius="$full"
                  backgroundColor="$primary"
                  opacity={0.15}
                  justifyContent="center"
                  alignItems="center"
                >
                  {feature.icon}
                </YStack>
                <Text variant="heading4" weight="semibold" textAlign="center">
                  {feature.title}
                </Text>
                <Text variant="caption" muted textAlign="center">
                  {feature.desc}
                </Text>
              </YStack>
            ))}
          </XStack>
        </YStack>

        <YStack
          paddingVertical="$8"
          paddingHorizontal="$6"
          gap="$4"
          alignItems="center"
          backgroundColor="$background"
        >
          <Text variant="heading3" weight="bold" textAlign="center">
            Ready to Start Your Journey?
          </Text>
          <Button
            size="lg"
            backgroundColor="$primary"
            color="#FFFFFF"
            onClick={() => router.push('/register')}
            borderRadius="$4"
          >
            Sign Up for Free
          </Button>
          <Text variant="caption" muted>
            No credit card required • Join thousands of adventurers
          </Text>
        </YStack>
      </YStack>
    </Theme>
  )
}
