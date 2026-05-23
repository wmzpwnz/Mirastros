/**
 * Tailwind CSS Preset
 * Imports design tokens from packages/design-system/src/tokens/
 * @type {import('tailwindcss').Config}
 */

const { colors } = require('./src/tokens/colors.js');
const { spacing } = require('./src/tokens/spacing.js');
const { shadows } = require('./src/tokens/shadows.js');
const { breakpointValues } = require('./src/tokens/breakpoints.js');
const { fonts, fontSizes, fontWeights, lineHeights } = require('./src/tokens/typography.js');
const { easings } = require('./src/tokens/animations.js');

module.exports = {
  theme: {
    // Override default theme with design tokens
    colors: {
      // Base colors from tokens
      cosmic: colors.cosmic,
      void: colors.void,
      gold: colors.gold,
      silver: colors.silver,
      turquoise: colors.turquoise,
      purple: colors.purple,
      indigo: colors.indigo,
      
      // Background colors
      'bg-primary': colors.background.primary,
      'bg-secondary': colors.background.secondary,
      'bg-tertiary': colors.background.tertiary,
      
      // Text colors
      'text-primary': colors.text.primary,
      'text-secondary': colors.text.secondary,
      'text-tertiary': colors.text.tertiary,
      'text-accent': colors.text.accent,
      
      // Accent colors
      'accent-gold': colors.accent.gold,
      'accent-turquoise': colors.accent.turquoise,
      'accent-purple': colors.accent.purple,
      
      // Status colors
      success: colors.status.success,
      warning: colors.status.warning,
      error: colors.status.error,
      info: colors.status.info,
      
      // Semantic color group
      mirastros: {
        bg: colors.background.primary,
        primary: colors.accent.purple,
        secondary: colors.indigo,
        gold: colors.accent.gold,
        silver: colors.silver,
        turquoise: colors.accent.turquoise,
        void: colors.void,
      },
      
      // Tailwind defaults
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
    },
    
    // Spacing scale (8px base unit)
    spacing: spacing,
    
    // Breakpoints
    screens: {
      mobile: `${breakpointValues.mobile}px`,
      tablet: `${breakpointValues.tablet}px`,
      desktop: `${breakpointValues.desktop}px`,
      wide: `${breakpointValues.wide}px`,
      ultrawide: `${breakpointValues.ultrawide}px`,
      
      // Standard Tailwind breakpoints for compatibility
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    
    // Font families
    fontFamily: {
      sans: fonts.body.split(',').map(f => f.trim()),
      serif: fonts.heading.split(',').map(f => f.trim()),
      cinzel: fonts.heading.split(',').map(f => f.trim()),
      mono: fonts.mono.split(',').map(f => f.trim()),
    },
    
    // Font sizes
    fontSize: fontSizes,
    
    // Font weights
    fontWeight: fontWeights,
    
    // Line heights
    lineHeight: lineHeights,
    
    // Box shadows (elevation system)
    boxShadow: {
      sm: shadows.sm,
      md: shadows.md,
      lg: shadows.lg,
      xl: shadows.xl,
      '2xl': shadows['2xl'],
      none: 'none',
    },
    
    // Easing functions
    transitionTimingFunction: {
      'ease-in': easings.easeIn,
      'ease-out': easings.easeOut,
      'ease-in-out': easings.easeInOut,
      linear: easings.linear,
    },
    
    extend: {
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
