/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: '#0F0A1F',
        purple: {
          deep: '#1E0A3C',
        },
        gold: '#D4AF37',
        turquoise: '#40E0D0',
        vk: {
          blue: '#0077FF',
          light: '#4BB3FD',
        },
      },
    },
  },
  plugins: [],
}
