export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringLineItem {
  id: string;
  recurringInvoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder: number;
}

export interface RecurringInvoice {
  id: string;
  name: string;
  customerId: string | null;
  customerName?: string | null;
  frequency: RecurringFrequency;
  nextIssueDate: string;
  currency: string;
  taxRate: number;
  notes: string | null;
  isActive: boolean;
  lineItems: RecurringLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateRecurringInvoiceInput {
  name: string;
  customerId?: string | null;
  frequency: RecurringFrequency;
  nextIssueDate: string;
  currency?: string;
  taxRate?: number;
  notes?: string | null;
  isActive?: boolean;
  lineItems: CreateRecurringLineItemInput[];
}

export type UpdateRecurringInvoiceInput = Partial<
  Omit<RecurringInvoice, 'id' | 'lineItems' | 'createdAt' | 'updatedAt'>
> & {
  lineItems?: CreateRecurringLineItemInput[];
};
