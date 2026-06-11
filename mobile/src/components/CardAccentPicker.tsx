import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, radius, spacing, typography } from '@/theme';
import {
  getCardAccentColor,
  getCardAccentPresets,
  usesBrandColorPicker,
} from '@/types/businessCardTemplate';
import type { BusinessCardTemplate } from '@/types/businessCardTemplate';

interface CardAccentPickerProps {
  template: BusinessCardTemplate;
  accentColors: Partial<Record<BusinessCardTemplate, string>>;
  onChange: (color: string) => void;
}

export function CardAccentPicker({ template, accentColors, onChange }: CardAccentPickerProps) {
  const { colors } = useTheme();
  const selected = getCardAccentColor(template, accentColors);
  const presets = getCardAccentPresets(template);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fontFamily.medium }]}>
        {usesBrandColorPicker(template) ? 'Brand color' : 'Accent color'}
      </Text>
      <View style={styles.grid}>
        {presets.map((color) => {
          const active = selected.toLowerCase() === color.toLowerCase();
          return (
            <Pressable
              key={color}
              onPress={() => onChange(color)}
              accessibilityLabel={`Accent color ${color}`}
              style={[
                styles.swatch,
                { backgroundColor: color },
                active && { borderColor: colors.primary, borderWidth: 2 },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: spacing.sm },
  label: { fontSize: typography.sm },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
});
