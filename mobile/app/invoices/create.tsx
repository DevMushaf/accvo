import { useRouter } from 'expo-router';

import { InvoiceForm } from '@/components/InvoiceForm';
import { createInvoice } from '@/services/invoiceRepository';
import { useSettingsStore } from '@/store/settingsStore';

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const settings = useSettingsStore((s) => s.settings);

  return (
    <InvoiceForm
      submitLabel="Save invoice"
      onSubmit={async (values) => {
        const invoice = await createInvoice({
          customerId: values.customerId,
          currency: settings.defaultCurrency,
          taxRate: values.taxRate,
          notes: values.notes,
          dueDate: values.dueDate,
          lineItems: values.lineItems,
          status: 'draft',
        });
        router.replace(`/invoices/${invoice.id}`);
      }}
    />
  );
}
