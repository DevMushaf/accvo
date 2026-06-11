import { useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { BusinessCardContactFields, BusinessCardFrontFields, BusinessCardPersonFields } from '@/components/BusinessCardFields';
import { BusinessLogoSection } from '@/components/BusinessLogoSection';
import { TemplatePicker } from '@/components/TemplatePicker';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CardAccentPicker } from '@/components/CardAccentPicker';
import { CardCaptureModal } from '@/components/CardCaptureModal';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { DocumentPreview } from '@/components/DocumentPreview';
import { KeyboardAwareScreen } from '@/components/KeyboardAwareScreen';
import { OverflowMenu, type OverflowMenuItem } from '@/components/OverflowMenu';
import { useAfterTransition } from '@/hooks/useAfterTransition';
import { useBusinessLogoDataUri } from '@/hooks/useBusinessLogoDataUri';
import { useBusinessCardDraft } from '@/hooks/useBusinessCardDraft';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTheme } from '@/providers/ThemeProvider';
import {
  exportAndShareBusinessCard,
  exportAndShareBusinessCardFacePdf,
  getBusinessCardFacePreviewHtml,
  getBusinessCardPreviewHtml,
  shareBusinessCardPreviewPng,
} from '@/services/pdfService';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import { BUSINESS_CARD_TEMPLATE_OPTIONS, getCardAccentColor } from '@/types/businessCardTemplate';
import type { BusinessCardTemplate } from '@/types/businessCardTemplate';

type PreviewSide = 'both' | 'front' | 'back';
type CaptureTarget = 'preview' | 'front' | 'back';

const PREVIEW_TABS: { id: PreviewSide; label: string }[] = [
  { id: 'both', label: 'Both' },
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
];

