import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BusinessLogoSection } from '@/components/BusinessLogoSection';
import { BusinessProfileFields } from '@/components/BusinessProfileFields';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Input } from '@/components/Input';
import { KeyboardAwareScreen } from '@/components/KeyboardAwareScreen';
import { TemplatePicker } from '@/components/TemplatePicker';
import { useAfterTransition } from '@/hooks/useAfterTransition';
import { useBusinessLogoDataUri } from '@/hooks/useBusinessLogoDataUri';
import { useBusinessProfileDraft } from '@/hooks/useBusinessProfileDraft';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTheme } from '@/providers/ThemeProvider';
import { getInvoicePreviewHtml } from '@/services/pdfService';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import { INVOICE_TEMPLATE_OPTIONS } from '@/types/invoiceTemplate';
import type { InvoiceTemplate } from '@/types/invoiceTemplate';
import { createSampleInvoice } from '@/utils/sampleInvoice';
import { SUPPORTED_CURRENCIES } from '@/utils/currency';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const { draft, setField } = useBusinessProfileDraft();
  const [taxRateInput, setTaxRateInput] = useState(String(settings.defaultTaxRate));

  const afterTransition = useAfterTransition();
  const logoDataUri = useBusinessLogoDataUri();
  const debouncedDraft = useDebouncedValue(draft, 700);
  const previewHtml = useMemo(() => {
    if (!afterTransition) return '';
    const merged = { ...settings, ...debouncedDraft };
    const sample = createSampleInvoice(merged);
    return getInvoicePreviewHtml(sample, merged, logoDataUri);
  }, [afterTransition, settings, debouncedDraft, logoDataUri]);

  function handleTaxRateBlur() {
    const rate = parseFloat(taxRateInput) || 0;
    void updateSettings({ defaultTaxRate: rate });
  }

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Customize your Accvo experience
      </Text>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          Business profile
        </Text>
        <Text style={[styles.fieldHint, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          Shown on invoices and your business card.
        </Text>
        <BusinessLogoSection />
        <BusinessProfileFields draft={draft} onChange={setField} />
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
          value={taxRateInput}
          onChangeText={setTaxRateInput}
          onBlur={handleTaxRateBlur}
          keyboardType="decimal-pad"
        />
        <Button title="Edit business card" variant="secondary" onPress={() => router.push('/business-card')} />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          Invoice PDF template
        </Text>
        <Text style={[styles.fieldHint, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          Pick a style — preview updates after you stop typing.
        </Text>
        <TemplatePicker
          options={INVOICE_TEMPLATE_OPTIONS}
          selectedId={settings.invoiceTemplate}
          onSelect={(id) => void updateSettings({ invoiceTemplate: id as InvoiceTemplate })}
        />
        <View style={styles.previewWrap}>
          <DocumentPreview
            html={previewHtml}
            reloadKey={`${settings.businessLogoRevision}-${settings.businessLogoScale}-${settings.invoiceTemplate}`}
          />
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
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  subtitle: { fontSize: typography.sm, marginBottom: spacing.md },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.base, marginBottom: spacing.sm },
  fieldLabel: { fontSize: typography.sm, marginBottom: spacing.xs },
  fieldHint: { fontSize: typography.sm, marginBottom: spacing.sm, lineHeight: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, minWidth: 72 },
  previewWrap: { height: 420, marginTop: spacing.sm },
  planText: { fontSize: typography.sm, lineHeight: 20 },
});
