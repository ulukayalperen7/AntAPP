import type { TamaguiBuildOptions } from '@tamagui/core'

export default {
  config: '../packages/ui/src/tamagui.config.ts',
  components: ['tamagui', '@antapp/ui', '@antapp/app'],
  outputCSS: './src/app/tamagui.generated.css',
} satisfies TamaguiBuildOptions
