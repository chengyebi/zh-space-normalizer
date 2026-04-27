import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'LXGW WenKai Screen',
          'Noto Serif SC',
          'Source Han Serif SC',
          'Georgia',
          'serif',
        ],
      },
      colors: {
        paper: '#f7f2e8',
        ink: '#1c2520',
        moss: '#596f58',
        clay: '#b66f4f',
        mist: '#e7dfcf',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(58, 48, 36, 0.14)',
      },
    },
  },
  plugins: [],
} satisfies Config;
