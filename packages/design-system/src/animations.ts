/**
 * Animation Presets
 */

export const animations = {
  pulseSlow: {
    name: 'pulse-slow',
    duration: '4s',
    timingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    iterationCount: 'infinite',
  },
  
  float: {
    name: 'float',
    duration: '6s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
  },
  
  bounceSlow: {
    name: 'bounce-slow',
    duration: '3s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
  },
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  base: '300ms ease-in-out',
  slow: '500ms ease-in-out',
} as const;

export const easings = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  linear: 'linear',
} as const;

export type Animations = typeof animations;
export type Transitions = typeof transitions;
export type Easings = typeof easings;
