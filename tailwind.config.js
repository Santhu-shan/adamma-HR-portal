/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: 'hsl(222, 47%, 11%)',     // Deep Slate Indigo
          primary: 'hsl(217, 91%, 60%)',  // Electric Premium Blue
          accent: 'hsl(142, 71%, 45%)',   // High-end Mint Emerald
          warning: 'hsl(38, 92%, 50%)',   // Goldenrod Amber
          danger: 'hsl(350, 89%, 60%)'    // Crimson Red
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
