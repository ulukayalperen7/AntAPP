'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Card,
  Container,
  Text,
  Theme,
  XStack,
  YStack,
  useTheme,
} from '@antapp/ui'
import {
  ArrowRight,
  Compass,
  Download,
  MapPin,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'

type FeaturedRoute = {
  id: string
  title: string
  description: string
  averageRating: number
  routeCount?: number
  thumbnailUrl?: string
}

function HeroMetric({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <YStack
      flex={1}
      minWidth={120}
      gap="$1"
      padding="$3"
      borderRadius="$4"
      backgroundColor="rgba(255,255,255,0.7)"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.5)"
      backdropFilter="blur(12px)"
    >
      <Text variant="heading4">{value}</Text>
      <Text variant="caption" muted>
        {label}
      </Text>
    </YStack>
  )
}

function FeatureCard({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <Card
      flex={1}
      minWidth={240}
      size="lg"
      backgroundColor="$backgroundStrong"
      borderWidth={1}
      borderColor="$borderColor"
      hoverStyle={{ borderColor: '$primary', transform: [{ translateY: '-3px' }] }}
      style={{ transition: 'transform 180ms ease, border-color 180ms ease' }}
    >
      <YStack gap="$4">
        <XStack
          width={56}
          height={56}
          borderRadius="$full"
          alignItems="center"
          justifyContent="center"
          backgroundColor="$primary50"
        >
          {icon}
        </XStack>
        <YStack gap="$2">
          <Text variant="caption" color="$primary" style={{ letterSpacing: 1.2, textTransform: 'uppercase' }}>
            {eyebrow}
          </Text>
          <Text variant="heading4">{title}</Text>
          <Text variant="body" muted>
            {description}
          </Text>
        </YStack>
      </YStack>
    </Card>
  )
}

