/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Tenor Sans"', 'sans-serif'],
      },
      colors: {
        govnavy: {
          DEFAULT: '#063b70',
          dark: '#04284d',
          light: '#0a4f96',
        }
      }
    },
  },
  plugins: [],
}
