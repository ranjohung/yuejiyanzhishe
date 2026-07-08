import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF0F5',
          100: '#FFE4E9',
          200: '#FFC8D6',
          300: '#FFA0B9',
          400: '#FF6B9D',
          500: '#FF4D8A',
          600: '#FF3377',
          700: '#E62966',
          800: '#CC2255',
          900: '#991A44',
        },
        secondary: {
          50: '#FFF8F0',
          100: '#FFEDE0',
          200: '#FFDBC0',
          300: '#FFC499',
          400: '#FFA566',
          500: '#FF8C33',
        },
      },
      fontFamily: {
        sans: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
