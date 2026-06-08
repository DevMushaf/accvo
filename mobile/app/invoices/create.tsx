import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LineItemEditor } from '@/components/LineItemEditor';
import { useTheme } from '@/providers/ThemeProvider';
import { getAllCustomers } from '@/services/customerRepository';
import { createInvoice } from '@/services/invoiceRepository';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import type { Customer } from '@/types/customer';
import type { CreateLineItemInput } from '@/types/invoice';
import { calculateInvoiceTotals } from '@/utils/tax';
import { formatCurrency } from '@/utils/currency';

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(String(settings.defaultTaxRate));
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<CreateLineItemInput[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getAllCustomers().then(setCustomers);
  }, []);

  const totals = calculateInvoiceTotals(lineItems, parseFloat(taxRate) || 0);

  async function handleSave() {
    if (!lineItems.some((item) => item.description.trim())) {
      Alert.alert('Missing details', 'Add at least one line item with a description.');
      return;
    }

    setLoading(true);
    try {
      const invoice = await createInvoice({
        customerId,
        currency: settings.defaultCurrency,
        taxRate: parseFloat(taxRate) || 0,
        notes: notes.trim() || null,
        lineItems: lineItems.filter((item) => item.description.trim()),
        status: 'draft',
      });
      router.replace(`/invoices/${invoice.id}`);
    } catch {
      Alert.alert('Error', 'Could not create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.label, { color: colors.text, fontFamily: fontFamily.medium }]}>
        Customer (optional)
      </Text>
      <View style={styles.chipRow}>
        <Button
          title="None"
          variant={customerId === null ? 'primary' : 'secondary'}
          fullWidth={false}
          onPress={() => setCustomerId(null)}
          style={styles.chip}
        />
        {customers.map((customer) => (
          <Button
            key={customer.id}
            title={customer.name}
            variant={customerId === customer.id ? 'primary' : 'secondary'}
            fullWidth={false}
            onPress={() => setCustomerId(customer.id)}
            style={styles.chip}
          />
        ))}
      </View>

      <Input
        label="Tax rate (%)"
        value={taxRate}
        onChangeText={setTaxRate}
        keyboardType="decimal-pad"
      />

      <LineItemEditor items={lineItems} onChange={setLineItems} />

      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Payment terms, thank you note..."
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />

      <View style={[styles.totals, { backgroundColor: colors.primaryLight }]}>
        <Text style={{ color: colors.textSecondary }}>Subtotal: {formatCurrency(totals.subtotal, settings.defaultCurrency)}</Text>
        <Text style={{ color: colors.textSecondary }}>Tax: {formatCurrency(totals.taxAmount, settings.defaultCurrency)}</Text>
        <Text style={[styles.total, { color: colors.primary, fontFamily: fontFamily.bold }]}>
          Total: {formatCurrency(totals.total, settings.defaultCurrency)}
        </Text>
      </View>

      <Button title="Save invoice" onPress={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  label: { fontSize: typography.sm, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md },
  totals: { borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, gap: 4 },
  total: { fontSize: typography.lg, marginTop: spacing.xs },
});
