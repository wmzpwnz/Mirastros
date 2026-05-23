/**
 * Responsive Breakpoints
 */

export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultrawide: '1536px',
} as const;

export const breakpointValues = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1536,
} as const;

export type Breakpoints = typeof breakpoints;
export type BreakpointValues = typeof breakpointValues;
