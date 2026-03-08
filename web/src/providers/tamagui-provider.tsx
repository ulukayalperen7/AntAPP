'use client'

import { NextThemeProvider } from '@tamagui/next-theme'
import { TamaguiProvider as TamaguiRootProvider } from 'tamagui'
import { tamaguiConfig } from '@antapp/ui'

export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider>
      <TamaguiRootProvider config={tamaguiConfig} defaultTheme="light">
        {children}
      </TamaguiRootProvider>
    </NextThemeProvider>
  )
}
