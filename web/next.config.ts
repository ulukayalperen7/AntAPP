import { withTamagui } from '@tamagui/next-plugin'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@antapp/app', '@antapp/ui'],
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
      'react-native-svg': '@tamagui/react-native-svg',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      'react-native$': 'react-native-web',
      'react-native-svg': '@tamagui/react-native-svg',
    }

    return config
  },
}

export default withTamagui({
  config: '../packages/ui/src/tamagui.config.ts',
  components: ['tamagui', '@antapp/ui', '@antapp/app'],
  outputCSS: './src/app/tamagui.css',
  appDir: true,
})(nextConfig)
