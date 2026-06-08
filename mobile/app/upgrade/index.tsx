import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, spacing, typography } from '@/theme';

const PRO_FEATURES = [
  'Remove Accvo watermark from PDFs',
  'AI invoice generation (voice & text)',
  'Cloud backup and sync across devices',
  'Analytics dashboard',
  'Stripe payment links',
  'Auto reminders for unpaid invoices',
];

export default function UpgradeScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <ScreenHeader
        title="Upgrade to Pro"
        subtitle="Sign up when you're ready — no account needed for free features"
      />

      <Image
        source={require('../../assets/images/logo-transparent.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Card>
        {PRO_FEATURES.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Text style={[styles.bullet, { color: colors.accent }]}>✦</Text>
            <Text style={[styles.feature, { color: colors.text, fontFamily: fontFamily.regular }]}>
              {feature}
            </Text>
          </View>
        ))}
      </Card>

      <Card style={styles.comingSoon}>
        <Text style={[styles.comingTitle, { color: colors.primary, fontFamily: fontFamily.semibold }]}>
          Coming in Phase 2
        </Text>
        <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular, lineHeight: 20 }}>
          Account sign-up and Pro billing will be added when cloud features launch. For now, enjoy
          unlimited free invoices on your device.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  logo: { width: 120, height: 60, alignSelf: 'center', marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  bullet: { marginRight: spacing.sm, fontSize: typography.base },
  feature: { flex: 1, fontSize: typography.sm, lineHeight: 20 },
  comingSoon: { marginTop: spacing.md },
  comingTitle: { fontSize: typography.base, marginBottom: spacing.xs },
});
