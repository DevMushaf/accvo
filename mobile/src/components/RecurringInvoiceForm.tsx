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
import type { CreateRecurringInvoiceInput, RecurringFrequency } from '@/types/recurringInvoice';
import { formatCurrency } from '@/utils/currency';
import { toISODate } from '@/utils/dates';
import { frequencyLabel } from '@/utils/recurringDates';
import { calculateInvoiceTotals } from '@/utils/tax';

const FREQUENCIES: RecurringFrequency[] = ['weekly', 'monthly', 'quarterly', 'yearly'];

export interface RecurringFormValues {
  name: string;
  customerId: string | null;
  frequency: RecurringFrequency;
  nextIssueDate: string;
  taxRate: number;
  notes: string | null;
  isActive: boolean;
  lineItems: CreateLineItemInput[];
}

interface RecurringInvoiceFormProps {
  initialValues?: Partial<RecurringFormValues>;
  submitLabel: string;
  onSubmit: (values: RecurringFormValues) => Promise<void>;
  onDelete?: () => void;
}

export function RecurringInvoiceForm({
  initialValues,
  submitLabel,
  onSubmit,
  onDelete,
}: RecurringInvoiceFormProps) {
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState(initialValues?.name ?? '');
  const [customerId, setCustomerId] = useState<string | null>(initialValues?.customerId ?? null);
  const [frequency, setFrequency] = useState<RecurringFrequency>(initialValues?.frequency ?? 'monthly');
  const [nextIssueDate, setNextIssueDate] = useState(initialValues?.nextIssueDate ?? toISODate());
  const [taxRate, setTaxRate] = useState(String(initialValues?.taxRate ?? settings.defaultTaxRate));
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
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
    if (!name.trim()) {
      Alert.alert('Missing name', 'Give this recurring invoice a name.');
      return;
    }
    if (!lineItems.some((item) => item.description.trim())) {
      Alert.alert('Missing details', 'Add at least one line item with a description.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        customerId,
        frequency,
        nextIssueDate: nextIssueDate.trim() || toISODate(),
        taxRate: parseFloat(taxRate) || 0,
        notes: notes.trim() || null,
        isActive,
        lineItems: lineItems.filter((item) => item.description.trim()),
      });
    } catch {
      Alert.alert('Error', 'Could not save recurring invoice.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Input label="Schedule name *" value={name} onChangeText={setName} placeholder="Monthly retainer" />

      <Text style={[styles.label, { color: colors.text, fontFamily: fontFamily.medium }]}>Customer (optional)</Text>
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

      <Text style={[styles.label, { color: colors.text, fontFamily: fontFamily.medium }]}>Frequency</Text>
      <View style={styles.chipRow}>
        {FREQUENCIES.map((option) => (
          <Button
            key={option}
            title={frequencyLabel(option)}
            variant={frequency === option ? 'primary' : 'secondary'}
            fullWidth={false}
            onPress={() => setFrequency(option)}
            style={styles.chip}
          />
        ))}
      </View>

      <Input
        label="Next issue date"
        value={nextIssueDate}
        onChangeText={setNextIssueDate}
        placeholder="YYYY-MM-DD"
      />

      <Input label="Tax rate (%)" value={taxRate} onChangeText={setTaxRate} keyboardType="decimal-pad" />

      <LineItemEditor items={lineItems} onChange={setLineItems} />

      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />

      <View style={styles.chipRow}>
        <Button
          title={isActive ? 'Active' : 'Paused'}
          variant={isActive ? 'primary' : 'secondary'}
          fullWidth={false}
          onPress={() => setIsActive((value) => !value)}
          style={styles.chip}
        />
      </View>

      <View style={[styles.totals, { backgroundColor: colors.primaryLight }]}>
        <Text style={{ color: colors.textSecondary }}>
          Estimated total: {formatCurrency(totals.total, settings.defaultCurrency)}
        </Text>
      </View>

      <Button title={submitLabel} onPress={handleSave} loading={loading} />
      {onDelete ? (
        <View style={{ marginTop: spacing.sm }}>
          <Button title="Delete schedule" variant="danger" onPress={onDelete} />
        </View>
      ) : null}
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  label: { fontSize: typography.sm, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md },
  totals: { borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
});
