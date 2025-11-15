/**
 * UI constants for consistent spacing, layout, and styling across the application
 * These values correspond to design tokens defined in globals.css
 */

/**
 * Standard page container max-width
 * Use this for consistent page content width across the app
 */
export const PAGE_CONTAINER_CLASS = 'max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8';

/**
 * Container size classes
 */
export const CONTAINER_SIZES = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1280px]',
  '2xl': 'max-w-[1536px]',
  page: 'max-w-[1280px]',
} as const;

export type ContainerSize = keyof typeof CONTAINER_SIZES;

/**
 * Get container class for a given size
 */
export function getContainerClass(size: ContainerSize = 'page'): string {
  return `${CONTAINER_SIZES[size]} mx-auto px-4 sm:px-6 lg:px-8`;
}

/**
 * Spacing scale (matches CSS variables)
 */
export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
} as const;

/**
 * Common spacing classes for consistent gaps and padding
 */
export const SPACING_CLASSES = {
  xs: 'gap-1 p-1',
  sm: 'gap-2 p-2',
  md: 'gap-3 p-3',
  lg: 'gap-4 p-4',
  xl: 'gap-6 p-6',
  '2xl': 'gap-8 p-8',
} as const;

/**
 * Border radius scale
 */
export const RADIUS = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.625rem',
  xl: '0.875rem',
  '2xl': '1rem',
} as const;

/**
 * Shadow classes (maps to CSS variables)
 */
export const SHADOW_CLASSES = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  none: 'shadow-none',
} as const;

export type ShadowSize = keyof typeof SHADOW_CLASSES;

/**
 * Card styling presets
 */
export const CARD_STYLES = {
  default: 'bg-card text-card-foreground rounded-lg border border-border',
  elevated: 'bg-card text-card-foreground rounded-lg shadow-md',
  interactive: 'bg-card text-card-foreground rounded-lg border border-border hover:shadow-lg transition-shadow',
} as const;

export type CardStyle = keyof typeof CARD_STYLES;

/**
 * Get card classes for a given style
 */
export function getCardClasses(style: CardStyle = 'default'): string {
  return CARD_STYLES[style];
}

/**
 * Typography classes for consistent text styling
 */
export const TYPOGRAPHY = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-bold tracking-tight',
  h3: 'text-2xl font-semibold tracking-tight',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',
  body: 'text-base',
  small: 'text-sm',
  xs: 'text-xs',
  muted: 'text-sm text-muted-foreground',
  lead: 'text-xl text-muted-foreground',
} as const;

export type TypographyVariant = keyof typeof TYPOGRAPHY;

/**
 * Get typography classes for a given variant
 */
export function getTypographyClasses(variant: TypographyVariant = 'body'): string {
  return TYPOGRAPHY[variant];
}

/**
 * Button size classes
 */
export const BUTTON_SIZES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-6 text-base',
  xl: 'h-12 px-8 text-lg',
  icon: 'h-9 w-9',
} as const;

export type ButtonSize = keyof typeof BUTTON_SIZES;

/**
 * Common transition classes
 */
export const TRANSITIONS = {
  all: 'transition-all duration-200 ease-in-out',
  colors: 'transition-colors duration-200 ease-in-out',
  opacity: 'transition-opacity duration-200 ease-in-out',
  transform: 'transition-transform duration-200 ease-in-out',
  shadow: 'transition-shadow duration-200 ease-in-out',
} as const;

export type TransitionType = keyof typeof TRANSITIONS;

/**
 * Focus ring classes for accessibility
 */
export const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/**
 * Common layout classes
 */
export const LAYOUT = {
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-start',
  flexEnd: 'flex items-end',
  gridCols2: 'grid grid-cols-1 md:grid-cols-2',
  gridCols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
} as const;

export type LayoutType = keyof typeof LAYOUT;
