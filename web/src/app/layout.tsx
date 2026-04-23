import type { Metadata } from 'next'
import { AntUiProvider } from '../providers/ant-ui-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'AntAPP',
  description: 'AntAPP — route planning and discovery platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <AntUiProvider>{children}</AntUiProvider>
      </body>
    </html>
  )
}
