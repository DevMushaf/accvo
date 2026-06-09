import { useRouter, usePathname, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useSettingsStore } from '@/store/settingsStore';

const PUBLIC_PATHS = ['/welcome', '/auth', '/upgrade'];

export function WelcomeGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoaded = useSettingsStore((s) => s.isLoaded);
  const hasSeenWelcome = useSettingsStore((s) => s.settings.hasSeenWelcome);

  useEffect(() => {
    if (!isLoaded) return;

    const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

    if (!hasSeenWelcome && !isPublic) {
      router.replace('/welcome' as Href);
    }
  }, [hasSeenWelcome, isLoaded, pathname, router]);

  return <>{children}</>;
}
