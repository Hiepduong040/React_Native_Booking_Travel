/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// import { Platform } from 'react-native';

// const tintColorLight = '#0a7ea4';
// const tintColorDark = '#fff';

// export const Colors = {
//   light: {
//     text: '#11181C',
//     background: '#fff',
//     tint: tintColorLight,
//     icon: '#687076',
//     tabIconDefault: '#687076',
//     tabIconSelected: tintColorLight,
//   },
//   dark: {
//     text: '#ECEDEE',
//     background: '#151718',
//     tint: tintColorDark,
//     icon: '#9BA1A6',
//     tabIconDefault: '#9BA1A6',
//     tabIconSelected: tintColorDark,
//   },
// };

// export const Fonts = Platform.select({
//   ios: {
    
//     sans: 'system-ui',
     
//     serif: 'ui-serif',
    
//     rounded: 'ui-rounded',
    
//     mono: 'ui-monospace',
//   },
//   default: {
//     sans: 'normal',
//     serif: 'serif',
//     rounded: 'normal',
//     mono: 'monospace',
//   },
//   web: {
//     sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
//     serif: "Georgia, 'Times New Roman', serif",
//     rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
//     mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
//   },
// });
export const theme = {
  colors: {
    primary: '#6C63FF',
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E0E0E0',
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
};

// Default Colors object với light và dark mode support
export const Colors = {
  light: {
    text: theme.colors.text || '#1A1A1A',
    background: theme.colors.background || '#FFFFFF',
    tint: theme.colors.primary || '#6C63FF',
    icon: theme.colors.textSecondary || '#666666',
    tabIconDefault: theme.colors.textSecondary || '#666666',
    tabIconSelected: theme.colors.primary || '#6C63FF',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
  },
  // Backward compatibility
  ...theme.colors,
};