export default function BusinessCardScreen() {
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const { draft, setField } = useBusinessCardDraft();
  const afterTransition = useAfterTransition();
  const logoDataUri = useBusinessLogoDataUri();
  const previewRef = useRef<View>(null);

  const [previewSide, setPreviewSide] = useState<PreviewSide>('both');
  const [sharing, setSharing] = useState(false);
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [captureTarget, setCaptureTarget] = useState<CaptureTarget | null>(null);
  const [captureHtml, setCaptureHtml] = useState('');

  const debouncedDraft = useDebouncedValue(draft, 200);
  const mergedSettings = useMemo(() => ({ ...settings, ...debouncedDraft }), [settings, debouncedDraft]);
  const accentColor = getCardAccentColor(settings.businessCardTemplate, settings.businessCardAccentColors);

  const html = useMemo(() => {
    if (!afterTransition) return '';
    if (previewSide === 'front') {
      return getBusinessCardFacePreviewHtml(mergedSettings, 'front', logoDataUri);
    }
    if (previewSide === 'back') {
      return getBusinessCardFacePreviewHtml(mergedSettings, 'back', logoDataUri);
    }
    return getBusinessCardPreviewHtml(mergedSettings, logoDataUri);
  }, [afterTransition, mergedSettings, logoDataUri, previewSide]);

  const reloadKey = `${previewSide}-${settings.businessCardTemplate}-${settings.businessLogoRevision}-${settings.showLogoOnBusinessCard}-${accentColor}-${JSON.stringify(debouncedDraft)}`;

  async function handleSharePdf() {
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

  async function handleShareFacePdf(side: 'front' | 'back') {
    Keyboard.dismiss();
    setSharing(true);
    try {
      await exportAndShareBusinessCardFacePdf({ ...settings, ...draft }, side);
    } catch {
      Alert.alert('Error', 'Could not share business card PDF.');
    } finally {
      setSharing(false);
    }
  }

  function startCapture(target: CaptureTarget) {
    Keyboard.dismiss();
    const current = { ...settings, ...draft };
    if (target === 'preview') {
      void capturePreviewImage();
      return;
    }
    setCaptureHtml(getBusinessCardFacePreviewHtml(current, target, logoDataUri));
    setCaptureTarget(target);
  }

  async function capturePreviewImage() {
    if (!previewRef.current) return;
    setSharing(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const uri = await captureRef(previewRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await shareBusinessCardPreviewPng(uri);
    } catch {
      Alert.alert('Error', 'Could not export card preview image.');
    } finally {
      setSharing(false);
    }
  }

  function handleCaptureComplete(uri: string) {
    void shareBusinessCardPreviewPng(uri).catch(() => {
      Alert.alert('Error', 'Could not share card image.');
    });
    setCaptureTarget(null);
    setCaptureHtml('');
  }

  const exportMenuItems: OverflowMenuItem[] = [
    { label: 'PDF — front only', onPress: () => void handleShareFacePdf('front') },
    { label: 'PDF — back only', onPress: () => void handleShareFacePdf('back') },
    { label: 'Image — front only', onPress: () => startCapture('front') },
    { label: 'Image — back only', onPress: () => startCapture('back') },
  ];

  function handleAccentChange(color: string) {
    void updateSettings({
      businessCardAccentColors: {
        ...settings.businessCardAccentColors,
        [settings.businessCardTemplate]: color,
      },
    });
  }

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      extraKeyboardSpace={24}
    >
      <Card style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
            Preview
          </Text>
          <View style={[styles.tabRow, { backgroundColor: colors.background }]}>
            {PREVIEW_TABS.map((tab) => {
              const active = previewSide === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setPreviewSide(tab.id)}
                  style={[
                    styles.tab,
                    active && { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: active ? colors.primary : colors.textSecondary,
                        fontFamily: active ? fontFamily.semibold : fontFamily.regular,
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={[styles.previewWrap, { height: previewSide === 'both' ? 460 : 280 }]}>
          <DocumentPreview ref={previewRef} html={html} reloadKey={reloadKey} />
        </View>
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
        <CardAccentPicker
          template={settings.businessCardTemplate}
          accentColors={settings.businessCardAccentColors}
          onChange={handleAccentChange}
        />
      </Card>

      <View style={styles.accordionStack}>
        <CollapsibleSection
          title="Front — brand"
          hint="Logo, company, slogan, website footer"
          defaultOpen
        >
          <BusinessCardFrontFields draft={draft} onChange={setField} />
          <BusinessLogoSection variant="card" />
        </CollapsibleSection>

        <CollapsibleSection title="Back — you" hint="Name and title on navy section">
          <BusinessCardPersonFields draft={draft} onChange={setField} />
        </CollapsibleSection>

        <CollapsibleSection title="Back — contact" hint="Phone, email, address">
          <BusinessCardContactFields draft={draft} onChange={setField} />
        </CollapsibleSection>
      </View>

      <Text style={[styles.saveHint, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Changes save automatically when you leave this screen.
      </Text>

      <View style={styles.actions}>
        <Button title="Share PDF" onPress={handleSharePdf} loading={sharing} style={styles.primaryBtn} />
        <Button
          title="Share image"
          variant="secondary"
          onPress={() => startCapture('preview')}
          loading={sharing}
          style={styles.secondaryBtn}
        />
      </View>

      <Pressable onPress={() => setExportMenuVisible(true)} style={styles.moreLink}>
        <Text style={[styles.moreLinkText, { color: colors.primary, fontFamily: fontFamily.medium }]}>
          More export options
        </Text>
      </Pressable>

      {settings.subscriptionTier === 'free' ? (
        <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          Free PDFs include a small Accvo credit. Upgrade to Pro to remove it.
        </Text>
      ) : null}

      <OverflowMenu visible={exportMenuVisible} onClose={() => setExportMenuVisible(false)} items={exportMenuItems} />

      <CardCaptureModal
        visible={captureTarget === 'front' || captureTarget === 'back'}
        html={captureHtml}
        onCaptured={handleCaptureComplete}
        onError={() => Alert.alert('Error', 'Could not export card image.')}
        onClose={() => {
          setCaptureTarget(null);
          setCaptureHtml('');
        }}
      />
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  previewCard: { marginBottom: 0, gap: spacing.sm },
  previewHeader: { gap: spacing.sm },
  previewTitle: { fontSize: typography.base },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabLabel: { fontSize: typography.sm },
  previewWrap: { width: '100%' },
  section: { marginBottom: 0, gap: spacing.md },
  sectionTitle: { fontSize: typography.base, marginBottom: spacing.xs },
  accordionStack: { gap: spacing.sm },
  saveHint: { fontSize: typography.xs, textAlign: 'center', marginTop: -spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm },
  primaryBtn: { flex: 1 },
  secondaryBtn: { flex: 1 },
  moreLink: { alignItems: 'center', paddingVertical: spacing.xs },
  moreLinkText: { fontSize: typography.sm },
  hint: { fontSize: typography.xs, textAlign: 'center' },
});
