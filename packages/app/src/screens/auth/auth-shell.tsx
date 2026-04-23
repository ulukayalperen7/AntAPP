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
        paddingHorizontal="$5"
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
              {mascot ? (
                <YStack
                  width={92}
                  height={92}
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="$full"
                  backgroundColor="rgba(255,255,255,0.72)"
                  borderWidth={1}
                  borderColor="rgba(15,23,42,0.06)"
                  style={{ boxShadow: '0 24px 48px -34px rgba(15, 23, 42, 0.28)' }}
                >
                  {mascot}
                </YStack>
              ) : null}

              <Text variant="heading3" align="center" color="$primary" weight="bold">
                AntAPP
              </Text>
              <VStack alignItems="center" gap="$2" maxWidth={460}>
                <Text variant="heading1" align="center" style={{ lineHeight: 1.02 }}>
                  {title}
                </Text>
                <Text variant="bodyLarge" align="center" muted style={{ maxWidth: 420, lineHeight: 1.55 }}>
                  {subtitle}
                </Text>
              </VStack>
            </VStack>

            <YStack width="100%">
              <Card
                variant="elevated"
                size="lg"
                width="100%"
                borderRadius={28}
                borderWidth={1}
                borderColor="rgba(15,23,42,0.06)"
                backgroundColor={AUTH_PALETTE.neutralStrong}
                style={{ boxShadow: '0 34px 70px -40px rgba(15, 23, 42, 0.22)' }}
              >
                <VStack gap="$4.5">{children}</VStack>
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
      <Text variant="label" color="$mutedForeground" fontSize="$3">
        {label}
      </Text>
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
      padding="$3.5"
      borderRadius="$4"
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
      <Button variant="link" size="md" onPress={onPress}>
        {actionLabel}
      </Button>
    </HStack>
  )
}

