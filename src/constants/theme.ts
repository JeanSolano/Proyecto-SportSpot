/**
 * SportSpot Theme Configuration
 * Color palette based on brand identity with green/blue gradients
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Primary brand colors
    primary: '#00CA4E',        // Verde brillante (principal)
    secondary: '#0066FF',      // Azul
    accent: '#FF7F00',         // Naranja
    danger: '#E63946',         // Rojo

    // Typography
    text: '#333333',           // Gris oscuro principal
    textSecondary: '#666666',  // Gris medio
    textTertiary: '#999999',   // Gris claro

    // Backgrounds
    background: '#FFFFFF',
    backgroundElement: '#F5F5F5',
    backgroundSelected: '#E8F5E9',

    // Surfaces & inputs
    surface: '#FFFFFF',        // Cards elevadas
    border: '#E8E8E8',         // Bordes de inputs y separadores
    inputBackground: '#F7F7F7', // Fondo de campos de texto

    // States
    success: '#00CA4E',
    warning: '#FF7F00',
    error: '#E63946',
    info: '#0066FF',
  },
  dark: {
    // Primary brand colors (adjusted for dark mode)
    primary: '#00E85C',
    secondary: '#0088FF',
    accent: '#FF9F3F',
    danger: '#FF6B7A',

    // Typography
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textTertiary: '#999999',

    // Backgrounds
    background: '#0F0F0F',
    backgroundElement: '#1A1A1A',
    backgroundSelected: '#1E3A1F',

    // Surfaces & inputs
    surface: '#1C1C1C',
    border: '#2C2C2C',
    inputBackground: '#232323',

    // States
    success: '#00E85C',
    warning: '#FF9F3F',
    error: '#FF6B7A',
    info: '#0088FF',
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

export const Gradients = {
  header: {
    colors: ['#00CA4E', '#00A86B', '#0066FF'] as string[],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  buttonPrimary: {
    colors: ['#00CA4E', '#0066FF'] as string[],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  splash: {
    colors: ['#00CA4E', '#00A86B', '#0044CC'] as string[],
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
