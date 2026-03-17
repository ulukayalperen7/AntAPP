import React from 'react'
import {
  Button,
  Card,
  HStack,
  Text,
  Theme,
  VStack,
  XStack,
  YStack,
  ZStack,
  isWeb,
} from '@antapp/ui'

const AUTH_PALETTE = {
  primary: '#005696',
  primaryDeep: '#0A3C63',
  primarySoft: '#D9EAF6',
  secondary: '#FF8C00',
  secondarySoft: '#FFE2BF',
  tertiary: '#00CEC9',
  tertiarySoft: '#BFF5F3',
  neutral: '#F8F9FA',
  neutralStrong: '#FFFFFF',
  neutralSoft: '#EEF3F6',
} as const

type AuthShellProps = {
  title: string
  subtitle: string
  panelTitle: string
  panelDescription: string
  panelPosition?: 'left' | 'right'
  footer?: React.ReactNode
  mascot?: React.ReactNode
  children: React.ReactNode
}

type AuthFieldProps = {
  label: string
  error?: string
  children: React.ReactNode
}

type AuthNoticeProps = {
  tone: 'error' | 'success'
  children: React.ReactNode
}

export function AuthShell({
  title,
  subtitle,
  panelTitle,
  panelDescription,
  panelPosition = 'right',
  footer,
  mascot,
  children,
}: AuthShellProps) {
  const [showDecorativeLayers, setShowDecorativeLayers] = React.useState(!isWeb)
  const shellClassName = isWeb ? 'auth-shell' : undefined
  const frameClassName = isWeb
    ? `auth-shell__frame ${panelPosition === 'left' ? 'auth-shell__frame--panel-left' : ''}`.trim()
    : undefined
  const formClassName = isWeb ? 'auth-shell__form' : undefined
  const panelClassName = isWeb ? 'auth-shell__panel' : undefined
  const footerClassName = isWeb ? 'auth-shell__footer' : undefined

  React.useEffect(() => {
    if (!isWeb) return
    setShowDecorativeLayers(true)
  }, [])

  return (
    <Theme name="light_user">
      <YStack
        className={shellClassName}
        flex={1}
        position="relative"
        overflow="hidden"
        backgroundColor={AUTH_PALETTE.neutral}
        justifyContent="center"
        paddingHorizontal="$4"
        paddingVertical="$6"
        minHeight={isWeb ? '100vh' : undefined}
      >
        {showDecorativeLayers ? <AuthBackdrop /> : null}

        <XStack
          className={frameClassName}
          width="100%"
          maxWidth={560}
          alignSelf="center"
          alignItems="stretch"
          justifyContent="center"
          gap="$5"
          zIndex={1}
        >
          <YStack
            className={formClassName}
            flex={1}
            width="100%"
            maxWidth={560}
            alignSelf="center"
            justifyContent="center"
            gap="$5"
          >
            <VStack alignItems="center" gap="$2" paddingHorizontal="$2">
              <Text variant="heading2" align="center" color="$primary">
                AntAPP
              </Text>
              <VStack alignItems="center" gap="$2" maxWidth={440}>
                <Text variant="heading2" align="center">
                  {title}
                </Text>
                <Text variant="bodyLarge" align="center" muted>
                  {subtitle}
                </Text>
              </VStack>
            </VStack>

            <YStack position="relative" width="100%">
              {mascot ? (
                <YStack
                  position="absolute"
                  top={-80}
                  left={20}
                  zIndex={10}
                  alignItems="center"
                >
                  {mascot}
                </YStack>
              ) : null}
              <Card
                variant="elevated"
                size="md"
                width="100%"
                borderRadius="$5"
                backgroundColor={AUTH_PALETTE.neutralStrong}
                {...(mascot ? { paddingTop: '$5', marginTop: '$9' } : {})}
              >
                <VStack gap="$4">{children}</VStack>
              </Card>
            </YStack>

            {footer ? (
              <XStack
                className={footerClassName}
                width="100%"
                justifyContent="center"
                paddingHorizontal="$2"
              >
                {footer}
              </XStack>
            ) : null}
          </YStack>

          {showDecorativeLayers ? (
            <AuthVisualPanel
              className={panelClassName}
              title={panelTitle}
              description={panelDescription}
            />
          ) : null}
        </XStack>
      </YStack>
    </Theme>
  )
}

export function AuthField({ label, error, children }: AuthFieldProps) {
  return (
    <VStack gap="$2">
      <Text variant="label">{label}</Text>
      {children}
      {error ? (
        <Text variant="caption" color="$error500">
          {error}
        </Text>
      ) : null}
    </VStack>
  )
}

export function AuthNotice({ tone, children }: AuthNoticeProps) {
  const backgroundColor = tone === 'success' ? '$success50' : '$error50'
  const borderColor = tone === 'success' ? '$success200' : '$error200'
  const textColor = tone === 'success' ? '$success500' : '$error500'

  return (
    <YStack
      padding="$3"
      borderRadius="$3"
      borderWidth={1}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
    >
      <Text variant="body" color={textColor}>
        {children}
      </Text>
    </YStack>
  )
}

