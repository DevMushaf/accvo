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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AppMenuDrawer } from '@/components/AppMenuDrawer';
import { SplashOverlay } from '@/components/SplashOverlay';
import { WelcomeGate } from '@/components/WelcomeGate';
import { AppMenuProvider } from '@/providers/AppMenuProvider';
import { AppProvider } from '@/providers/AppProvider';
import { useTheme } from '@/providers/ThemeProvider';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function NavigationStack() {
  const { colors } = useTheme();

  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.primary,
      headerTitleStyle: { fontFamily: 'Inter_600SemiBold' as const },
      contentStyle: { backgroundColor: colors.background },
      animation: 'slide_from_right' as const,
    }),
    [colors],
  );

  return (
    <WelcomeGate>
      <StatusBar style="dark" />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/index" options={{ title: 'Sign in' }} />
        <Stack.Screen name="invoices/create" options={{ title: 'New Invoice', presentation: 'modal' }} />
        <Stack.Screen name="invoices/edit/[id]" options={{ title: 'Edit Invoice' }} />
        <Stack.Screen name="invoices/[id]" options={{ title: 'Invoice' }} />
        <Stack.Screen name="invoices/preview/[id]" options={{ title: 'Invoice' }} />
        <Stack.Screen name="business-card/index" options={{ title: 'Business Card' }} />
        <Stack.Screen name="customers/create" options={{ title: 'New Customer', presentation: 'modal' }} />
        <Stack.Screen name="customers/[id]" options={{ title: 'Customer' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="analytics/index" options={{ title: 'Analytics' }} />
        <Stack.Screen name="recurring/index" options={{ title: 'Recurring Invoices' }} />
        <Stack.Screen name="recurring/create" options={{ title: 'New Recurring Invoice', presentation: 'modal' }} />
        <Stack.Screen name="recurring/[id]" options={{ title: 'Recurring Invoice' }} />
        <Stack.Screen name="upgrade/index" options={{ title: 'Upgrade to Pro' }} />
      </Stack>
    </WelcomeGate>
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
  const [splashVisible, setSplashVisible] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (!appReady || !splashVisible) return;

    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setSplashVisible(false);
    });
  }, [appReady, splashOpacity, splashVisible]);

  return (
    <View style={styles.root}>
      <AppProvider onBootstrapComplete={handleBootstrapComplete}>
        {appReady ? (
          <AppMenuProvider>
            <NavigationStack />
            <AppMenuDrawer />
          </AppMenuProvider>
        ) : null}
      </AppProvider>

      {splashVisible ? (
        <Animated.View
          style={[styles.splashLayer, { opacity: splashOpacity }]}
          pointerEvents={appReady ? 'none' : 'auto'}
          collapsable={false}
        >
          <SplashOverlay onMinDurationElapsed={handleMinSplashElapsed} />
        </Animated.View>
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