function FeaturedRouteCard({
  route,
  onOpen,
  accent,
}: {
  route: FeaturedRoute
  onOpen: () => void
  accent: string
}) {
  return (
    <Card
      flex={1}
      minWidth={280}
      maxWidth={360}
      size="md"
      pressable
      onClick={onOpen}
      borderWidth={1}
      borderColor="$borderColor"
      hoverStyle={{ borderColor: '$primary', transform: [{ translateY: '-4px' }] }}
      style={{ transition: 'transform 180ms ease, border-color 180ms ease' }}
    >
      <YStack gap="$4">
        <YStack
          height={180}
          borderRadius="$4"
          overflow="hidden"
          position="relative"
          backgroundColor="$muted"
        >
          {route.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={route.thumbnailUrl}
              alt={route.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <YStack
              width="100%"
              height="100%"
              justifyContent="center"
              alignItems="center"
              backgroundColor={accent}
            >
              <RouteIcon size={34} color="#ffffff" />
            </YStack>
          )}
          <XStack
            position="absolute"
            top={12}
            left={12}
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$full"
            backgroundColor="rgba(15,23,42,0.72)"
          >
            <Text variant="caption" color="#FFFFFF">
              Official Route
            </Text>
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text variant="heading4" numberOfLines={2}>
            {route.title}
          </Text>
          <Text variant="body" muted numberOfLines={3}>
            {route.description || 'Curated route details will appear here once the API is online.'}
          </Text>
        </YStack>

        <XStack justifyContent="space-between" alignItems="center" gap="$3">
          <XStack alignItems="center" gap="$1.5">
            <Star size={14} color="#FF8C00" fill="#FF8C00" />
            <Text variant="label">{route.averageRating?.toFixed(1) || 'N/A'}</Text>
          </XStack>
          <Text variant="caption" muted>
            {route.routeCount ?? 0} stops
          </Text>
        </XStack>
      </YStack>
    </Card>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const theme = useTheme()
  const [featuredRoutes, setFeaturedRoutes] = useState<FeaturedRoute[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchFeaturedRoutes = async () => {
      try {
        setLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
        const res = await fetch(`${apiUrl}/routes?sort=rating&type=official&pageSize=3`, {
          cache: 'no-store',
        })

        if (!res.ok) return

        const data = await res.json()
        setFeaturedRoutes(data.data || [])
      } catch {
        setFeaturedRoutes([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedRoutes()
  }, [])

  return (
    <Theme name="light">
      <YStack minHeight="100dvh" backgroundColor="$background">
        <YStack
          position="sticky"
          top={0}
          zIndex={20}
          backdropFilter="blur(18px)"
          backgroundColor="rgba(248,249,250,0.88)"
          borderBottomWidth={1}
          borderBottomColor="rgba(15,23,42,0.08)"
        >
          <Container paddingHorizontal="$5" paddingVertical="$3">
            <XStack justifyContent="space-between" alignItems="center" gap="$4">
              <XStack alignItems="center" gap="$3">
                <YStack
                  width={42}
                  height={42}
                  borderRadius="$full"
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor="$primary"
                  style={{ boxShadow: '0 14px 36px -20px rgba(0, 86, 150, 0.75)' }}
                >
                  <Compass size={20} color="#FFFFFF" />
                </YStack>
                <YStack gap="$0.5">
                  <Text variant="heading4" color="$primary">
                    AntAPP
                  </Text>
                  <Text variant="caption" muted>
                    Route planning with actual taste
                  </Text>
                </YStack>
              </XStack>

              <XStack alignItems="center" gap="$2" $sm={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button variant="ghost" size="md" onClick={() => router.push('/login')}>
                  Sign In
                </Button>
                <Button size="md" onClick={() => router.push('/register')}>
                  Sign Up
                </Button>
              </XStack>
            </XStack>
          </Container>
        </YStack>

        <Container paddingHorizontal="$5">
          <XStack
            alignItems="stretch"
            justifyContent="space-between"
            gap="$6"
            paddingVertical="$10"
            $md={{ flexDirection: 'column', paddingVertical: '$7' }}
          >
            <YStack flex={1.1} gap="$5" justifyContent="center">
              <XStack
                alignItems="center"
                gap="$2"
                alignSelf="flex-start"
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius="$full"
                backgroundColor="$primary50"
                borderWidth={1}
                borderColor="$primary200"
              >
                <Sparkles size={14} color={theme.primary} />
                <Text variant="caption" color="$primary" style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
                  City routes, redesigned
                </Text>
              </XStack>

              <YStack gap="$4" maxWidth={680}>
                <Text
                  variant="heading1"
                  color="$color"
                  style={{ fontSize: 'clamp(3rem, 6vw, 5.75rem)', lineHeight: 0.96, letterSpacing: -2.8 }}
                >
                  Build routes that feel curated, not dumped on a map.
                </Text>
                <Text
                  variant="bodyLarge"
                  color="$mutedForeground"
                  style={{ maxWidth: 620, fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', lineHeight: 1.6 }}
                >
                  AntAPP helps travelers, locals, and creators turn scattered places into clean, shareable route experiences with rich stops, ratings, and collections.
                </Text>
              </YStack>

              <XStack gap="$3" flexWrap="wrap">
                <Button
                  size="lg"
                  onClick={() => router.push('/register')}
                  icon={<ArrowRight size={16} color="#FFFFFF" />}
                  borderRadius="$4"
                >
                  Start Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/search')}
                  icon={<MapPin size={16} color={theme.primary} />}
                  borderRadius="$4"
                >
                  Explore Routes
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  icon={<Download size={16} color={theme.primary} />}
                  borderRadius="$4"
                >
                  Mobile App
                </Button>
              </XStack>

              <XStack gap="$3" flexWrap="wrap">
                <HeroMetric value="3 panels" label="User, business, admin surfaces" />
                <HeroMetric value="Collections" label="Save, fork, and organize routes" />
                <HeroMetric value="Shared UI" label="Single design system across web and mobile" />
              </XStack>
            </YStack>

            <YStack flex={0.9} position="relative" minHeight={520} $md={{ minHeight: 420 }}>
              <Card
                size="lg"
                backgroundColor="linear-gradient(135deg, $primary 0%, $primaryDeep 52%, #06243D 100%)"
                borderWidth={0}
                style={{ minHeight: '100%', boxShadow: '0 36px 80px -32px rgba(4, 23, 43, 0.42)' }}
              >
                <YStack height="100%" justifyContent="space-between" gap="$5">
                  <YStack gap="$3">
                    <XStack justifyContent="space-between" alignItems="center">
                      <XStack alignItems="center" gap="$2">
                        <ShieldCheck size={18} color="#FFFFFF" />
                        <Text variant="label" color="#FFFFFF">
                          Official Route Stack
                        </Text>
                      </XStack>
                      <XStack
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                        borderRadius="$full"
                        backgroundColor="rgba(255,255,255,0.14)"
                      >
                        <Text variant="caption" color="#FFFFFF">
                          Live-ready
                        </Text>
                      </XStack>
                    </XStack>

                    <Text variant="heading2" color="#FFFFFF" style={{ lineHeight: 1.02 }}>
                      Route discovery, stop curation, and community signals in one clean surface.
                    </Text>
                    <Text variant="body" color="rgba(255,255,255,0.78)" style={{ lineHeight: 1.6 }}>
                      No generic cards-on-white. The product should feel like a deliberate route platform from the first screen.
                    </Text>
                  </YStack>

                  <YStack
                    gap="$3"
                    padding="$4"
                    borderRadius="$5"
                    backgroundColor="rgba(255,255,255,0.08)"
                    borderWidth={1}
                    borderColor="rgba(255,255,255,0.12)"
                  >
                    {[
                      ['Kaleici Night Walk', '4 stops', '#FF8C00'],
                      ['Coastal Coffee Loop', '6 stops', '#00CEC9'],
                      ['Old Town Highlights', '5 stops', '#8BC0DA'],
                    ].map(([title, meta, color]) => (
                      <XStack
                        key={title}
                        alignItems="center"
                        justifyContent="space-between"
                        gap="$3"
                        padding="$3"
                        borderRadius="$4"
                        backgroundColor="rgba(255,255,255,0.08)"
                      >
                        <XStack alignItems="center" gap="$3" flex={1}>
                          <YStack width={12} height={12} borderRadius="$full" backgroundColor={color} />
                          <YStack gap="$0.5" flex={1}>
                            <Text variant="label" color="#FFFFFF">
                              {title}
                            </Text>
                            <Text variant="caption" color="rgba(255,255,255,0.68)">
                              {meta}
                            </Text>
                          </YStack>
                        </XStack>
                        <Star size={14} color="#FFD27A" fill="#FFD27A" />
                      </XStack>
                    ))}
                  </YStack>
                </YStack>
              </Card>

              <Card
                size="md"
                backgroundColor="$backgroundStrong"
                borderWidth={1}
                borderColor="$borderColor"
                position="absolute"
                bottom={24}
                left={-28}
                width={240}
                $md={{ position: 'relative', bottom: 'auto', left: 'auto', width: '100%', marginTop: '$4' }}
                style={{ boxShadow: '0 24px 54px -30px rgba(15, 23, 42, 0.28)' }}
              >
                <YStack gap="$3">
                  <Text variant="caption" color="$primary" style={{ letterSpacing: 1.1, textTransform: 'uppercase' }}>
                    Community Snapshot
                  </Text>
                  <Text variant="heading4">92% of saved routes are revisited within the first week.</Text>
                  <XStack alignItems="center" gap="$2">
                    <Users size={16} color={theme.primary} />
                    <Text variant="caption" muted>
                      Social proof and collections matter.
                    </Text>
                  </XStack>
                </YStack>
              </Card>
            </YStack>
          </XStack>
        </Container>

        <YStack backgroundColor="$backgroundStrong" borderTopWidth={1} borderTopColor="$borderColor">
          <Container paddingHorizontal="$5" paddingVertical="$8">
            <YStack gap="$5">
              <YStack gap="$2" maxWidth={720}>
                <Text variant="caption" color="$primary" style={{ letterSpacing: 1.2, textTransform: 'uppercase' }}>
                  Featured routes
                </Text>
                <Text variant="heading2">Curated starting points for the platform.</Text>
                <Text variant="body" muted>
                  When the API is available, this area pulls top-rated official routes directly from the backend.
                </Text>
              </YStack>

              {loading ? (
                <Text variant="body" muted>
                  Loading routes...
                </Text>
              ) : featuredRoutes.length === 0 ? (
                <XStack gap="$4" flexWrap="wrap">
                  {[
                    { title: 'Harbor Morning Loop', description: 'Coastal viewpoints, coffee stops, and a short historic detour.', averageRating: 4.8 },
                    { title: 'Museum Quarter Walk', description: 'A calmer urban route for gallery hopping and late lunch breaks.', averageRating: 4.7 },
                    { title: 'Sunset Cliff Route', description: 'A dramatic golden-hour path with official highlights and photo stops.', averageRating: 4.9 },
                  ].map((route, index) => (
                    <FeaturedRouteCard
                      key={route.title}
                      route={{ id: `placeholder-${index}`, ...route }}
                      accent={index === 0 ? theme.primary : index === 1 ? '#FF8C00' : '#00CEC9'}
                      onOpen={() => router.push('/search')}
                    />
                  ))}
                </XStack>
              ) : (
                <XStack gap="$4" flexWrap="wrap">
                  {featuredRoutes.map((route, index) => (
                    <FeaturedRouteCard
                      key={route.id}
                      route={route}
                      accent={index === 0 ? theme.primary : index === 1 ? '#FF8C00' : '#00CEC9'}
                      onOpen={() => router.push(`/routes/${route.id}`)}
                    />
                  ))}
                </XStack>
              )}
            </YStack>
          </Container>
        </YStack>

        <Container paddingHorizontal="$5" paddingVertical="$8">
          <YStack gap="$5">
            <YStack gap="$2" maxWidth={760}>
              <Text variant="caption" color="$primary" style={{ letterSpacing: 1.2, textTransform: 'uppercase' }}>
                Why it works
              </Text>
              <Text variant="heading2">A route product should feel structured, not improvised.</Text>
            </YStack>

            <XStack gap="$4" flexWrap="wrap">
              <FeatureCard
                eyebrow="Discovery"
                icon={<MapPin size={24} color={theme.primary} />}
                title="Map-first exploration"
                description="Users can move from route list to map context without losing the narrative of the trip."
              />
              <FeatureCard
                eyebrow="Collections"
                icon={<Star size={24} color="#FF8C00" fill="#FF8C00" />}
                title="Favorites that stay useful"
                description="Saved routes and stops are not dead bookmarks. They stay editable, forkable, and sharable."
              />
              <FeatureCard
                eyebrow="Cross-platform"
                icon={<Users size={24} color="#00A9A5" />}
                title="One product language"
                description="The same Ant UI primitives now drive both web and mobile, so behavior and tone stay aligned."
              />
            </XStack>
          </YStack>
        </Container>

        <YStack backgroundColor="$muted">
          <Container paddingHorizontal="$5" paddingVertical="$7">
            <XStack
              justifyContent="space-between"
              alignItems="center"
              gap="$4"
              $md={{ flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <YStack gap="$2" maxWidth={620}>
                <Text variant="heading3">Ready to turn routes into a real product experience?</Text>
                <Text variant="body" muted>
                  Sign up, build your first route, and start shaping stops, collections, and ratings into something worth sharing.
                </Text>
              </YStack>
              <XStack gap="$2" flexWrap="wrap">
                <Button size="lg" onClick={() => router.push('/register')}>
                  Create Account
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
                  Existing User
                </Button>
              </XStack>
            </XStack>
          </Container>
        </YStack>
      </YStack>
    </Theme>
  )
}
