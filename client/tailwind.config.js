/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#0F0F0F', secondary: '#171717', elevated: '#1F1F1F', tertiary: '#262626' },
        border: '#2A2A2A',
        txt: { primary: '#F5F5F5', secondary: '#A3A3A3', tertiary: '#525252' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
