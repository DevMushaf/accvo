import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/Button';
import { DocumentPreview } from '@/components/DocumentPreview';
import { useBusinessLogoDataUri } from '@/hooks/useBusinessLogoDataUri';
import { useTheme } from '@/providers/ThemeProvider';
import { getInvoiceById } from '@/services/invoiceRepository';
import { exportAndShareInvoice, getInvoicePreviewHtml } from '@/services/pdfService';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import type { Invoice } from '@/types/invoice';

export default function InvoicePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const logoDataUri = useBusinessLogoDataUri();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [sharing, setSharing] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!id) return;
    const data = await getInvoiceById(id);
    setInvoice(data);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadInvoice();
    }, [loadInvoice]),
  );

  const html = useMemo(() => {
    if (!invoice) return '';
    return getInvoicePreviewHtml(invoice, settings, logoDataUri);
  }, [invoice, settings, logoDataUri]);

  async function handleShare() {
    if (!invoice) return;
    setSharing(true);
    try {
      await exportAndShareInvoice(invoice, settings);
    } catch {
      Alert.alert('Error', 'Could not share PDF.');
    } finally {
      setSharing(false);
    }
  }

  if (!invoice) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading preview...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.previewWrap}>
        <DocumentPreview html={html} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          Template: {settings.invoiceTemplate.charAt(0).toUpperCase() + settings.invoiceTemplate.slice(1)}
          {settings.subscriptionTier === 'free' ? ' · Watermark on free plan' : ''}
        </Text>
        <Button title="Share PDF" onPress={handleShare} loading={sharing} />
        <Button
          title="Change template in Settings"
          variant="secondary"
          onPress={() => router.push('/settings')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewWrap: {
    flex: 1,
    minHeight: 480,
  },
  footer: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.sm,
    textAlign: 'center',
  },
});
