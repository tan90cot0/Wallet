/**
 * App Theme Configuration
 * Centralized styling and spacing system
 */

import { Dimensions, PixelRatio } from 'react-native';
import { colors } from './colors';

const { width, height } = Dimensions.get('window');

// Device dimensions
export const deviceWidth = width;
export const deviceHeight = height;

// Responsive sizing function
const scale = (size) => {
  const newSize = size * PixelRatio.getFontScale();
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Typography scale
export const typography = {
  sizes: {
    xs: scale(10),
    sm: scale(12),
    md: scale(14),
    lg: scale(16),
    xl: scale(18),
    xxl: scale(20),
    title: scale(24),
    heading: scale(28),
    display: scale(32),
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  families: {
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    bold: 'Montserrat-Bold',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
};

// Spacing scale (based on 8pt grid system)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// Border radius scale
export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
  circle: 9999,
};

// Shadow presets
export const shadows = {
  none: {
    elevation: 0,
    shadowOpacity: 0,
  },
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  xl: {
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
  },
};

// Component-specific styles
export const components = {
  button: {
    height: 50,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },
  input: {
    height: 48,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  header: {
    height: 60,
    paddingHorizontal: spacing.md,
  },
  modal: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    margin: spacing.lg,
  },
};

// Layout constants
export const layout = {
  cardWidth: width * 0.85,
  cardHeight: (width * 0.85) * 0.6,
  headerHeight: 100,
  footerHeight: 80,
  tabBarHeight: 60,
  statusBarHeight: 44, // iOS default
};

// Animation constants
export const animations = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  spring: {
    tension: 300,
    friction: 8,
  },
  easing: {
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
  },
};

// Theme object combining all constants
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
  layout,
  animations,
  deviceWidth,
  deviceHeight,
};

export default theme;
