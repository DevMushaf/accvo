import { Image, Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useTheme } from '@/providers/ThemeProvider';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import { SUPPORTED_CURRENCIES } from '@/utils/currency';

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  async function handleGetStarted() {
    await updateSettings({ hasSeenOnboarding: true });
    onComplete();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Image
            source={require('../../assets/images/logo-transparent.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.bold }]}>
            Welcome to Accvo
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
            Set up your business details to get started with invoices and income tracking.
          </Text>

          <Input
            label="Business name"
            value={settings.businessName}
            onChangeText={(businessName) => void updateSettings({ businessName })}
            placeholder="My Business"
          />

          <Text style={[styles.label, { color: colors.text, fontFamily: fontFamily.medium }]}>
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
        </View>

        <View style={styles.footer}>
          <Button title="Get started" onPress={() => void handleGetStarted()} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl },
  logo: { width: 200, aspectRatio: 612 / 408, alignSelf: 'center', marginBottom: spacing.lg },
  title: { fontSize: typography.xxl, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: typography.base, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  label: { fontSize: typography.sm, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, minWidth: 72 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
