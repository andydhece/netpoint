import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1.1rem',  letterSpacing: '0.01em' }],
        'sm':   ['0.8125rem',{ lineHeight: '1.25rem', letterSpacing: '0.005em' }],
        'base': ['0.9375rem',{ lineHeight: '1.5rem',  letterSpacing: '0' }],
        'lg':   ['1.0625rem',{ lineHeight: '1.625rem',letterSpacing: '-0.005em' }],
        'xl':   ['1.1875rem',{ lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl':  ['1.375rem', { lineHeight: '1.875rem',letterSpacing: '-0.015em' }],
        '3xl':  ['1.625rem', { lineHeight: '2rem',    letterSpacing: '-0.02em' }],
        '4xl':  ['2rem',     { lineHeight: '2.375rem',letterSpacing: '-0.025em' }],
        '5xl':  ['2.5rem',   { lineHeight: '2.875rem',letterSpacing: '-0.03em' }],
      },
      colors: {
        darkBg: "#09090b",
        darkCard: "#0c0c0f",
      }
    },
  },
  plugins: [daisyui],
  darkMode: 'class',
  daisyui: {
    themes: ["light", "dark"],
  }
}
