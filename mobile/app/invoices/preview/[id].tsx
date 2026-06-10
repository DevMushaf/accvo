import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DocumentPreview } from '@/components/DocumentPreview';
import { InvoiceTemplateStrip } from '@/components/InvoiceTemplateStrip';
import { OverflowMenu } from '@/components/OverflowMenu';
import { useBusinessLogoDataUri } from '@/hooks/useBusinessLogoDataUri';
import { useTheme } from '@/providers/ThemeProvider';
import {
  deleteInvoice,
  duplicateInvoice,
  getInvoiceById,
} from '@/services/invoiceRepository';
import { exportAndShareInvoice, getInvoicePreviewHtml } from '@/services/pdfService';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import type { Invoice } from '@/types/invoice';
import type { InvoiceTemplate } from '@/types/invoiceTemplate';

export default function InvoicePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const logoDataUri = useBusinessLogoDataUri();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [sharing, setSharing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(settings.invoiceTemplate);
  const saveTemplateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPreviewTemplate(settings.invoiceTemplate);
  }, [settings.invoiceTemplate]);

  useEffect(
    () => () => {
      if (saveTemplateTimer.current) clearTimeout(saveTemplateTimer.current);
    },
    [],
  );

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
    return getInvoicePreviewHtml(
      invoice,
      { ...settings, invoiceTemplate: previewTemplate },
      logoDataUri,
    );
  }, [invoice, settings, previewTemplate, logoDataUri]);

  function handleTemplateSelect(template: InvoiceTemplate) {
    setPreviewTemplate(template);
    if (saveTemplateTimer.current) clearTimeout(saveTemplateTimer.current);
    saveTemplateTimer.current = setTimeout(() => {
      void updateSettings({ invoiceTemplate: template });
    }, 350);
  }

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

  async function handleDuplicate() {
    if (!invoice) return;
    const copy = await duplicateInvoice(invoice.id);
    if (copy) {
      router.replace(`/invoices/preview/${copy.id}`);
    } else {
      Alert.alert('Error', 'Could not duplicate invoice.');
    }
  }

  function confirmDelete() {
    if (!invoice) return;
    Alert.alert('Delete invoice', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteInvoice(invoice.id);
          router.back();
        },
      },
    ]);
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: invoice ? `Invoice ${invoice.invoiceNumber}` : 'Invoice',
      headerRight: () => (
        <Pressable
          onPress={() => setMenuOpen(true)}
          hitSlop={12}
          style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }}
          accessibilityLabel="More options"
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
        </Pressable>
      ),
    });
  }, [navigation, invoice, colors.text]);

  if (!invoice) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading preview...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OverflowMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          { label: 'Edit invoice', onPress: () => router.push(`/invoices/edit/${invoice.id}`) },
          { label: 'Duplicate invoice', onPress: () => void handleDuplicate() },
          { label: 'Delete invoice', onPress: confirmDelete, destructive: true },
        ]}
      />

      <View style={styles.topSection}>
        <InvoiceTemplateStrip
          selectedId={previewTemplate}
          onSelect={handleTemplateSelect}
        />
      </View>

      <View style={styles.previewWrap}>
        <DocumentPreview html={html} />
      </View>

      <View
        style={[
          styles.actionBar,
          {
            paddingBottom: Math.max(insets.bottom, spacing.sm),
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => void handleShare()}
          disabled={sharing}
          style={[
            styles.shareBtn,
            { backgroundColor: colors.primary, opacity: sharing ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text style={[styles.shareBtnText, { fontFamily: fontFamily.semibold }]}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSection: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  previewWrap: {
    flex: 1,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 320,
  },
  actionBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 48,
    borderRadius: 24,
  },
  shareBtnText: {
    fontSize: typography.base,
    color: '#fff',
  },
});
