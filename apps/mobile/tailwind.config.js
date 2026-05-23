/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [
        require('../../tailwind.preset.js'),
        require('@mirastros/design-system/tailwind.preset.js')
    ],
    content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [],
};
