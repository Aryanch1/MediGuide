import { useWindowDimensions } from 'react-native';

/**
 * MediGuide design tokens — one consistent system for the whole app.
 * Theme: one calm teal (#0E7C7B) on clean light surfaces over a soft
 * mint/aurora gradient. Glass is the default surface; everything round.
 */

export const palette = {
  // Brand — one disciplined theme teal.
  primary: '#0E7C7B',
  primaryDeep: '#085250',
  primaryLight: '#1FA8A4',
  primarySoft: '#D3EFEA',
  primaryPale: '#E9F7F5',
  accent: '#F2B705',
  // Neutrals (teal-tinted so the whole UI feels one family).
  ink: '#102826',
  body: '#3D5A57',
  muted: '#7A918D',
  line: 'rgba(16, 40, 38, 0.10)',
  surface: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.62)',
  glassStrong: 'rgba(255, 255, 255, 0.78)',
  sheet: 'rgba(255, 255, 255, 0.86)',
  // Aurora background stops.
  aurora: ['#DDF2EE', '#F4FBF8', '#FFF7DC'] as const,
  // Status.
  warning: '#B7791F',
  warningSoft: '#FDF3DC',
  error: '#B3261E',
  errorSoft: '#FCE8E6',
  success: '#0E7C7B',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  card: 30,
  sheet: 38,
  pill: 999,
  input: 24,
} as const;

/**
 * Display typeface — Sora (bundled via @expo-google-fonts/sora, loaded
 * in app/_layout.tsx). Used for headlines, screen titles and big
 * numbers; body text stays on the system font.
 */
export const font = {
  display: 'Sora_800ExtraBold',
  bold: 'Sora_700Bold',
} as const;

export const type = {
  display: { fontFamily: font.display, fontSize: 42, lineHeight: 46, letterSpacing: -0.8 },
  displayWide: { fontFamily: font.display, fontSize: 56, lineHeight: 60, letterSpacing: -1 },
  title: { fontFamily: font.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  subtitle: { fontFamily: font.bold, fontSize: 17, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.6 },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 1.1 },
} as const;

export const shadows = {
  card: {
    shadowColor: '#085250',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  glow: {
    shadowColor: '#0E7C7B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  float: {
    shadowColor: '#102826',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export type Breakpoint = 'compact' | 'medium' | 'wide' | 'desktop';

export interface Responsive {
  breakpoint: Breakpoint;
  width: number;
  /** Max width for the centered content column. */
  contentMaxWidth: number;
  /** Horizontal page padding. */
  pad: number;
  /** Columns for card grids. */
  columns: number;
  /** Two-pane list + detail layout (foldable unfolded / tablet / desktop). */
  twoPane: boolean;
  display: typeof type.display | typeof type.displayWide;
}

export function useResponsive(): Responsive {
  const { width } = useWindowDimensions();
  if (width < 600) {
    return {
      breakpoint: 'compact',
      width,
      contentMaxWidth: width,
      pad: 20,
      columns: 1,
      twoPane: false,
      display: type.display,
    };
  }
  if (width < 840) {
    return {
      breakpoint: 'medium',
      width,
      contentMaxWidth: 640,
      pad: 28,
      columns: 1,
      twoPane: false,
      display: type.displayWide,
    };
  }
  if (width < 1280) {
    return {
      breakpoint: 'wide',
      width,
      contentMaxWidth: 1024,
      pad: 32,
      columns: 2,
      twoPane: true,
      display: type.displayWide,
    };
  }
  return {
    breakpoint: 'desktop',
    width,
    contentMaxWidth: 1120,
    pad: 40,
    columns: 3,
    twoPane: true,
    display: type.displayWide,
  };
}
