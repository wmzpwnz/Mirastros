/**
 * Utility Types for Component Variants
 */

import type React from 'react';

/**
 * Extract variant type from a union of variant strings
 */
export type VariantType<T extends readonly string[]> = T[number];

/**
 * Extract size type from a union of size strings
 */
export type SizeType<T extends readonly string[]> = T[number];

/**
 * Common size variants
 */
export const COMMON_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type CommonSize = typeof COMMON_SIZES[number];

/**
 * Common color variants
 */
export const COMMON_VARIANTS = ['default', 'primary', 'secondary', 'danger', 'success', 'warning', 'error', 'info'] as const;
export type CommonVariant = typeof COMMON_VARIANTS[number];

/**
 * State variants
 */
export const STATE_VARIANTS = ['default', 'hover', 'focus', 'active', 'disabled', 'loading'] as const;
export type StateVariant = typeof STATE_VARIANTS[number];

/**
 * Responsive breakpoint keys
 */
export const BREAKPOINT_KEYS = ['mobile', 'tablet', 'desktop', 'wide', 'ultrawide'] as const;
export type BreakpointKey = typeof BREAKPOINT_KEYS[number];

/**
 * Spacing scale keys
 */
export const SPACING_KEYS = ['0', '1', '2', '3', '4', '6', '8', '12', '16', '20', '24'] as const;
export type SpacingKey = typeof SPACING_KEYS[number];

/**
 * Polymorphic component props
 */
export interface PolymorphicProps<T extends React.ElementType = React.ElementType> {
  as?: T;
  children?: React.ReactNode;
}

/**
 * Polymorphic component type
 */
export type PolymorphicComponent<P extends object = object, T extends React.ElementType = React.ElementType> = React.ForwardRefExoticComponent<
  P & PolymorphicProps<T> & React.ComponentPropsWithoutRef<T>
>;
