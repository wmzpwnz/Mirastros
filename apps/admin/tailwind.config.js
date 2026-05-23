const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('../../tailwind.preset.js')],
    content: [
        join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
        ...createGlobPatternsForDependencies(__dirname),
    ],
    theme: {
        extend: {
            // Admin-specific theme extensions
            colors: {
                // Add any admin-specific color overrides here if needed
            },
        },
    },
    plugins: [],
};
