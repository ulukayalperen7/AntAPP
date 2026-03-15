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
  useMedia,
} from '@antapp/ui'

type AuthShellProps = {
  title: string
  subtitle: string
  panelTitle: string
  panelDescription: string
  panelPosition?: 'left' | 'right'
  footer?: React.ReactNode
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
  children,
}: AuthShellProps) {
  const media = useMedia()
  const showPanel = isWeb && media.gtLg

  return (
    <Theme name="light_user">
      <YStack
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        paddingHorizontal="$4"
        paddingVertical="$6"
        minHeight={isWeb ? '100vh' : undefined}
      >
        <XStack
          width="100%"
          maxWidth={showPanel ? 1180 : 560}
          alignSelf="center"
          alignItems="stretch"
          justifyContent="center"
          gap="$5"
          flexDirection={showPanel && panelPosition === 'left' ? 'row-reverse' : 'row'}
        >
          <YStack flex={1} width="100%" maxWidth={560} alignSelf="center" justifyContent="center" gap="$5">
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

            <Card
              variant="elevated"
              size={showPanel ? 'lg' : 'md'}
              width="100%"
              borderRadius="$5"
              backgroundColor="$backgroundStrong"
            >
              <VStack gap="$4">{children}</VStack>
            </Card>

            {footer ? (
              <XStack width="100%" justifyContent="center" paddingHorizontal="$2">
                {footer}
              </XStack>
            ) : null}
          </YStack>

          {showPanel ? (
            <AuthVisualPanel title={panelTitle} description={panelDescription} />
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

function AuthVisualPanel({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <YStack
      flex={1}
      minWidth={0}
      minHeight={760}
      borderRadius="$5"
      overflow="hidden"
      backgroundColor="$primary"
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
        backgroundColor="$ant900"
        opacity={0.18}
      />
      <YStack
        position="absolute"
        top={-90}
        right={-60}
        width={300}
        height={300}
        borderRadius="$full"
        backgroundColor="$ant200"
        opacity={0.2}
      />
      <YStack
        position="absolute"
        top={190}
        left={-110}
        width={280}
        height={280}
        borderRadius="$full"
        backgroundColor="$ant300"
        opacity={0.12}
      />
      <YStack
        position="absolute"
        bottom={-140}
        right={-40}
        width={360}
        height={360}
        borderRadius="$full"
        backgroundColor="$ant700"
        opacity={0.28}
      />

      <ZStack flex={1} justifyContent="space-between">
        <VStack gap="$2">
          <Text variant="label" color="$ant50">
            AntAPP User Access
          </Text>
        </VStack>

        <VStack gap="$5" maxWidth={460}>
          <XStack gap="$3" alignItems="center">
            <YStack width={48} height={6} borderRadius="$full" backgroundColor="$ant100" opacity={0.85} />
            <YStack width={96} height={6} borderRadius="$full" backgroundColor="$ant100" opacity={0.45} />
          </XStack>
          <VStack gap="$3">
            <Text variant="heading1" color="$white">
              {title}
            </Text>
            <Text variant="bodyLarge" color="$ant50">
              {description}
            </Text>
          </VStack>
        </VStack>
      </ZStack>
    </YStack>
  )
}
