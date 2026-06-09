import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { useTheme } from '@/providers/ThemeProvider';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';

export function GuestPromptBanner() {
  const router = useRouter();
  const { colors } = useTheme();
  const authMode = useSettingsStore((s) => s.settings.authMode);
  const hasDismissedGuestBanner = useSettingsStore((s) => s.settings.hasDismissedGuestBanner);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  if (authMode !== 'guest' || hasDismissedGuestBanner) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.semibold }]}>
            Save your invoices by signing in
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
            Sync across devices with an account — coming soon.
          </Text>
        </View>
        <Pressable
          onPress={() => void updateSettings({ hasDismissedGuestBanner: true })}
          hitSlop={8}
          accessibilityLabel="Dismiss"
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
      <Pressable onPress={() => router.push('/auth/index' as Href)}>
        <Text style={[styles.link, { color: colors.primary, fontFamily: fontFamily.medium }]}>
          Sign in when ready
        </Text>
      </Pressable>
    </Card>
  );
}

export function BusinessSetupCard() {
  const router = useRouter();
  const { colors } = useTheme();
  const businessName = useSettingsStore((s) => s.settings.businessName);

  if (businessName !== 'My Business') {
    return null;
  }

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.semibold }]}>
        Set up your business
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Add your business name and currency so invoices look professional.
      </Text>
      <Pressable onPress={() => router.push('/settings')} style={styles.setupLink}>
        <Text style={[styles.link, { color: colors.primary, fontFamily: fontFamily.medium }]}>
          Open Settings
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: typography.base,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sm,
    lineHeight: 20,
  },
  setupLink: {
    marginTop: spacing.sm,
  },
  link: {
    fontSize: typography.sm,
  },
});
