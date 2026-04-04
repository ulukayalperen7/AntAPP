import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@antapp/app', '@antapp/ui'],
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
      'react-native-svg': '@tamagui/react-native-svg',
    },
  },
}

export default nextConfig
