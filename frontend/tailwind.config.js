/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e17', // Deep navy/charcoal background
        card: 'rgba(255, 255, 255, 0.03)', // Glassmorphism base
        primary: {
          DEFAULT: '#3b82f6', // Electric blue
          light: '#8b5cf6', // Violet
          cyan: '#06b6d4', // Cyan
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
