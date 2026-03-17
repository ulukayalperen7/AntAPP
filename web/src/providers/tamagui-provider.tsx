'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { NextThemeProvider, useRootTheme } from '@tamagui/next-theme'
import { tamaguiConfig } from '@antapp/ui'
import { StyleSheet } from 'react-native'
import { TamaguiProvider as TamaguiRootProvider } from 'tamagui'

export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useRootTheme({ fallback: 'light' })

  useServerInsertedHTML(() => {
    const sheet = StyleSheet.getSheet()

    return (
      <style
        id={sheet.id}
        dangerouslySetInnerHTML={{ __html: sheet.textContent }}
      />
    )
  })

  return (
    <NextThemeProvider
      defaultTheme="light"
      enableSystem={false}
      skipNextHead
      onChangeTheme={(nextTheme) => setTheme(nextTheme as 'light' | 'dark')}
    >
      <TamaguiRootProvider
        config={tamaguiConfig}
        disableRootThemeClass
        defaultTheme={theme}
      >
        {children}
      </TamaguiRootProvider>
    </NextThemeProvider>
  )
}
