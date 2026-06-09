import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { KeyboardAwareScreen } from '@/components/KeyboardAwareScreen';
import { LineItemEditor } from '@/components/LineItemEditor';
import { useTheme } from '@/providers/ThemeProvider';
import { getAllCustomers } from '@/services/customerRepository';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import type { Customer } from '@/types/customer';
import type { CreateLineItemInput } from '@/types/invoice';
import { formatCurrency } from '@/utils/currency';
import { calculateInvoiceTotals } from '@/utils/tax';

export interface InvoiceFormValues {
  customerId: string | null;
  taxRate: number;
  notes: string | null;
  dueDate: string | null;
  lineItems: CreateLineItemInput[];
}

interface InvoiceFormProps {
  initialValues?: Partial<InvoiceFormValues>;
  submitLabel: string;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
}

export function InvoiceForm({ initialValues, submitLabel, onSubmit }: InvoiceFormProps) {
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(initialValues?.customerId ?? null);
  const [taxRate, setTaxRate] = useState(
    String(initialValues?.taxRate ?? settings.defaultTaxRate),
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? '');
  const [lineItems, setLineItems] = useState<CreateLineItemInput[]>(
    initialValues?.lineItems?.length
      ? initialValues.lineItems
      : [{ description: '', quantity: 1, unitPrice: 0 }],
  );
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
      await onSubmit({
        customerId,
        taxRate: parseFloat(taxRate) || 0,
        notes: notes.trim() || null,
        dueDate: dueDate.trim() || null,
        lineItems: lineItems.filter((item) => item.description.trim()),
      });
    } catch {
      Alert.alert('Error', 'Could not save invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAwareScreen
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
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

      <Input
        label="Due date (optional)"
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="YYYY-MM-DD"
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
        <Text style={{ color: colors.textSecondary }}>
          Subtotal: {formatCurrency(totals.subtotal, settings.defaultCurrency)}
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Tax: {formatCurrency(totals.taxAmount, settings.defaultCurrency)}
        </Text>
        <Text style={[styles.total, { color: colors.primary, fontFamily: fontFamily.bold }]}>
          Total: {formatCurrency(totals.total, settings.defaultCurrency)}
        </Text>
      </View>

      <Button title={submitLabel} onPress={handleSave} loading={loading} />
    </KeyboardAwareScreen>
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
