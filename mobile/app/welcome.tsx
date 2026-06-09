import { useRouter, type Href } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  async function continueAsGuest() {
    await updateSettings({ hasSeenWelcome: true, authMode: 'guest' });
    router.replace('/(tabs)');
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.decorCircle, styles.decorTop, { backgroundColor: colors.primaryLight }]} />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: spacing.md },
        ]}
      >
        <Image
          source={require('../assets/images/welcome-illustration.png')}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityLabel="Invoice illustration"
        />

        <Text style={[styles.headline, { color: colors.text, fontFamily: fontFamily.bold }]}>
          Start creating invoices instantly
        </Text>
        <Text style={[styles.subtext, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          No account needed. Save your data by signing in anytime.
        </Text>
      </View>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + spacing.md,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Button title="Continue as Guest" onPress={() => void continueAsGuest()} />
        <Button
          title="Sign in / Sign up"
          variant="secondary"
          onPress={() => router.push('/auth/index' as Href)}
        />
        <Pressable
          onPress={() => router.push('/upgrade')}
          style={styles.upgradeLink}
          accessibilityRole="link"
        >
          <Text style={[styles.upgradeText, { color: colors.primary, fontFamily: fontFamily.medium }]}>
            Upgrade to Pro
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
  },
  decorTop: {
    width: 200,
    height: 200,
    top: -50,
    right: -70,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  illustration: {
    width: 260,
    height: 202,
    marginBottom: spacing.md,
  },
  headline: {
    fontSize: typography.lg,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: spacing.sm,
    maxWidth: 320,
  },
  subtext: {
    fontSize: typography.base,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  upgradeLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    minHeight: 40,
    justifyContent: 'center',
  },
  upgradeText: {
    fontSize: typography.sm,
  },
});
