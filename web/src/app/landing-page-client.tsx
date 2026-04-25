'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Card, Theme, Image } from '@antapp/ui'
import { MapPin, Download, LogIn, Star, Users, Zap } from 'lucide-react'
import type { RouteListItem } from '@/types/api'

type FeaturedRoute = RouteListItem

/* ---------- Small helpers ---------- */

function AntGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <g fill="none" stroke="#EA580C" strokeWidth={1.6} strokeLinecap="round">
        <path d="M9 7 Q 7 4 5 4" />
        <path d="M11 7 Q 11 4 13 3" />
        <path d="M14 14 L 7 11" />
        <path d="M14 17 L 6 18" />
        <path d="M19 17 L 26 18" />
        <path d="M19 14 L 26 11" />
        <path d="M14 20 L 8 24" />
        <path d="M19 20 L 25 24" />
      </g>
      <circle cx="11" cy="10" r="3.4" fill="#EA580C" />
      <circle cx="16.5" cy="16" r="4" fill="#EA580C" />
      <circle cx="22.5" cy="22" r="4.4" fill="#EA580C" />
    </svg>
  )
}

function StatItem({ num, label }: { num: string; label: string }) {
  return (
    <YStack alignItems="center" gap="$2" flex={1} minWidth={140}>
      <Text fontSize={44} fontWeight="800" color="$primary" letterSpacing={-1} lineHeight={44}>
        {num}
      </Text>
      <Text color="$mutedForeground" fontSize={14} fontWeight="500">
        {label}
      </Text>
    </YStack>
  )
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card
      flex={1}
      minWidth={280}
      padding="$7"
      backgroundColor="$ant50"
      borderColor="$ant100"
      borderWidth={1}
      borderRadius="$4"
      {...({ animation: 'quick' } as any)}
    >
      <YStack
        width={48}
        height={48}
        backgroundColor="$ant100"
        borderRadius={12}
        alignItems="center"
        justifyContent="center"
        marginBottom="$5"
      >
        {icon}
      </YStack>
      <Text fontSize={19} fontWeight="700" color="$gray900" marginBottom="$2">
        {title}
      </Text>
      <Text color="$mutedForeground" fontSize={15} lineHeight={22}>
        {body}
      </Text>
    </Card>
  )
}

function RouteCard({ route, onPress }: { route: FeaturedRoute; onPress?: () => void }) {
  return (
    <Card
      flex={1}
      minWidth={280}
      backgroundColor="$card"
      borderRadius="$4"
      overflow="hidden"
      borderWidth={1}
      borderColor="rgba(229,231,235,0.6)"
      shadowColor="rgba(17,24,39,0.08)"
      shadowOffset={{ width: 0, height: 6 }}
      shadowRadius={16}
      cursor="pointer"
      {...({ animation: 'quick' } as any)}
      onPress={onPress}
    >
      <YStack height={180} backgroundColor="$ant50" position="relative" overflow="hidden">
        {route.thumbnailUrl ? (
          <Image
            source={{ uri: route.thumbnailUrl }}
            width="100%"
            height="100%"
            resizeMode="cover"
          />
        ) : null}
        <XStack
          position="absolute"
          bottom={12}
          left={12}
          backgroundColor="rgba(255,255,255,0.92)"
          paddingHorizontal={10}
          paddingVertical={5}
          borderRadius="$10"
          alignItems="center"
          gap="$2"
        >
          <MapPin size={12} color="#EA580C" />
          <Text fontSize={12} fontWeight="600" color="$gray900">
            {route.contentType}
          </Text>
        </XStack>
      </YStack>

      <YStack padding="$4" gap="$2">
        <Text fontSize={17} fontWeight="700" color="$gray900" numberOfLines={2}>
          {route.title}
        </Text>
        {route.description && (
          <Text fontSize={13} color="$mutedForeground" numberOfLines={2}>
            {route.description}
          </Text>
        )}
        {route.averageRating != null && route.averageRating > 0 && (
          <XStack alignItems="center" gap="$1" marginTop="$1">
            <Star size={13} color="#EA580C" fill="#EA580C" />
            <Text fontSize={13} fontWeight="600" color="$gray700">
              {route.averageRating.toFixed(1)}
            </Text>
          </XStack>
        )}
      </YStack>
    </Card>
  )
}

