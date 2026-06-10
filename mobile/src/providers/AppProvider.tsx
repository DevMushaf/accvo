import React, { useEffect } from 'react';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { initDatabase, resetDatabaseCache } from '@/services/localDb';
import { useSettingsStore } from '@/store/settingsStore';

interface AppProviderProps {
  children: React.ReactNode;
  onBootstrapComplete: () => void;
}

export function AppProvider({ children, onBootstrapComplete }: AppProviderProps) {
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (__DEV__) {
        await resetDatabaseCache();
      }
      await initDatabase();
      await loadSettings();
      if (!cancelled) {
        onBootstrapComplete();
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [loadSettings, onBootstrapComplete]);

  return <ThemeProvider>{children}</ThemeProvider>;
}
