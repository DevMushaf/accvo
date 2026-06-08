import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { initDatabase } from '@/services/localDb';
import { useSettingsStore } from '@/store/settingsStore';
import { palette } from '@/theme/colors';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [ready, setReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    async function bootstrap() {
      await initDatabase();
      await loadSettings();
      setReady(true);
    }
    void bootstrap();
  }, [loadSettings]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return <ThemeProvider>{children}</ThemeProvider>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
});
