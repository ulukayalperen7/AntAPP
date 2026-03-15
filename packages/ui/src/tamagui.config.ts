import { createTamagui } from 'tamagui'
import { defaultConfig } from '@tamagui/config/v4'
import { tokens } from './tokens'
import { themes } from './themes'
import { fonts } from './fonts'

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  tokens,
  themes: {
    ...defaultConfig.themes,
    ...themes,
  },
  fonts: {
    ...defaultConfig.fonts,
    body: fonts.body,
    heading: fonts.heading,
    mono: fonts.mono,
  },
  media: {
    xs: { maxWidth: 479 },
    sm: { maxWidth: 639 },
    md: { maxWidth: 767 },
    lg: { maxWidth: 1023 },
    xl: { maxWidth: 1279 },
    xxl: { maxWidth: 1535 },
    gtXs: { minWidth: 480 },
    gtSm: { minWidth: 640 },
    gtMd: { minWidth: 768 },
    gtLg: { minWidth: 1024 },
  },
  shorthands: {
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    br: 'borderRadius',
    bg: 'backgroundColor',
    f: 'flex',
    ai: 'alignItems',
    jc: 'justifyContent',
    fw: 'flexWrap',
    fd: 'flexDirection',
    w: 'width',
    h: 'height',
    maw: 'maxWidth',
    miw: 'minWidth',
    mah: 'maxHeight',
    mih: 'minHeight',
  } as const,
})

export type Conf = typeof tamaguiConfig

export default tamaguiConfig
