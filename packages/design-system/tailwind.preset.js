/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Mirastros color palette
        cosmic: '#050505', // Deepest black background
        void: '#0a0a0a', // Slightly lighter black
        gold: '#FFD700', // Primary accent
        silver: '#C0C0C0', // Secondary text
        turquoise: '#40E0D0', // Accent color
        purple: '#2E1065', // Deep purple
        indigo: '#312E81', // Indigo accent
        
        // Semantic colors
        mirastros: {
          bg: '#050505',
          primary: '#2E1065',
          secondary: '#312E81',
          gold: '#FFD700',
          silver: '#C0C0C0',
          turquoise: '#40E0D0',
          void: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cinzel', 'serif'],
        cinzel: ['Cinzel', 'serif'], // Alias for headings
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(to bottom, #050505, #1a103c)',
        'gold-gradient': 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
        'purple-gradient': 'linear-gradient(to right, #2E1065, #312E81)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
