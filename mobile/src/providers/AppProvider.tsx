import React, { useEffect } from 'react';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { initDatabase } from '@/services/localDb';
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
