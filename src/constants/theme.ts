/**
 * SportSpot Theme Configuration
 * Color palette based on brand identity with green/blue gradients
 */

import '@/global.css';

import { Platform } from 'react-native';

// Brand colors extracted from the official SportSpot logo
// Pin: green (#56B330) → orange-red (#F4511E) → blue (#1E7FE0)
// Text: "Sport" #3B5CC4 · "Spot" navy #1B2880
export const Colors = {
  light: {
    // Primary brand colors — from logo
    primary: '#56B330',        // Verde logo (pin superior)
    secondary: '#1E7FE0',      // Azul logo (pin derecho)
    accent: '#F4511E',         // Naranja-rojo logo (base del pin)
    navy: '#1B2880',           // Azul marino (texto "Spot")
    danger: '#E63946',         // Rojo error

    // Typography
    text: '#1A1A2E',           // Casi negro con tinte navy del logo
    textSecondary: '#5A5A72',  // Gris medio con tinte
    textTertiary: '#9A9AB0',   // Gris claro

    // Backgrounds
    background: '#FFFFFF',
    backgroundElement: '#F4F6FB',  // Tinte azul muy suave
    backgroundSelected: '#EDF6E6', // Tinte verde muy suave

    // Surfaces & inputs
    surface: '#FFFFFF',
    border: '#E2E6F0',
    inputBackground: '#F4F6FB',

    // States
    success: '#56B330',
    warning: '#F4511E',
    error: '#E63946',
    info: '#1E7FE0',
  },
  dark: {
    // Primary brand colors — brightened for dark mode
    primary: '#6DD43E',
    secondary: '#4196F0',
    accent: '#FF6B3D',
    navy: '#4A6AE0',
    danger: '#FF6B7A',

    // Typography
    text: '#FFFFFF',
    textSecondary: '#CCCCDD',
    textTertiary: '#8888AA',

    // Backgrounds
    background: '#0D0D1A',
    backgroundElement: '#161628',
    backgroundSelected: '#1A3010',

    // Surfaces & inputs
    surface: '#1A1A2E',
    border: '#2A2A44',
    inputBackground: '#1E1E34',

    // States
    success: '#6DD43E',
    warning: '#FF6B3D',
    error: '#FF6B7A',
    info: '#4196F0',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// Gradients mirror the logo pin: green (top-left) → orange-red (center) → blue (right)
export const Gradients = {
  header: {
    colors: ['#56B330', '#F4511E', '#1B2880'] as string[],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  buttonPrimary: {
    colors: ['#56B330', '#1E7FE0'] as string[],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  splash: {
    colors: ['#56B330', '#F4511E', '#1B2880'] as string[],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const Typography = {
  displayLg:  { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  displayMd:  { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  heading:    { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
  subheading: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  body:       { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold:   { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption:    { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  badge:      { fontSize: 11, fontWeight: '700' as const, lineHeight: 16 },
} as const;
