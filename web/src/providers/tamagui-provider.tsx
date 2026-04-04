'use client'

import { NextThemeProvider } from '@tamagui/next-theme'
import { tamaguiConfig } from '@antapp/ui'
import { TamaguiProvider as TamaguiRootProvider } from 'tamagui'

export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      forcedTheme="light"
      defaultTheme="light"
      enableSystem={false}
      skipNextHead
    >
      <TamaguiRootProvider
        config={tamaguiConfig}
        disableRootThemeClass
        defaultTheme="light"
      >
        {children}
      </TamaguiRootProvider>
    </NextThemeProvider>
  )
}
