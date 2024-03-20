import { nextui } from '@nextui-org/react'
import type { Config } from 'tailwindcss'

import { COLORS } from './config/colors'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'maya-warm-white': COLORS.BACKGROUND,
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            secondary: {
              DEFAULT: COLORS.SECONDARY,
            },
            background: {
              DEFAULT: COLORS.BACKGROUND,
            },
            primary: {
              DEFAULT: COLORS.PRIMARY,
            },
          },
        },
      },
    }),
  ],
}
export default config
