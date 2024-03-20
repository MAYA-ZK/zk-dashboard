// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path')

const config = {
  extends: [
    '../.eslintrc.cjs',
    'next/core-web-vitals',
    'plugin:tailwindcss/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'tailwindcss'],
  root: true,
  settings: {
    tailwindcss: {
      callees: ['cn'],
      config: join(__dirname, 'tailwind.config.ts'),
      whitelist: [],
    },
    next: {
      rootDir: './dashboard',
    },
  },
  rules: {
    'react/jsx-curly-brace-presence': [
      'error',
      { props: 'never', children: 'never' },
    ],
    'react/self-closing-comp': 'warn',
    'react/function-component-definition': 'error',
    'react/display-name': 'off',
  },
}

module.exports = config
