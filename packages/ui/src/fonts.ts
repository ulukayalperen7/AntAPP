export const bodyFont = {
  family: '"Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
} as const

export const headingFont = {
  family: '"Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
} as const

export const monoFont = {
  family: '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
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
