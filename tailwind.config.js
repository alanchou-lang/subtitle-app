/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'],
        serif: ['Noto Serif TC', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        gold: { DEFAULT: '#c8a96e', light: '#e0c080', dark: '#a08040' },
      },
    },
  },
  plugins: [],
}
