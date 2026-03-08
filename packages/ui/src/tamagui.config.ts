import { createTamagui } from 'tamagui'
import { defaultConfig } from '@tamagui/config/v4'

export const tamaguiConfig = createTamagui(defaultConfig)

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
