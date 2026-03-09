import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4472C4',
        income: {
          text: '#006100',
          bg: '#E2EFDA',
        },
        expense: {
          text: '#9C0006',
          bg: '#FCE4EC',
        },
      },
    },
  },
  plugins: [],
}
export default config
