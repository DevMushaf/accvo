import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { useTheme } from '@/providers/ThemeProvider';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import { SUPPORTED_CURRENCIES } from '@/utils/currency';
import type { ThemeMode } from '@/theme/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, themeMode, setThemeMode } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const themeOptions: { label: string; value: ThemeMode }[] = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Customize your Accvo experience
      </Text>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          Business
        </Text>
        <Input
          label="Business name"
          value={settings.businessName}
          onChangeText={(businessName) => void updateSettings({ businessName })}
          placeholder="My Business"
        />
        <Text style={[styles.fieldLabel, { color: colors.text, fontFamily: fontFamily.medium }]}>
          Default currency
        </Text>
        <View style={styles.chipRow}>
          {SUPPORTED_CURRENCIES.map((currency) => (
            <Button
              key={currency}
              title={currency}
              variant={settings.defaultCurrency === currency ? 'primary' : 'secondary'}
              fullWidth={false}
              onPress={() => void updateSettings({ defaultCurrency: currency })}
              style={styles.chip}
            />
          ))}
        </View>
        <Input
          label="Default tax rate (%)"
          value={String(settings.defaultTaxRate)}
          onChangeText={(v) => {
            const rate = parseFloat(v) || 0;
            void updateSettings({ defaultTaxRate: rate });
          }}
          keyboardType="decimal-pad"
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          Appearance
        </Text>
        <View style={styles.chipRow}>
          {themeOptions.map((option) => (
            <Button
              key={option.value}
              title={option.label}
              variant={themeMode === option.value ? 'primary' : 'secondary'}
              fullWidth={false}
              onPress={() => setThemeMode(option.value)}
              style={styles.chip}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          Plan
        </Text>
        <Text style={[styles.planText, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          {settings.subscriptionTier === 'free'
            ? 'Free — unlimited invoices with Accvo watermark on PDFs'
            : 'Pro — all features unlocked'}
        </Text>
        {settings.subscriptionTier === 'free' ? (
          <View style={{ marginTop: spacing.md }}>
            <Button title="Upgrade to Pro" onPress={() => router.push('/upgrade')} />
          </View>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          About
        </Text>
        <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular }}>
          Accvo v1.0.0 — AI-powered business assistant for small service businesses.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  subtitle: { fontSize: typography.sm, marginBottom: spacing.md },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.base, marginBottom: spacing.sm },
  fieldLabel: { fontSize: typography.sm, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, minWidth: 72 },
  planText: { fontSize: typography.sm, lineHeight: 20 },
});
