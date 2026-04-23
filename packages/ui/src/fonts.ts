import { createFont } from 'tamagui'

// Web: CSS variable stack with system fallbacks.
// CSS vars are set in globals.css; all values have safe system font fallbacks.
const sansFamily =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
const monoFamily =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

const size = {
  1: 11,
  2: 12,
  3: 13,
  4: 14,
  5: 16,
  6: 18,
  7: 20,
  8: 24,
  9: 28,
  10: 32,
  11: 36,
  12: 40,
  true: 14,
} as const

const lineHeight = {
  1: 15,
  2: 16,
  3: 18,
  4: 20,
  5: 22,
  6: 26,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  true: 20,
} as const

const weight = {
  1: '400' as const,
  2: '500' as const,
  3: '600' as const,
  4: '700' as const,
  true: '400' as const,
}

const letterSpacing = {
  1: 0,
  2: 0,
  3: 0,
  4: -0.1,
  5: -0.2,
  6: -0.3,
  7: -0.4,
  8: -0.5,
  9: -0.6,
  10: -0.7,
  11: -0.8,
  12: -0.9,
  true: 0,
}

export const bodyFont = createFont({
  family: sansFamily,
  size,
  lineHeight,
  weight,
  letterSpacing,
})

export const headingFont = createFont({
  family: sansFamily,
  size,
  lineHeight,
  weight: { ...weight, true: '600' as const },
  letterSpacing,
})

export const monoFont = createFont({
  family: monoFamily,
  size,
  lineHeight,
  weight,
  letterSpacing: Object.fromEntries(Object.keys(letterSpacing).map((k) => [k, 0])) as typeof letterSpacing,
})

export const fonts = {
  body: bodyFont,
  heading: headingFont,
  mono: monoFont,
}

export type AntFonts = typeof fonts
