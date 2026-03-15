import { withTamagui } from '@tamagui/next-plugin'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@antapp/app', '@antapp/ui'],
  turbopack: {},
}

export default withTamagui({
  config: '../../packages/ui/src/tamagui.config.ts',
  components: ['tamagui', '@antapp/ui', '@antapp/app'],
  appDir: true,
})(nextConfig)
