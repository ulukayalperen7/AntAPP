'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { NextThemeProvider } from '@tamagui/next-theme'
import { tamaguiConfig } from '@antapp/ui'
import { StyleSheet } from 'react-native'
import { TamaguiProvider as TamaguiRootProvider } from 'tamagui'

export function TamaguiProvider({ children }: { children: React.ReactNode }) {

  useServerInsertedHTML(() => {
    const sheet = (
      StyleSheet as typeof StyleSheet & {
        getSheet: () => { id: string; textContent: string }
      }
    ).getSheet()

    return (
      <style
        id={sheet.id}
        dangerouslySetInnerHTML={{ __html: sheet.textContent }}
      />
    )
  })

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
