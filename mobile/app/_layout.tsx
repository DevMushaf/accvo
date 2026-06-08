import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import 'react-native-reanimated';

import { AppProvider } from '@/providers/AppProvider';
import { BootstrapProvider } from '@/providers/BootstrapContext';
import { useTheme } from '@/providers/ThemeProvider';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function NavigationStack() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="invoices/create" options={{ title: 'New Invoice', presentation: 'modal' }} />
        <Stack.Screen name="invoices/[id]" options={{ title: 'Invoice' }} />
        <Stack.Screen name="customers/create" options={{ title: 'New Customer', presentation: 'modal' }} />
        <Stack.Screen name="customers/[id]" options={{ title: 'Customer' }} />
        <Stack.Screen name="upgrade/index" options={{ title: 'Upgrade to Pro' }} />
      </Stack>
    </>
  );
}

function RootLayoutContent() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [appReady, setAppReady] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);

  const handleAppReady = useCallback(() => {
    setAppReady(true);
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    async function hideSplash() {
      if (fontsLoaded && appReady && !splashHidden) {
        await SplashScreen.hideAsync();
        setSplashHidden(true);
      }
    }
    void hideSplash();
  }, [fontsLoaded, appReady, splashHidden]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <BootstrapProvider isReady={appReady} onReady={handleAppReady}>
      <AppProvider>
        <NavigationStack />
      </AppProvider>
    </BootstrapProvider>
  );
}

export default function RootLayout() {
  return <RootLayoutContent />;
}
