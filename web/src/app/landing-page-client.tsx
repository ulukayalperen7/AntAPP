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

function HeroAnimationStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes ant-float-y { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
      @keyframes ant-float-y-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-18px) } }
      @keyframes ant-pulse-ring {
        0%   { transform: scale(0.6); opacity: 0.9; }
        100% { transform: scale(2.4); opacity: 0; }
      }
      @keyframes ant-dash {
        from { stroke-dashoffset: 600; }
        to   { stroke-dashoffset: 0; }
      }
      @keyframes ant-blob-drift {
        0%   { transform: translate(0, 0) scale(1); }
        50%  { transform: translate(30px, -20px) scale(1.08); }
        100% { transform: translate(0, 0) scale(1); }
      }
      @keyframes ant-fade-up {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes ant-spin-slow { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      .ant-fade-up { animation: ant-fade-up 700ms ease-out both; }
      .ant-float { animation: ant-float-y 4s ease-in-out infinite; }
      .ant-float-slow { animation: ant-float-y-slow 6s ease-in-out infinite; }
      .ant-blob { animation: ant-blob-drift 14s ease-in-out infinite; }
      .ant-spin-slow { animation: ant-spin-slow 30s linear infinite; }
      .ant-ping {
        position: absolute; border-radius: 9999px; background: rgba(234,88,12,0.45);
        animation: ant-pulse-ring 2.2s ease-out infinite;
      }
      .ant-route-path {
        fill: none; stroke: #EA580C; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round;
        stroke-dasharray: 600; stroke-dashoffset: 600;
        animation: ant-dash 3.5s ease-out forwards, ant-dash 6s ease-in-out 4s infinite alternate;
        filter: drop-shadow(0 2px 6px rgba(234,88,12,0.35));
      }
    ` }} />
  )
}

function HeroVisual({ featuredRoutes }: { featuredRoutes: FeaturedRoute[] }) {
  const top = featuredRoutes[0]
  return (
    <YStack width="100%" height="100%" position="relative" alignItems="center" justifyContent="center">
      <HeroAnimationStyles />

      {/* decorative orbital ring */}
      <YStack
        position="absolute"
        width={520}
        height={520}
        borderRadius={9999}
        borderWidth={1}
        borderColor="rgba(234,88,12,0.12)"
        className="ant-spin-slow"
        pointerEvents="none"
      />
      <YStack
        position="absolute"
        width={420}
        height={420}
        borderRadius={9999}
        borderWidth={1}
        borderColor="rgba(234,88,12,0.18)"
        pointerEvents="none"
      />

      {/* Phone mockup */}
      <YStack
        width={300}
        height={560}
        borderRadius={44}
        backgroundColor="#0F172A"
        padding={10}
        position="relative"
        className="ant-float-slow"
        shadowColor="rgba(15,23,42,0.35)"
        shadowOffset={{ width: 0, height: 30 }}
        shadowRadius={60}
      >
        {/* notch */}
        <YStack
          position="absolute"
          top={14}
          left="50%"
          width={120}
          height={26}
          borderRadius={14}
          backgroundColor="#0F172A"
          zIndex={3}
          {...({ style: { transform: 'translateX(-50%)' } } as any)}
        />
        <YStack
          flex={1}
          borderRadius={36}
          overflow="hidden"
          position="relative"
          {...({ style: {
            background: 'linear-gradient(160deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)'
          } } as any)}
        >
          {/* faux map grid */}
          <svg width="100%" height="100%" viewBox="0 0 280 540" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(234,88,12,0.10)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="280" height="540" fill="url(#grid)" />
            {/* faux roads */}
            <path d="M -10 380 Q 100 320, 180 360 T 320 300" stroke="rgba(234,88,12,0.15)" strokeWidth="22" fill="none" strokeLinecap="round" />
            <path d="M 30 -10 Q 60 120, 150 180 T 260 380" stroke="rgba(234,88,12,0.10)" strokeWidth="16" fill="none" strokeLinecap="round" />
            {/* animated route */}
            <path className="ant-route-path" d="M 40 460 Q 90 360, 150 320 T 220 180 Q 240 130, 200 80" />
            {/* waypoints */}
            <circle cx="40" cy="460" r="7" fill="#EA580C" />
            <circle cx="40" cy="460" r="3" fill="#fff" />
            <circle cx="200" cy="80" r="9" fill="#EA580C" />
            <circle cx="200" cy="80" r="4" fill="#fff" />
          </svg>

          {/* pulsing pings */}
          <YStack position="absolute" left={130} top={280} width={16} height={16}>
            <YStack className="ant-ping" width={16} height={16} />
            <YStack
              width={12}
              height={12}
              borderRadius={9999}
              backgroundColor="#EA580C"
              borderWidth={2}
              borderColor="white"
              position="absolute"
              top={2}
              left={2}
            />
          </YStack>
          <YStack position="absolute" left={70} top={150} width={14} height={14}>
            <YStack className="ant-ping" width={14} height={14} {...({ style: { animationDelay: '0.6s' } } as any)} />
            <YStack
              width={10}
              height={10}
              borderRadius={9999}
              backgroundColor="#EA580C"
              borderWidth={2}
              borderColor="white"
              position="absolute"
              top={2}
              left={2}
            />
          </YStack>

          {/* top status bar */}
          <XStack
            position="absolute"
            top={16}
            left={16}
            right={16}
            alignItems="center"
            justifyContent="space-between"
            zIndex={2}
          >
            <YStack
              backgroundColor="rgba(255,255,255,0.92)"
              paddingHorizontal={10}
              paddingVertical={6}
              borderRadius={999}
              shadowColor="rgba(0,0,0,0.08)"
              shadowOffset={{ width: 0, height: 4 }}
              shadowRadius={10}
            >
              <XStack gap="$1.5" alignItems="center">
                <MapPin size={12} color="#EA580C" />
                <Text fontSize={11} fontWeight="700" color="$gray900">Live route</Text>
              </XStack>
            </YStack>
            <YStack
              backgroundColor="rgba(255,255,255,0.92)"
              paddingHorizontal={10}
              paddingVertical={6}
              borderRadius={999}
            >
              <Text fontSize={11} fontWeight="700" color="$primary">2.4 km</Text>
            </YStack>
          </XStack>

          {/* bottom info card */}
          <YStack
            position="absolute"
            left={14}
            right={14}
            bottom={16}
            backgroundColor="white"
            borderRadius={18}
            padding={14}
            zIndex={2}
            shadowColor="rgba(0,0,0,0.12)"
            shadowOffset={{ width: 0, height: 10 }}
            shadowRadius={24}
          >
            <XStack gap="$3" alignItems="center">
              <YStack
                width={42}
                height={42}
                borderRadius={12}
                alignItems="center"
                justifyContent="center"
                {...({ style: { background: 'linear-gradient(135deg,#FB923C,#EA580C)' } } as any)}
              >
                <Star size={20} color="white" fill="white" />
              </YStack>
              <YStack flex={1}>
                <Text fontSize={13} fontWeight="700" color="$gray900" numberOfLines={1}>
                  {top?.title ?? 'Sunset Trail'}
                </Text>
                <Text fontSize={11} color="$mutedForeground" numberOfLines={1}>
                  {top?.contentType ?? 'Community'} • 18 min walk
                </Text>
              </YStack>
              <YStack
                paddingHorizontal={8}
                paddingVertical={4}
                borderRadius={999}
                backgroundColor="$ant100"
              >
                <Text fontSize={11} fontWeight="700" color="$primary">4.8★</Text>
              </YStack>
            </XStack>
          </YStack>
        </YStack>
      </YStack>

      {/* Floating side cards */}
      <YStack
        position="absolute"
        top={40}
        left={0}
        backgroundColor="white"
        borderRadius={16}
        padding={12}
        shadowColor="rgba(15,23,42,0.18)"
        shadowOffset={{ width: 0, height: 14 }}
        shadowRadius={32}
        className="ant-float"
        $sm={{ display: 'none' as any }}
      >
        <XStack gap="$2.5" alignItems="center">
          <YStack
            width={36}
            height={36}
            borderRadius={10}
            backgroundColor="$ant100"
            alignItems="center"
            justifyContent="center"
          >
            <Users size={18} color="#EA580C" />
          </YStack>
          <YStack>
            <Text fontSize={11} color="$mutedForeground">Active now</Text>
            <Text fontSize={14} fontWeight="800" color="$gray900">+1,284 explorers</Text>
          </YStack>
        </XStack>
      </YStack>

      <YStack
        position="absolute"
        bottom={60}
        right={0}
        backgroundColor="white"
        borderRadius={16}
        padding={12}
        shadowColor="rgba(15,23,42,0.18)"
        shadowOffset={{ width: 0, height: 14 }}
        shadowRadius={32}
        className="ant-float-slow"
        {...({ style: { animationDelay: '1.2s' } } as any)}
        $sm={{ display: 'none' as any }}
      >
        <XStack gap="$2.5" alignItems="center">
          <YStack
            width={36}
            height={36}
            borderRadius={10}
            backgroundColor="$ant100"
            alignItems="center"
            justifyContent="center"
          >
            <Zap size={18} color="#EA580C" />
          </YStack>
          <YStack>
            <Text fontSize={11} color="$mutedForeground">Just discovered</Text>
            <Text fontSize={14} fontWeight="800" color="$gray900">Hidden Bazaar Walk</Text>
          </YStack>
        </XStack>
      </YStack>
    </YStack>
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
          {...({ style: { backdropFilter: 'blur(12px)' } } as any)}
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
                variant="ghost"
                size="sm"
                icon={<LogIn size={16} />}
                onPress={() => router.push('/login')}
              >
                Sign In
              </Button>
              <Button
                variant="solid"
                size="sm"
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
            className="ant-blob"
            {...({
              style: {
                background:
                  'radial-gradient(closest-side, rgba(255,247,237,1) 0%, rgba(255,237,213,0.7) 40%, rgba(255,237,213,0) 75%)',
              },
            } as any)}
          />
          {/* Bottom-left blob for balance */}
          <YStack
            position="absolute"
            bottom={-220}
            left={-220}
            width={620}
            height={620}
            pointerEvents="none"
            className="ant-blob"
            {...({
              style: {
                animationDelay: '4s',
                background:
                  'radial-gradient(closest-side, rgba(255,237,213,0.85) 0%, rgba(255,237,213,0.45) 40%, rgba(255,237,213,0) 75%)',
              },
            } as any)}
          />
          {/* Drifting micro dots */}
          <YStack
            position="absolute"
            top={120}
            left="42%"
            width={10}
            height={10}
            borderRadius={9999}
            backgroundColor="$ant200"
            pointerEvents="none"
            className="ant-float-slow"
          />
          <YStack
            position="absolute"
            top={300}
            left="36%"
            width={6}
            height={6}
            borderRadius={9999}
            backgroundColor="$ant300"
            pointerEvents="none"
            className="ant-float"
            {...({ style: { animationDelay: '1.5s' } } as any)}
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
                  height={52}
                  paddingHorizontal={28}
                  backgroundColor="$primary"
                  color="white"
                  fontSize={16}
                  fontWeight="700"
                  hoverStyle={{ backgroundColor: '$primaryHover', scale: 1.03 }}
                  pressStyle={{ scale: 0.97 }}
                  borderRadius={999}
                  shadowColor="rgba(234,88,12,0.35)"
                  shadowOffset={{ width: 0, height: 8 }}
                  shadowRadius={20}
                  {...({ style: { transition: 'all 200ms ease' } } as any)}
                  onPress={() => router.push('/register')}
                >
                  Start Exploring Free
                </Button>
                <Button
                  height={52}
                  paddingHorizontal={28}
                  backgroundColor="$card"
                  color="$primary"
                  fontSize={16}
                  fontWeight="700"
                  borderColor="$primary"
                  borderWidth={1.5}
                  hoverStyle={{ backgroundColor: '$ant50', scale: 1.03 }}
                  pressStyle={{ scale: 0.97 }}
                  borderRadius={999}
                  {...({ style: { transition: 'all 200ms ease' } } as any)}
                  icon={<Download size={18} />}
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

            {/* Right column — animated phone mockup + floating elements */}
            <YStack flex={1} minWidth={320} height={560} position="relative" alignItems="center" justifyContent="center">
              <HeroVisual featuredRoutes={featuredRoutes} />
            </YStack>
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
            <XStack gap="$3" flexWrap="wrap" justifyContent="center" marginTop="$4">
              <Button
                height={52}
                paddingHorizontal={28}
                backgroundColor="white"
                color="$primary"
                fontSize={16}
                fontWeight="700"
                hoverStyle={{ backgroundColor: '$ant50', scale: 1.03 }}
                pressStyle={{ scale: 0.97 }}
                borderRadius={999}
                shadowColor="rgba(0,0,0,0.18)"
                shadowOffset={{ width: 0, height: 8 }}
                shadowRadius={20}
                {...({ style: { transition: 'all 200ms ease' } } as any)}
                onPress={() => router.push('/register')}
              >
                Sign Up Free
              </Button>
              <Button
                height={52}
                paddingHorizontal={28}
                backgroundColor="transparent"
                color="white"
                fontSize={16}
                fontWeight="700"
                borderColor="rgba(255,255,255,0.7)"
                borderWidth={1.5}
                hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'white', scale: 1.03 }}
                pressStyle={{ scale: 0.97 }}
                borderRadius={999}
                {...({ style: { transition: 'all 200ms ease' } } as any)}
                icon={<Download size={18} />}
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
            <Text fontSize={14} color="$mutedForeground">© 2026 AntAPP. Made for explorers.</Text>
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
