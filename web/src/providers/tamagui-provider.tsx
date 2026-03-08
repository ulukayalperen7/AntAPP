'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { useState } from 'react'
import { NextThemeProvider, useRootTheme } from '@tamagui/next-theme'
import { TamaguiProvider as TamaguiRootProvider } from 'tamagui'
import { tamaguiConfig } from '@antapp/ui'

export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  const [css, setCss] = useState('')

  useServerInsertedHTML(() => (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
      id="tamagui-css"
    />
  ))

  const [theme] = useRootTheme()

  return (
    <NextThemeProvider>
      <TamaguiRootProvider
        config={tamaguiConfig}
        theme={theme}
        disableRootThemeClass
        defaultTheme="light"
      >
        {children}
      </TamaguiRootProvider>
    </NextThemeProvider>
  )
}