export function AuthFooterLink({
  prefix,
  actionLabel,
  onPress,
}: {
  prefix: string
  actionLabel: string
  onPress: () => void
}) {
  return (
    <HStack gap="$1.5" flexWrap="wrap" justifyContent="center">
      <Text variant="body" muted align="center">
        {prefix}
      </Text>
      <Button variant="link" size="sm" onPress={onPress}>
        {actionLabel}
      </Button>
    </HStack>
  )
}

function AuthBackdrop() {
  const large = isWeb ? 440 : 260
  const medium = isWeb ? 320 : 200
  const small = isWeb ? 220 : 136
  const routeDot = isWeb ? 16 : 10
  const routeLine = isWeb ? 88 : 54
  const routeLineSm = isWeb ? 58 : 38

  return (
    <YStack
      pointerEvents="none"
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      overflow="hidden"
    >
      <YStack
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        backgroundColor={AUTH_PALETTE.neutral}
      />

      <YStack
        position="absolute"
        top={isWeb ? -170 : -92}
        left={isWeb ? -120 : -76}
        width={large}
        height={large}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.secondary}
        opacity={0.22}
      />
      <YStack
        position="absolute"
        top={isWeb ? -96 : -40}
        left={isWeb ? 12 : 8}
        width={medium}
        height={medium}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.secondarySoft}
        opacity={0.56}
      />
      <YStack
        position="absolute"
        top={isWeb ? -96 : -60}
        right={isWeb ? 36 : -48}
        width={isWeb ? 380 : 240}
        height={isWeb ? 380 : 240}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.primary}
        opacity={0.16}
      />
      <YStack
        position="absolute"
        top={isWeb ? 112 : 92}
        right={isWeb ? -112 : -76}
        width={medium}
        height={medium}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.tertiary}
        opacity={0.18}
      />
      <YStack
        position="absolute"
        bottom={isWeb ? -188 : -116}
        left={isWeb ? -32 : -44}
        width={isWeb ? 420 : 280}
        height={isWeb ? 420 : 280}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.primaryDeep}
        opacity={0.1}
      />
      <YStack
        position="absolute"
        bottom={isWeb ? -124 : -78}
        right={isWeb ? 56 : -28}
        width={isWeb ? 280 : 184}
        height={isWeb ? 280 : 184}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.secondary}
        opacity={0.1}
      />

      <YStack
        position="absolute"
        top={isWeb ? 90 : 108}
        left={isWeb ? 92 : 18}
        width={isWeb ? 280 : 168}
        height={isWeb ? 154 : 108}
        borderRadius="$5"
        backgroundColor={AUTH_PALETTE.neutralStrong}
        opacity={0.42}
      />
      <YStack
        position="absolute"
        top={isWeb ? 242 : 208}
        left={isWeb ? 164 : 110}
        width={small}
        height={small}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.primarySoft}
        opacity={0.62}
      />
      <YStack
        position="absolute"
        bottom={isWeb ? 72 : 52}
        right={isWeb ? 72 : -6}
        width={isWeb ? 244 : 172}
        height={isWeb ? 180 : 128}
        borderRadius="$5"
        backgroundColor={AUTH_PALETTE.neutralSoft}
        opacity={0.84}
      />
      <YStack
        position="absolute"
        bottom={isWeb ? 124 : 112}
        left={isWeb ? 72 : 30}
        width={isWeb ? 108 : 72}
        height={isWeb ? 108 : 72}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.tertiarySoft}
        opacity={0.54}
      />

      <YStack position="absolute" top={isWeb ? 126 : 120} right={isWeb ? 132 : 22} gap="$2" opacity={0.78}>
        <XStack gap="$2" alignItems="center">
          <YStack width={routeDot} height={routeDot} borderRadius="$full" backgroundColor={AUTH_PALETTE.secondary} />
          <YStack width={routeLine} height={6} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} opacity={0.74} />
        </XStack>
        <XStack gap="$2" alignItems="center" paddingLeft={isWeb ? 24 : 14}>
          <YStack width={routeLineSm} height={6} borderRadius="$full" backgroundColor={AUTH_PALETTE.primary} opacity={0.44} />
          <YStack width={routeDot} height={routeDot} borderRadius="$full" backgroundColor={AUTH_PALETTE.tertiary} opacity={0.82} />
        </XStack>
      </YStack>

      <YStack position="absolute" bottom={isWeb ? 188 : 168} left={isWeb ? 108 : 26} gap="$2.5" opacity={0.68}>
        <XStack gap="$2" alignItems="center">
          <YStack width={routeDot} height={routeDot} borderRadius="$full" backgroundColor={AUTH_PALETTE.primary} opacity={0.74} />
          <YStack width={routeLineSm} height={6} borderRadius="$full" backgroundColor={AUTH_PALETTE.secondary} opacity={0.58} />
        </XStack>
        <XStack gap="$2" alignItems="center" paddingLeft={isWeb ? 38 : 20}>
          <YStack width={routeLine} height={6} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} opacity={0.6} />
        </XStack>
      </YStack>

      <YStack position="absolute" top={isWeb ? 352 : 300} right={isWeb ? 242 : 94} gap="$2" opacity={0.44}>
        <XStack gap="$2" alignItems="center">
          <YStack width={10} height={10} borderRadius="$full" backgroundColor={AUTH_PALETTE.secondary} />
          <YStack width={isWeb ? 46 : 28} height={5} borderRadius="$full" backgroundColor={AUTH_PALETTE.primary} />
        </XStack>
        <XStack gap="$2" alignItems="center" paddingLeft={isWeb ? 12 : 8}>
          <YStack width={isWeb ? 26 : 16} height={5} borderRadius="$full" backgroundColor={AUTH_PALETTE.tertiary} />
          <YStack width={8} height={8} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} />
        </XStack>
      </YStack>
    </YStack>
  )
}

