/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-gray': '#f5f5f7',
        'apple-dark': '#1c1c1e',
        'apple-blue': '#0A84FF',
      },
      backdropBlur: {
        'vision': '30px',
      }
    },
  },
  plugins: [],
}
