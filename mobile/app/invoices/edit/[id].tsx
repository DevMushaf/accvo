import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { InvoiceForm } from '@/components/InvoiceForm';
import { useTheme } from '@/providers/ThemeProvider';
import { getInvoiceById, updateInvoice } from '@/services/invoiceRepository';
import type { Invoice } from '@/types/invoice';

export default function EditInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

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

  if (!invoice) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <InvoiceForm
      submitLabel="Update invoice"
      initialValues={{
        customerId: invoice.customerId,
        taxRate: invoice.taxRate,
        notes: invoice.notes ?? '',
        dueDate: invoice.dueDate ?? '',
        lineItems: invoice.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }}
      onSubmit={async (values) => {
        const updated = await updateInvoice(invoice.id, {
          customerId: values.customerId,
          taxRate: values.taxRate,
          notes: values.notes,
          dueDate: values.dueDate,
          lineItems: values.lineItems,
        });
        if (updated) {
          router.replace(`/invoices/${updated.id}`);
        }
      }}
    />
  );
}
