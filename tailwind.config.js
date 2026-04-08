/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Familjen Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Gold/amber accent — primary CTA colour
        solar: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Navy — primary brand colour (matches existing site --navy)
        navy: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          400: '#4a6fa8',
          600: '#1e3a6e',
          700: '#162d58',
          800: '#0f2040',
          900: '#0a1930',
          950: '#060f1e',
        },
        // KEC Teal — secondary accent
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0b7a6e',
        },
        // KEC Blue
        'kec-blue': {
          500: '#1464aa',
          600: '#0f4f8a',
        }
      }
    }
  },
  plugins: []
}
