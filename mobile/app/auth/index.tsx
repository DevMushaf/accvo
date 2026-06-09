import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';

export default function AuthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  async function continueAsGuest() {
    await updateSettings({ hasSeenWelcome: true, authMode: 'guest' });
    router.replace('/(tabs)');
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={require('../../assets/images/logo-icon-only.png')}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.bold }]}>
        Sign in to Accvo
      </Text>
      <Text style={[styles.body, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Cloud sync and account features are coming soon. Continue as guest to use Accvo locally
        today — all your invoices stay on this device.
      </Text>

      <View style={styles.actions}>
        <Button title="Continue as Guest" onPress={() => void continueAsGuest()} />
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 72,
    height: 72,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.xl,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: typography.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    maxWidth: 340,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
});
