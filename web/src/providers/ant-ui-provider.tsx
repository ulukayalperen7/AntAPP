'use client'

import { AntThemeProvider } from '@antapp/ui'

export function AntUiProvider({ children }: { children: React.ReactNode }) {
  return <AntThemeProvider defaultTheme="light">{children}</AntThemeProvider>
}
