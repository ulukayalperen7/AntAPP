import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@antapp/app', '@antapp/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'd32ex7notsszg6.cloudfront.net',
      },
    ],
  },
  turbopack: {
    root: path.join(__dirname, '..'),
    resolveAlias: {
      'react-native': 'react-native-web',
    },
  },
}

export default nextConfig
