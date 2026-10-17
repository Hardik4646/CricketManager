/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: '#0B0F17',
          900: '#111827',
          800: '#1E293B',
        },
        fcGold: '#F59E0B',
        fcEmerald: '#10B981',
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
