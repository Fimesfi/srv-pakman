/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00B745',
        secondary: '#131814',
        gray: '#CFCFCF',
        primary_hover: ' #00A03C',
        accent: '#BBFFD5'
      }
    },
  },
  plugins: [],
}

