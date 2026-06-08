import React, { useEffect, useState } from 'react';

import { SplashOverlay } from '@/components/SplashOverlay';
import { useBootstrap } from '@/providers/BootstrapContext';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { initDatabase } from '@/services/localDb';
import { useSettingsStore } from '@/store/settingsStore';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [ready, setReady] = useState(false);
  const { onReady } = useBootstrap();
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    async function bootstrap() {
      await initDatabase();
      await loadSettings();
      setReady(true);
      onReady();
    }
    void bootstrap();
  }, [loadSettings, onReady]);

  if (!ready) {
    return <SplashOverlay />;
  }

  return <ThemeProvider>{children}</ThemeProvider>;
}
