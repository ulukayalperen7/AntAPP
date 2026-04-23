import { Platform } from 'react-native'

export const bodyFont = {
  family: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }) ?? 'System',
} as const

export const headingFont = {
  family: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }) ?? 'System',
} as const

export const monoFont = {
  family: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }) ?? 'monospace',
} as const

export const fonts = {
  body: bodyFont,
  heading: headingFont,
  mono: monoFont,
  families: {
    body: bodyFont.family,
    heading: headingFont.family,
    mono: monoFont.family,
  },
} as const

export type AntFonts = typeof fonts
