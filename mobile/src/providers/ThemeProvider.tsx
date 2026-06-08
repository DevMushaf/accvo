import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import { darkTheme, lightTheme, type ThemeColors, type ThemeMode } from '@/theme/colors';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const themeMode = useSettingsStore((s) => s.settings.themeMode);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkTheme : lightTheme,
      isDark,
      themeMode,
      setThemeMode: (mode) => {
        void updateSettings({ themeMode: mode });
      },
    }),
    [isDark, themeMode, updateSettings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
