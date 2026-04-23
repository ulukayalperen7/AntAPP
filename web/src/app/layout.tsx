import type { Metadata } from 'next'
import { TamaguiProvider } from '../providers/tamagui-provider'
import './globals.css'
import './tamagui.generated.css'

export const metadata: Metadata = {
  title: 'AntAPP',
  description: 'AntAPP',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <TamaguiProvider>{children}</TamaguiProvider>
      </body>
    </html>
  )
}
