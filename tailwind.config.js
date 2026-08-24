/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './App.tsx'],
  presets: [require('nativewind/preset')],
  theme: {
    screens: {
      sm: '375px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        // CarbCred Africa — the brand kit from the product contract §2.
        forest: '#0e2b1e',
        leaf: '#a6c443',
        'deep-leaf': '#176034',
        cream: '#faf7f1',
        sand: '#f4efe4',
        ink: '#23241f',
        // River blue: the one colour reserved for an approved river on a map.
        river: '#3b82f6',
      },
      fontFamily: {
        display: ['Montserrat_700Bold'],
        'display-medium': ['Montserrat_600SemiBold'],
      },
    },
  },
  plugins: [],
};
