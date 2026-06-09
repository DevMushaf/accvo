import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { StatusChip } from '@/components/StatusChip';
import { useTheme } from '@/providers/ThemeProvider';
import { deleteInvoice, duplicateInvoice, getInvoiceById, updateInvoice } from '@/services/invoiceRepository';
import { exportAndShareInvoice } from '@/services/pdfService';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import { formatCurrency } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/dates';

const STATUS_OPTIONS: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue'];

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
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

  async function handleStatusChange(status: InvoiceStatus) {
    if (!invoice) return;
    const updated = await updateInvoice(invoice.id, { status });
    if (updated) setInvoice(updated);
  }

  async function handleDuplicate() {
    if (!invoice) return;
    const copy = await duplicateInvoice(invoice.id);
    if (copy) {
      router.push(`/invoices/${copy.id}`);
    } else {
      Alert.alert('Error', 'Could not duplicate invoice.');
    }
  }

  async function handleDelete() {
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

  if (!invoice) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <View style={styles.header}>
          <Text style={[styles.number, { color: colors.text, fontFamily: fontFamily.bold }]}>
            {invoice.invoiceNumber}
          </Text>
          <StatusChip status={invoice.status} />
        </View>
        <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular }}>
          {invoice.customerName ?? 'No customer'} · Issued {formatDisplayDate(invoice.issueDate)}
          {invoice.dueDate ? ` · Due ${formatDisplayDate(invoice.dueDate)}` : ''}
        </Text>
      </Card>

      {invoice.notes ? (
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
            Notes
          </Text>
          <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular, lineHeight: 20 }}>
            {invoice.notes}
          </Text>
        </Card>
      ) : null}

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          Line items
        </Text>
        {invoice.lineItems.map((item) => (
          <View key={item.id} style={[styles.lineRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontFamily: fontFamily.medium }}>{item.description}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sm }}>
                {item.quantity} × {formatCurrency(item.unitPrice, invoice.currency)}
              </Text>
            </View>
            <Text style={{ color: colors.text, fontFamily: fontFamily.semibold }}>
              {formatCurrency(item.quantity * item.unitPrice, invoice.currency)}
            </Text>
          </View>
        ))}
        <View style={styles.totals}>
          <Text style={{ color: colors.textSecondary }}>Subtotal: {formatCurrency(invoice.subtotal, invoice.currency)}</Text>
          <Text style={{ color: colors.textSecondary }}>Tax ({invoice.taxRate}%): {formatCurrency(invoice.taxAmount, invoice.currency)}</Text>
          <Text style={[styles.grandTotal, { color: colors.primary, fontFamily: fontFamily.bold }]}>
            Total: {formatCurrency(invoice.total, invoice.currency)}
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          Status
        </Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((status) => (
            <Button
              key={status}
              title={status}
              variant={invoice.status === status ? 'primary' : 'secondary'}
              fullWidth={false}
              onPress={() => void handleStatusChange(status)}
              style={styles.statusChip}
            />
          ))}
        </View>
      </Card>

      <Button title="Edit invoice" variant="secondary" onPress={() => router.push(`/invoices/edit/${invoice.id}`)} />
      <Button title="Duplicate invoice" variant="secondary" onPress={() => void handleDuplicate()} />
      <Button
        title="Preview PDF"
        variant="secondary"
        onPress={() => router.push(`/invoices/preview/${invoice.id}`)}
      />
      <Button title="Share PDF" onPress={handleShare} loading={sharing} />
      {settings.subscriptionTier === 'free' ? (
        <Text style={[styles.watermarkNote, { color: colors.textSecondary }]}>
          Free PDFs include an Accvo watermark. Upgrade to Pro to remove it.
        </Text>
      ) : null}
      <View style={{ marginTop: spacing.sm }}>
        <Button title="Delete invoice" variant="danger" onPress={handleDelete} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  number: { fontSize: typography.xl },
  section: {},
  sectionTitle: { marginBottom: spacing.sm },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  totals: { marginTop: spacing.md, gap: 4 },
  grandTotal: { fontSize: typography.lg, marginTop: spacing.xs },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statusChip: { paddingHorizontal: spacing.md, minWidth: 80 },
  watermarkNote: { fontSize: typography.xs, textAlign: 'center', marginTop: spacing.sm },
});
