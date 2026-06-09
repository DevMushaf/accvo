import type { Invoice } from '@/types/invoice';
import type { AppSettings } from '@/types/settings';

export function createSampleInvoice(settings: AppSettings): Invoice {
  const now = new Date().toISOString();
  return {
    id: 'sample',
    invoiceNumber: 'INV-0001',
    customerId: null,
    customerName: 'Jane Smith',
    status: 'sent',
    issueDate: now.slice(0, 10),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    currency: settings.defaultCurrency,
    taxRate: settings.defaultTaxRate,
    subtotal: 450,
    taxAmount: (450 * settings.defaultTaxRate) / 100,
    total: 450 + (450 * settings.defaultTaxRate) / 100,
    notes: 'Thank you for your business.',
    lineItems: [
      {
        id: 'sample-1',
        invoiceId: 'sample',
        description: 'Web design consultation',
        quantity: 2,
        unitPrice: 150,
        sortOrder: 0,
      },
      {
        id: 'sample-2',
        invoiceId: 'sample',
        description: 'Logo revision',
        quantity: 1,
        unitPrice: 150,
        sortOrder: 1,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
