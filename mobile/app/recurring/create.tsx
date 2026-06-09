import { useRouter } from 'expo-router';

import { RecurringInvoiceForm } from '@/components/RecurringInvoiceForm';
import { createRecurringInvoice } from '@/services/recurringInvoiceRepository';
import type { CreateRecurringInvoiceInput } from '@/types/recurringInvoice';

export default function CreateRecurringInvoiceScreen() {
  const router = useRouter();

  async function handleSubmit(values: {
    name: string;
    customerId: string | null;
    frequency: CreateRecurringInvoiceInput['frequency'];
    nextIssueDate: string;
    taxRate: number;
    notes: string | null;
    isActive: boolean;
    lineItems: CreateRecurringInvoiceInput['lineItems'];
  }) {
    await createRecurringInvoice({
      name: values.name,
      customerId: values.customerId,
      frequency: values.frequency,
      nextIssueDate: values.nextIssueDate,
      taxRate: values.taxRate,
      notes: values.notes,
      isActive: values.isActive,
      lineItems: values.lineItems,
    });
    router.back();
  }

  return <RecurringInvoiceForm submitLabel="Save recurring invoice" onSubmit={handleSubmit} />;
}
