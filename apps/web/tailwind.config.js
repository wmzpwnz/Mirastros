const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const designSystemPreset = require('../../packages/design-system/tailwind.preset.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [designSystemPreset],
    content: [
        join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
        ...createGlobPatternsForDependencies(__dirname),
    ],
    theme: {
        extend: {
            // Web-specific extensions can be added here
        },
    },
    plugins: [],
};
