import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { palette } from '@/theme/colors';

export function SplashOverlay() {
  const scale = useSharedValue(0.92);
  const pulse = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 400 });
    pulse.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      true,
    );
  }, [pulse, scale]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulse.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={logoStyle}>
        <Image
          source={require('../../assets/images/splash-icon.png')}
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
    backgroundColor: palette.primary,
  },
  logo: {
    width: 140,
    height: 140,
  },
});
