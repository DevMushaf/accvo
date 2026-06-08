export const palette = {
  primary: '#0056B3',
  primaryDark: '#004494',
  primaryLight: '#E8F1FB',
  accent: '#3B9BFF',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  neutral900: '#111827',
  neutral600: '#4B5563',
  neutral200: '#E5E7EB',
  neutral50: '#F9FAFB',
  surface: '#FFFFFF',
  darkBg: '#0B1220',
  darkSurface: '#151D2E',
} as const;

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  tabBar: string;
  tabBarBorder: string;
}

export const lightTheme: ThemeColors = {
  background: palette.neutral50,
  surface: palette.surface,
  text: palette.neutral900,
  textSecondary: palette.neutral600,
  border: palette.neutral200,
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  primaryLight: palette.primaryLight,
  accent: palette.accent,
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  tabBar: palette.surface,
  tabBarBorder: palette.neutral200,
};

export const darkTheme: ThemeColors = {
  background: palette.darkBg,
  surface: palette.darkSurface,
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#1F2937',
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  primaryLight: '#1E3A5F',
  accent: palette.accent,
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  tabBar: palette.darkSurface,
  tabBarBorder: '#1F2937',
};