/* ---------- Main component ---------- */

export function LandingPageClient({ featuredRoutes }: { featuredRoutes: FeaturedRoute[] }) {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Theme name="light">
      <YStack backgroundColor="$card" minHeight="100vh">
        {/* ============ NAV ============ */}
        <XStack
          position="sticky"
          top={0}
          zIndex={50}
          backgroundColor="rgba(249,250,251,0.85)"
          borderBottomWidth={1}
          borderBottomColor={scrolled ? '$ant200' : 'transparent'}
          paddingHorizontal="$6"
          height={scrolled ? 60 : 72}
          alignItems="center"
          justifyContent="center"
          {...({ animation: 'quick', style: { backdropFilter: 'blur(12px)' } } as any)}
        >
          <XStack width="100%" maxWidth={1200} alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$2.5" cursor="pointer" onPress={() => router.push('/')}>
              <YStack
                width={32}
                height={32}
                backgroundColor="$ant100"
                borderRadius={10}
                alignItems="center"
                justifyContent="center"
              >
                <AntGlyph size={20} />
              </YStack>
              <Text fontSize={19} fontWeight="800" color="$primary" letterSpacing={-0.4}>
                AntAPP
              </Text>
            </XStack>

            <XStack alignItems="center" gap="$2">
              <Button
                {...({ size: '$3', chromeless: true } as any)}
                icon={<LogIn size={16} />}
                onPress={() => router.push('/login')}
              >
                Sign In
              </Button>
              <Button
                {...({ size: '$3' } as any)}
                backgroundColor="$primary"
                color="white"
                hoverStyle={{ backgroundColor: '$primaryHover' }}
                borderRadius="$10"
                onPress={() => router.push('/register')}
              >
                Get Started
              </Button>
            </XStack>
          </XStack>
        </XStack>

        {/* ============ HERO ============ */}
        <YStack
          minHeight="100vh"
          backgroundColor="$card"
          paddingHorizontal="$6"
          paddingVertical="$16"
          alignItems="center"
          position="relative"
          overflow="hidden"
        >
          {/* Faint orange blob top-right */}
          <YStack
            position="absolute"
            top={-260}
            right={-260}
            width={820}
            height={820}
            pointerEvents="none"
            {...({
              style: {
                background:
                  'radial-gradient(closest-side, rgba(255,247,237,1) 0%, rgba(255,237,213,0.7) 40%, rgba(255,237,213,0) 75%)',
              },
            } as any)}
          />

          <XStack
            width="100%"
            maxWidth={1200}
            gap="$16"
            alignItems="center"
            flexWrap="wrap"
            zIndex={1}
          >
            {/* Left column */}
            <YStack flex={1} minWidth={320} gap="$5">
              <XStack
                alignSelf="flex-start"
                backgroundColor="$ant100"
                paddingHorizontal={14}
                paddingVertical={6}
                borderRadius="$10"
              >
                <Text fontSize={13} fontWeight="600" color="$primary">
                  🐜 Discover Your City
                </Text>
              </XStack>

              <Text
                fontSize={64}
                fontWeight="800"
                color="$gray900"
                letterSpacing={-2}
                lineHeight={68}
                $sm={{ fontSize: 44, lineHeight: 48 }}
              >
                Explore <Text color="$primary">Hidden Gems</Text>.{'\n'}Share Your Routes.
              </Text>

              <Text fontSize={18} color="$mutedForeground" maxWidth={540} lineHeight={28}>
                AntAPP helps you discover, create, and share the best local routes —
                from hidden cafes to scenic trails.
              </Text>

              <XStack gap="$3" flexWrap="wrap">
                <Button
                  {...({ size: '$5' } as any)}
                  backgroundColor="$primary"
                  color="white"
                  hoverStyle={{ backgroundColor: '$primaryHover' }}
                  borderRadius="$10"
                  onPress={() => router.push('/register')}
                >
                  Start Exploring Free
                </Button>
                <Button
                  {...({ size: '$5' } as any)}
                  backgroundColor="$card"
                  color="$primary"
                  borderColor="$primary"
                  borderWidth={1.5}
                  hoverStyle={{ backgroundColor: '$ant50' }}
                  borderRadius="$10"
                  icon={<Download size={16} />}
                >
                  Download the App
                </Button>
              </XStack>

              {/* Trust bar */}
              <XStack gap="$4" alignItems="center" flexWrap="wrap" marginTop="$4">
                <XStack gap="$1.5" alignItems="center">
                  <MapPin size={14} color="#EA580C" />
                  <Text fontSize={14} color="$mutedForeground">10K+ Routes</Text>
                </XStack>
                <YStack width={4} height={4} borderRadius={2} backgroundColor="$gray300" />
                <XStack gap="$1.5" alignItems="center">
                  <Zap size={14} color="#EA580C" />
                  <Text fontSize={14} color="$mutedForeground">Free Forever</Text>
                </XStack>
                <YStack width={4} height={4} borderRadius={2} backgroundColor="$gray300" />
                <Text fontSize={14} color="$mutedForeground">iOS & Android</Text>
              </XStack>
            </YStack>

            {/* Right column — overlapping card stack */}
            <YStack flex={1} minWidth={320} height={480} position="relative">
              {featuredRoutes.slice(0, 3).map((r, i) => {
                const placements = [
                  { top: 24,  left: 0,   rotate: '-6deg', z: 1 },
                  { top: 90,  left: 110, rotate: '2deg',  z: 3 },
                  { top: 220, left: 30,  rotate: '-2deg', z: 2 },
                ]
                const p = placements[i]
                return (
                  <YStack
                    key={r.id}
                    position="absolute"
                    top={p.top}
                    left={p.left}
                    width={320}
                    zIndex={p.z}
                    {...({ style: { transform: `rotate(${p.rotate})` } } as any)}
                  >
                    <RouteCard route={r} />
                  </YStack>
                )
              })}
            </YStack>
          </XStack>
        </YStack>

        {/* ============ STATS ============ */}
        <YStack backgroundColor="$ant50" paddingVertical="$12" paddingHorizontal="$6">
          <XStack
            width="100%"
            maxWidth={1200}
            marginHorizontal="auto"
            gap="$8"
            flexWrap="wrap"
            justifyContent="space-between"
          >
            <StatItem num="10,000+" label="Routes Mapped" />
            <StatItem num="50K+"    label="Active Explorers" />
            <StatItem num="4.8★"    label="Average Rating" />
            <StatItem num="120+"    label="Cities Covered" />
          </XStack>
        </YStack>

        {/* ============ FEATURED ROUTES ============ */}
        <YStack paddingVertical="$16" paddingHorizontal="$6">
          <YStack width="100%" maxWidth={1200} marginHorizontal="auto" gap="$10">
            <YStack gap="$2">
              <Text
                color="$primary"
                fontSize={14}
                fontWeight="600"
                letterSpacing={1}
                textTransform="uppercase"
              >
                Hand-picked
              </Text>
              <YStack gap="$3" alignItems="flex-start">
                <Text fontSize={44} fontWeight="800" color="$gray900" letterSpacing={-1.4}>
                  Curated Routes
                </Text>
                <YStack width={56} height={3} backgroundColor="$primary" borderRadius={3} />
              </YStack>
              <Text fontSize={17} color="$mutedForeground" maxWidth={560} marginTop="$3">
                Routes from local explorers — paths that don't show up on tourist maps, but should.
              </Text>
            </YStack>

            {featuredRoutes.length === 0 ? (
              <Text textAlign="center" color="$mutedForeground">No routes available yet.</Text>
            ) : (
              <XStack flexWrap="wrap" gap="$8" alignItems="stretch">
                {featuredRoutes.map((r) => (
                  <RouteCard key={r.id} route={r} onPress={() => router.push(`/routes/${r.id}`)} />
                ))}
              </XStack>
            )}
          </YStack>
        </YStack>

        {/* ============ FEATURES ============ */}
        <YStack backgroundColor="$background" paddingVertical="$16" paddingHorizontal="$6">
          <YStack width="100%" maxWidth={1200} marginHorizontal="auto" gap="$10">
            <YStack gap="$3" alignItems="flex-start">
              <Text
                color="$primary"
                fontSize={14}
                fontWeight="600"
                letterSpacing={1}
                textTransform="uppercase"
              >
                Why AntAPP?
              </Text>
              <Text fontSize={44} fontWeight="800" color="$gray900" letterSpacing={-1.4}>
                Built for explorers
              </Text>
              <YStack width={56} height={3} backgroundColor="$primary" borderRadius={3} />
            </YStack>

            <XStack flexWrap="wrap" gap="$6">
              <FeatureCard
                icon={<MapPin size={22} color="#EA580C" />}
                title="Discover Hidden Spots"
                body="Find routes hand-picked by locals — coffee streets, alley markets, and trails you'd never spot on a map."
              />
              <FeatureCard
                icon={<Users size={22} color="#EA580C" />}
                title="Share with Your Crew"
                body="Build routes, drop pins, and share them with friends. Every walk becomes a story worth retelling."
              />
              <FeatureCard
                icon={<Zap size={22} color="#EA580C" />}
                title="Offline-Ready"
                body="Save routes to your phone — they work without signal. Walk freely, explore confidently, no data needed."
              />
            </XStack>
          </YStack>
        </YStack>

        {/* ============ CTA BANNER ============ */}
        <YStack
          backgroundColor="$primary"
          paddingVertical="$20"
          paddingHorizontal="$6"
          position="relative"
          overflow="hidden"
        >
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            pointerEvents="none"
            {...({
              style: {
                backgroundImage:
                  'repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.13) 0 1.5px, transparent 1.5px 28px)',
                opacity: 0.7,
              },
            } as any)}
          />
          <YStack
            width="100%"
            maxWidth={900}
            marginHorizontal="auto"
            alignItems="center"
            gap="$5"
            zIndex={1}
          >
            <Text
              fontSize={56}
              fontWeight="800"
              color="white"
              letterSpacing={-2}
              textAlign="center"
              lineHeight={60}
              $sm={{ fontSize: 36, lineHeight: 40 }}
            >
              Ready to Explore Your City?
            </Text>
            <Text fontSize={18} color="white" opacity={0.92} textAlign="center">
              Join thousands of adventurers. Free forever.
            </Text>
            <XStack gap="$3" flexWrap="wrap" justifyContent="center">
              <Button
                {...({ size: '$5' } as any)}
                backgroundColor="white"
                color="$primary"
                hoverStyle={{ backgroundColor: '$ant50' }}
                borderRadius="$10"
                onPress={() => router.push('/register')}
              >
                Sign Up Free
              </Button>
              <Button
                {...({ size: '$5' } as any)}
                backgroundColor="transparent"
                color="white"
                borderColor="rgba(255,255,255,0.7)"
                borderWidth={1.5}
                hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'white' }}
                borderRadius="$10"
                icon={<Download size={16} />}
              >
                Download App
              </Button>
            </XStack>
          </YStack>
        </YStack>

        {/* ============ FOOTER ============ */}
        <YStack
          backgroundColor="$card"
          borderTopWidth={1}
          borderTopColor="$borderColor"
          paddingVertical="$5"
          paddingHorizontal="$6"
        >
          <XStack
            width="100%"
            maxWidth={1200}
            marginHorizontal="auto"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap="$3"
          >
            <XStack alignItems="center" gap="$2">
              <YStack
                width={26}
                height={26}
                backgroundColor="$ant100"
                borderRadius={8}
                alignItems="center"
                justifyContent="center"
              >
                <AntGlyph size={16} />
              </YStack>
              <Text fontSize={15} fontWeight="800" color="$primary">AntAPP</Text>
            </XStack>
            <Text fontSize={14} color="$mutedForeground">© 2025 AntAPP. Made for explorers.</Text>
            <XStack gap="$3">
              <Text fontSize={14} color="$mutedForeground" cursor="pointer" hoverStyle={{ color: '$primary' }}>
                Privacy
              </Text>
              <Text fontSize={14} color="$mutedForeground">•</Text>
              <Text fontSize={14} color="$mutedForeground" cursor="pointer" hoverStyle={{ color: '$primary' }}>
                Terms
              </Text>
            </XStack>
          </XStack>
        </YStack>
      </YStack>
    </Theme>
  )
}
