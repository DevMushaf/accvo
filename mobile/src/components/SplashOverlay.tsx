import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef } from 'react';
import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { waitMinSplashDuration } from '@/constants/splash';
import { fontFamily, typography } from '@/theme';

interface SplashOverlayProps {
  style?: ViewStyle;
  onMinDurationElapsed?: () => void;
}

export function SplashOverlay({ style, onMinDurationElapsed }: SplashOverlayProps) {
  const timerStarted = useRef(false);

  const handleLayout = useCallback(() => {
    void SplashScreen.hideAsync();

    if (timerStarted.current) return;
    timerStarted.current = true;

    void waitMinSplashDuration().then(() => {
      onMinDurationElapsed?.();
    });
  }, [onMinDurationElapsed]);

  return (
    <View style={[styles.container, style]} onLayout={handleLayout} collapsable={false}>
      <StatusBar style="dark" />
      <Image
        source={require('../../assets/images/logo-transparent.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Create invoices in seconds</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 280,
    height: 186,
  },
  tagline: {
    marginTop: 12,
    fontSize: typography.base,
    fontFamily: fontFamily.medium,
    color: '#0056B3',
    textAlign: 'center',
  },
});
