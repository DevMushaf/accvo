import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { waitMinSplashDuration } from '@/constants/splash';

interface SplashOverlayProps {
  style?: ViewStyle;
  onMinDurationElapsed?: () => void;
}

export function SplashOverlay({ style, onMinDurationElapsed }: SplashOverlayProps) {
  const scale = useSharedValue(0.92);
  const pulse = useSharedValue(1);
  const timerStarted = useRef(false);

  React.useEffect(() => {
    scale.value = withTiming(1, { duration: 400 });
    pulse.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      true,
    );
  }, [pulse, scale]);

  const handleLayout = useCallback(() => {
    void SplashScreen.hideAsync();

    if (timerStarted.current) {
      return;
    }
    timerStarted.current = true;

    void waitMinSplashDuration().then(() => {
      onMinDurationElapsed?.();
    });
  }, [onMinDurationElapsed]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulse.value }],
  }));

  return (
    <View style={[styles.container, style]} onLayout={handleLayout} collapsable={false}>
      <StatusBar style="dark" />
      <Animated.View style={logoStyle}>
        <Image
          source={require('../../assets/images/logo-transparent.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
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
    width: 300,
    height: 200,
  },
});
