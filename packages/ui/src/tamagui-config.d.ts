import 'tamagui'
import tamaguiConfig from './tamagui.config'

type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
