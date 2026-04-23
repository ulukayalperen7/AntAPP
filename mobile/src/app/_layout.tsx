import '@tamagui/native/setup-zeego';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import { Spinner, Text, YStack, tamaguiConfig } from '@antapp/ui';

import { AnimatedSplashOverlay } from '@/components/icons/animated-icon';
import { BottomTabBar } from '@/components/layout/app-tabs';
import { AuthProvider, useAuth } from '@/features/auth/context';
import { AuthScreen } from '@/features/auth/auth-screen';

function AppContent() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
        <Spinner size="large" />
        <Text variant="body" muted>Loading AntAPP...</Text>
      </YStack>
    );
  }

  if (status === 'anonymous') {
    return <AuthScreen />;
  }

  return (
    <>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
      <BottomTabBar />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme ?? 'light'}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}

