/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0F0D0B',
          900: '#161310',
          800: '#211D18',
          700: '#2E2822',
        },
        paper: {
          100: '#F4EFE4',
          200: '#EDE6D5',
          300: '#DCD3BE',
        },
        teal: {
          400: '#6FB3AB',
          500: '#4E9791',
          600: '#3B7873',
        },
        gold: {
          400: '#E3B45F',
          500: '#D9A441',
          600: '#B8842D',
        },
        wine: {
          500: '#8C4A45',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
