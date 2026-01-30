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
        'pink-light': '#FCE7F3',
        'pink-medium': '#F9A8D4',
        'pink-dark': '#EC4899',
        'pink-deep': '#DB2777',
        'purple-light': '#E9D5FF',
        'purple-medium': '#C084FC',
      },
    },
  },
  plugins: [],
}
export default config
