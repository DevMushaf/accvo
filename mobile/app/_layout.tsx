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
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { SplashOverlay } from '@/components/SplashOverlay';
import { AppProvider } from '@/providers/AppProvider';
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
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="upgrade/index" options={{ title: 'Upgrade to Pro' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [bootstrapped, setBootstrapped] = useState(false);
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  const handleBootstrapComplete = useCallback(() => {
    setBootstrapped(true);
  }, []);

  const handleMinSplashElapsed = useCallback(() => {
    setMinSplashElapsed(true);
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  const appReady = fontsLoaded && bootstrapped && minSplashElapsed;

  return (
    <View style={styles.root}>
      <AppProvider onBootstrapComplete={handleBootstrapComplete}>
        {appReady ? <NavigationStack /> : null}
      </AppProvider>

      {!appReady ? (
        <View style={styles.splashLayer} pointerEvents="auto" collapsable={false}>
          <SplashOverlay onMinDurationElapsed={handleMinSplashElapsed} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
});
