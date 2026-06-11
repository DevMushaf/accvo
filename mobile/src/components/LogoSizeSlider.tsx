import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, spacing, typography } from '@/theme';

const MIN_SCALE = 0.45;
const MAX_SCALE = 1.6;

interface LogoSizeSliderProps {
  value: number;
  onValueChange: (scale: number) => void;
  onSlidingComplete: (scale: number) => void;
}

export function LogoSizeSlider({ value, onValueChange, onSlidingComplete }: LogoSizeSliderProps) {
  const { colors } = useTheme();
  const percent = Math.round(value * 100);

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text, fontFamily: fontFamily.medium }]}>
          Logo size on invoices
        </Text>
        <Text style={[styles.value, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          {percent}%
        </Text>
      </View>
      <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Drag the slider to resize
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={MIN_SCALE}
        maximumValue={MAX_SCALE}
        step={0.05}
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
      <View style={styles.tickRow}>
        <Text style={[styles.tick, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>Smaller</Text>
        <Text style={[styles.tick, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>Larger</Text>
      </View>
    </View>
  );
}

export { MIN_SCALE as LOGO_SCALE_MIN, MAX_SCALE as LOGO_SCALE_MAX };

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xs },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: { fontSize: typography.sm },
  value: { fontSize: typography.sm },
  hint: { fontSize: typography.xs, marginBottom: spacing.xs },
  slider: { width: '100%', height: 40 },
  tickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  tick: { fontSize: typography.xs },
});
