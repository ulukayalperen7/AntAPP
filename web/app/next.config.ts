import { withTamagui } from '@tamagui/next-plugin'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

export default withTamagui({
  config: '../../packages/ui/src/tamagui.config.ts',
  components: ['tamagui', '@antapp/ui'],
  appDir: true,
})(nextConfig)
