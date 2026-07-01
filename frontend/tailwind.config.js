import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