function AuthVisualPanel({
  className,
  title,
  description,
}: {
  className?: string
  title: string
  description: string
}) {
  return (
    <YStack
      className={className}
      display="none"
      flex={1}
      minWidth={0}
      minHeight={760}
      borderRadius="$5"
      overflow="hidden"
      backgroundColor={AUTH_PALETTE.primaryDeep}
      justifyContent="space-between"
      padding="$8"
      position="relative"
    >
      <YStack
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        backgroundColor={AUTH_PALETTE.primary}
        opacity={0.24}
      />
      <YStack
        position="absolute"
        top={-82}
        right={-64}
        width={340}
        height={340}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.secondary}
        opacity={0.24}
      />
      <YStack
        position="absolute"
        top={176}
        left={-90}
        width={272}
        height={272}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.tertiary}
        opacity={0.18}
      />
      <YStack
        position="absolute"
        bottom={-128}
        right={24}
        width={300}
        height={300}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.secondarySoft}
        opacity={0.16}
      />
      <YStack
        position="absolute"
        top={86}
        left={74}
        width={224}
        height={134}
        borderRadius="$5"
        backgroundColor={AUTH_PALETTE.neutralStrong}
        opacity={0.09}
      />
      <YStack
        position="absolute"
        bottom={86}
        left={94}
        width={168}
        height={168}
        borderRadius="$5"
        backgroundColor={AUTH_PALETTE.primarySoft}
        opacity={0.1}
      />
      <YStack
        position="absolute"
        top={132}
        right={132}
        width={164}
        height={14}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.neutralStrong}
        opacity={0.12}
      />
      <YStack
        position="absolute"
        top={156}
        right={112}
        width={96}
        height={14}
        borderRadius="$full"
        backgroundColor={AUTH_PALETTE.secondarySoft}
        opacity={0.2}
      />

      <YStack position="absolute" top={120} left={96} gap="$2.5" opacity={0.84}>
        <XStack gap="$2" alignItems="center">
          <YStack width={16} height={16} borderRadius="$full" backgroundColor={AUTH_PALETTE.secondary} />
          <YStack width={92} height={6} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} opacity={0.74} />
        </XStack>
        <XStack gap="$2" alignItems="center" paddingLeft={28}>
          <YStack width={56} height={6} borderRadius="$full" backgroundColor={AUTH_PALETTE.tertiarySoft} opacity={0.78} />
          <YStack width={16} height={16} borderRadius="$full" backgroundColor={AUTH_PALETTE.tertiary} opacity={0.72} />
        </XStack>
      </YStack>

      <YStack position="absolute" bottom={156} right={86} gap="$2" opacity={0.56}>
        <XStack gap="$2" alignItems="center">
          <YStack width={12} height={12} borderRadius="$full" backgroundColor={AUTH_PALETTE.secondary} />
          <YStack width={68} height={5} borderRadius="$full" backgroundColor={AUTH_PALETTE.primarySoft} opacity={0.84} />
        </XStack>
        <XStack gap="$2" alignItems="center" paddingLeft={22}>
          <YStack width={34} height={5} borderRadius="$full" backgroundColor={AUTH_PALETTE.tertiary} opacity={0.72} />
          <YStack width={8} height={8} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} opacity={0.84} />
        </XStack>
      </YStack>

      <ZStack flex={1} justifyContent="space-between">
        <VStack gap="$2">
          <Text variant="label" color={AUTH_PALETTE.tertiarySoft}>
            AntAPP User Access
          </Text>
        </VStack>

          <VStack gap="$5" maxWidth={460}>
          <XStack gap="$3" alignItems="center">
            <YStack width={48} height={6} borderRadius="$full" backgroundColor={AUTH_PALETTE.secondary} opacity={0.92} />
            <YStack width={96} height={6} borderRadius="$full" backgroundColor={AUTH_PALETTE.tertiarySoft} opacity={0.5} />
          </XStack>
          <VStack gap="$3">
            <Text variant="heading1" color={AUTH_PALETTE.neutralStrong}>
              {title}
            </Text>
            <Text variant="bodyLarge" color={AUTH_PALETTE.primarySoft}>
              {description}
            </Text>
          </VStack>
        </VStack>
      </ZStack>
    </YStack>
  )
}
