import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, spacing, typography } from '@/theme';

interface TemplateOption {
  id: string;
  label: string;
  description: string;
  accentColor: string;
}

interface TemplatePickerProps {
  options: TemplateOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function TemplatePicker({ options, selectedId, onSelect }: TemplatePickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.list}>
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[
              styles.card,
              {
                borderColor: selected ? option.accentColor : colors.border,
                backgroundColor: selected ? colors.primaryLight : colors.surface,
              },
            ]}
          >
            <View style={[styles.swatch, { backgroundColor: option.accentColor }]} />
            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: colors.text, fontFamily: fontFamily.semibold }]}>
                {option.label}
              </Text>
              <Text style={[styles.description, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
                {option.description}
              </Text>
            </View>
            {selected ? (
              <View style={[styles.check, { backgroundColor: option.accentColor }]}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 72,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: typography.base,
    marginBottom: 2,
  },
  description: {
    fontSize: typography.sm,
    lineHeight: 18,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