function AuthBackdrop() {
  const s = (web: number, mob: number) => (isWeb ? web : mob)

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
      <YStack position="absolute" top={0} right={0} bottom={0} left={0} backgroundColor={AUTH_PALETTE.neutral} />

      {/* --- Sky gradient blobs --- */}
      <YStack position="absolute" top={s(-170, -92)} left={s(-120, -76)} width={s(440, 260)} height={s(440, 260)} borderRadius="$full" backgroundColor={AUTH_PALETTE.primarySoft} opacity={0.5} />
      <YStack position="absolute" top={s(-96, -60)} right={s(36, -48)} width={s(380, 240)} height={s(380, 240)} borderRadius="$full" backgroundColor={AUTH_PALETTE.primary} opacity={0.1} />

      {/* --- Sun --- */}
      <YStack position="absolute" top={s(32, 24)} right={s(64, 20)} opacity={0.3}>
        <YStack width={s(72, 48)} height={s(72, 48)} borderRadius="$full" backgroundColor={AUTH_PALETTE.secondary} />
        {[0, 45, 90, 135].map((deg) => (
          <YStack
            key={deg}
            position="absolute"
            top={s(32, 20)}
            left={s(32, 20)}
            width={s(8, 5)}
            height={s(92, 64)}
            borderRadius="$full"
            backgroundColor={AUTH_PALETTE.secondarySoft}
            opacity={0.6}
            transform={[{ rotate: `${deg}deg` }]}
          />
        ))}
      </YStack>

      {/* --- Cloud 1 (top-left) --- */}
      <XStack position="absolute" top={s(60, 44)} left={s(40, 10)} opacity={0.18}>
        <YStack width={s(64, 40)} height={s(28, 18)} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} />
        <YStack position="absolute" top={s(-12, -8)} left={s(16, 10)} width={s(36, 22)} height={s(36, 22)} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} />
        <YStack position="absolute" top={s(-8, -5)} left={s(36, 22)} width={s(28, 18)} height={s(28, 18)} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} />
      </XStack>

      {/* --- Cloud 2 (top-right area) --- */}
      <XStack position="absolute" top={s(110, 72)} right={s(180, 80)} opacity={0.12}>
        <YStack width={s(52, 34)} height={s(22, 14)} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} />
        <YStack position="absolute" top={s(-10, -6)} left={s(12, 8)} width={s(30, 18)} height={s(30, 18)} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} />
        <YStack position="absolute" top={s(-6, -4)} left={s(28, 18)} width={s(22, 14)} height={s(22, 14)} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} />
      </XStack>

      {/* --- Mountains (background) --- */}
      <YStack position="absolute" bottom={s(120, 80)} left={0} right={0} opacity={0.08}>
        <YStack
          position="absolute"
          bottom={0}
          left={s(-20, -10)}
          width={0}
          height={0}
          borderLeftWidth={s(160, 100)}
          borderRightWidth={s(160, 100)}
          borderBottomWidth={s(200, 130)}
          borderLeftColor="transparent"
          borderRightColor="transparent"
          borderBottomColor={AUTH_PALETTE.primaryDeep}
        />
        <YStack
          position="absolute"
          bottom={0}
          left={s(100, 50)}
          width={0}
          height={0}
          borderLeftWidth={s(200, 130)}
          borderRightWidth={s(200, 130)}
          borderBottomWidth={s(260, 170)}
          borderLeftColor="transparent"
          borderRightColor="transparent"
          borderBottomColor={AUTH_PALETTE.primary}
        />
        <YStack
          position="absolute"
          bottom={0}
          right={s(-40, -20)}
          width={0}
          height={0}
          borderLeftWidth={s(140, 90)}
          borderRightWidth={s(140, 90)}
          borderBottomWidth={s(180, 120)}
          borderLeftColor="transparent"
          borderRightColor="transparent"
          borderBottomColor={AUTH_PALETTE.primaryDeep}
        />
      </YStack>

      {/* --- Palm tree 1 (left side) --- */}
      <YStack position="absolute" bottom={s(90, 56)} left={s(48, 12)} opacity={0.14}>
        <YStack width={s(8, 5)} height={s(80, 52)} backgroundColor={AUTH_PALETTE.secondary} borderRadius={4} alignSelf="center" />
        {[-50, -20, 15, 45].map((deg, i) => (
          <YStack
            key={i}
            position="absolute"
            top={0}
            left={s(0, -2)}
            width={s(48, 32)}
            height={s(10, 7)}
            borderRadius="$full"
            backgroundColor={AUTH_PALETTE.tertiary}
            transform={[{ rotate: `${deg}deg` }, { translateX: s(4, 2) }]}
          />
        ))}
      </YStack>

      {/* --- Palm tree 2 (right side, smaller) --- */}
      <YStack position="absolute" bottom={s(84, 50)} right={s(60, 18)} opacity={0.1}>
        <YStack width={s(6, 4)} height={s(60, 40)} backgroundColor={AUTH_PALETTE.secondary} borderRadius={3} alignSelf="center" />
        {[-45, -15, 20, 50].map((deg, i) => (
          <YStack
            key={i}
            position="absolute"
            top={0}
            left={s(-2, -3)}
            width={s(38, 26)}
            height={s(8, 5)}
            borderRadius="$full"
            backgroundColor={AUTH_PALETTE.tertiary}
            transform={[{ rotate: `${deg}deg` }, { translateX: s(3, 2) }]}
          />
        ))}
      </YStack>

      {/* --- Sea / Waves (bottom) --- */}
      <YStack position="absolute" bottom={0} left={0} right={0} height={s(100, 64)} opacity={0.15}>
        <YStack position="absolute" bottom={s(40, 26)} left={s(-20, -10)} right={s(-20, -10)} height={s(48, 32)} borderRadius="$full" backgroundColor={AUTH_PALETTE.tertiary} />
        <YStack position="absolute" bottom={s(24, 16)} left={s(-30, -14)} right={s(-30, -14)} height={s(48, 32)} borderRadius="$full" backgroundColor={AUTH_PALETTE.primary} opacity={0.7} />
        <YStack position="absolute" bottom={s(8, 4)} left={s(-10, -6)} right={s(-10, -6)} height={s(48, 32)} borderRadius="$full" backgroundColor={AUTH_PALETTE.tertiary} opacity={0.8} />
        <YStack position="absolute" bottom={0} left={0} right={0} height={s(32, 20)} backgroundColor={AUTH_PALETTE.primary} opacity={0.5} />
      </YStack>

      {/* --- Tiny boat on waves --- */}
      <YStack position="absolute" bottom={s(68, 42)} left={s(200, 100)} opacity={0.12}>
        <YStack width={s(32, 20)} height={s(10, 6)} borderRadius={s(4, 2)} backgroundColor={AUTH_PALETTE.secondary} />
        <YStack position="absolute" top={s(-16, -10)} left={s(12, 8)} width={s(3, 2)} height={s(16, 10)} backgroundColor={AUTH_PALETTE.neutralStrong} />
        <YStack
          position="absolute"
          top={s(-14, -9)}
          left={s(14, 9)}
          width={0}
          height={0}
          borderLeftWidth={0}
          borderRightWidth={s(10, 6)}
          borderBottomWidth={s(12, 8)}
          borderLeftColor="transparent"
          borderRightColor="transparent"
          borderBottomColor={AUTH_PALETTE.neutralStrong}
          transform={[{ rotate: '180deg' }]}
        />
      </YStack>

      {/* --- Small birds (V shapes) --- */}
      {[
        { top: s(80, 52), left: s(180, 90), size: s(16, 10) },
        { top: s(60, 40), left: s(220, 120), size: s(12, 8) },
        { top: s(95, 62), right: s(200, 100), size: s(14, 9) },
      ].map((bird, i) => (
        <XStack
          key={i}
          position="absolute"
          top={bird.top}
          {...(bird.left !== undefined ? { left: bird.left } : { right: bird.right })}
          opacity={0.12}
        >
          <YStack
            width={bird.size}
            height={s(3, 2)}
            borderRadius="$full"
            backgroundColor={AUTH_PALETTE.primaryDeep}
            transform={[{ rotate: '-25deg' }]}
          />
          <YStack
            width={bird.size}
            height={s(3, 2)}
            borderRadius="$full"
            backgroundColor={AUTH_PALETTE.primaryDeep}
            transform={[{ rotate: '25deg' }]}
            marginLeft={-2}
          />
        </XStack>
      ))}

      {/* --- Route dot accents --- */}
      <YStack position="absolute" top={s(160, 130)} right={s(132, 22)} gap="$2" opacity={0.5}>
        <XStack gap="$2" alignItems="center">
          <YStack width={s(12, 8)} height={s(12, 8)} borderRadius="$full" backgroundColor={AUTH_PALETTE.secondary} />
          <YStack width={s(56, 36)} height={5} borderRadius="$full" backgroundColor={AUTH_PALETTE.neutralStrong} opacity={0.6} />
        </XStack>
        <XStack gap="$2" alignItems="center" paddingLeft={s(20, 12)}>
          <YStack width={s(40, 24)} height={5} borderRadius="$full" backgroundColor={AUTH_PALETTE.tertiary} opacity={0.5} />
          <YStack width={s(10, 6)} height={s(10, 6)} borderRadius="$full" backgroundColor={AUTH_PALETTE.primary} />
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
