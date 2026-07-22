import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  ignore: [
    'public/runtime-config.js',
    'src/components/ui/**',
    'src/tanstack-table.d.ts',
  ],
}

export default config
