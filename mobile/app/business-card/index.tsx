import { useMemo, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, View } from 'react-native';

import { BusinessLogoSection } from '@/components/BusinessLogoSection';
import { BusinessProfileFields } from '@/components/BusinessProfileFields';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DocumentPreview } from '@/components/DocumentPreview';
import { KeyboardAwareScreen } from '@/components/KeyboardAwareScreen';
import { TemplatePicker } from '@/components/TemplatePicker';
import { useAfterTransition } from '@/hooks/useAfterTransition';
import { useBusinessLogoDataUri } from '@/hooks/useBusinessLogoDataUri';
import { useBusinessProfileDraft } from '@/hooks/useBusinessProfileDraft';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTheme } from '@/providers/ThemeProvider';
import { exportAndShareBusinessCard, getBusinessCardPreviewHtml } from '@/services/pdfService';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import { BUSINESS_CARD_TEMPLATE_OPTIONS } from '@/types/businessCardTemplate';
import type { BusinessCardTemplate } from '@/types/businessCardTemplate';

export default function BusinessCardScreen() {
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const { draft, setField } = useBusinessProfileDraft();
  const afterTransition = useAfterTransition();
  const logoDataUri = useBusinessLogoDataUri();
  const [sharing, setSharing] = useState(false);

  const debouncedDraft = useDebouncedValue(draft, 700);
  const html = useMemo(() => {
    if (!afterTransition) return '';
    const merged = { ...settings, ...debouncedDraft };
    return getBusinessCardPreviewHtml(merged, logoDataUri);
  }, [afterTransition, settings, debouncedDraft, logoDataUri]);

  async function handleShare() {
    Keyboard.dismiss();
    setSharing(true);
    try {
      await exportAndShareBusinessCard({ ...settings, ...draft });
    } catch {
      Alert.alert('Error', 'Could not share business card PDF.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      extraKeyboardSpace={24}
    >
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Design your card, fill in details, and share as a PDF.
      </Text>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          Your details
        </Text>
        <BusinessLogoSection />
        <BusinessProfileFields draft={draft} onChange={setField} />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          Card design
        </Text>
        <TemplatePicker
          options={BUSINESS_CARD_TEMPLATE_OPTIONS}
          selectedId={settings.businessCardTemplate}
          onSelect={(id) => void updateSettings({ businessCardTemplate: id as BusinessCardTemplate })}
        />
      </Card>

      <View style={styles.previewWrap}>
        <Text style={[styles.previewLabel, { color: colors.textSecondary, fontFamily: fontFamily.medium }]}>
          Preview
        </Text>
        <DocumentPreview html={html} />
      </View>

      <Button title="Share business card PDF" onPress={handleShare} loading={sharing} />
      {settings.subscriptionTier === 'free' ? (
        <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          Free PDFs include a small Accvo credit. Upgrade to Pro to remove it.
        </Text>
      ) : null}
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  subtitle: { fontSize: typography.sm, lineHeight: 20 },
  previewWrap: { height: 220, gap: spacing.xs },
  previewLabel: { fontSize: typography.sm },
  section: { marginBottom: 0 },
  sectionTitle: { fontSize: typography.base, marginBottom: spacing.sm },
  hint: { fontSize: typography.xs, textAlign: 'center' },
});
