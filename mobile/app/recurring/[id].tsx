import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { RecurringInvoiceForm, type RecurringFormValues } from '@/components/RecurringInvoiceForm';
import { useTheme } from '@/providers/ThemeProvider';
import {
  deleteRecurringInvoice,
  getRecurringInvoiceById,
  updateRecurringInvoice,
} from '@/services/recurringInvoiceRepository';
import { spacing } from '@/theme';
import type { RecurringInvoice } from '@/types/recurringInvoice';

export default function RecurringInvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [recurring, setRecurring] = useState<RecurringInvoice | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setRecurring(await getRecurringInvoiceById(id));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleSubmit(values: RecurringFormValues) {
    if (!recurring) return;
    await updateRecurringInvoice(recurring.id, values);
    router.back();
  }

  function handleDelete() {
    if (!recurring) return;
    Alert.alert('Delete schedule', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRecurringInvoice(recurring.id);
          router.back();
        },
      },
    ]);
  }

  if (!recurring) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <RecurringInvoiceForm
      initialValues={{
        name: recurring.name,
        customerId: recurring.customerId,
        frequency: recurring.frequency,
        nextIssueDate: recurring.nextIssueDate,
        taxRate: recurring.taxRate,
        notes: recurring.notes,
        isActive: recurring.isActive,
        lineItems: recurring.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }}
      submitLabel="Save changes"
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
