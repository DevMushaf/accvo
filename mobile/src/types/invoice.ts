export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  lineItems: InvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceInput {
  customerId?: string | null;
  status?: InvoiceStatus;
  issueDate?: string;
  dueDate?: string | null;
  currency?: string;
  taxRate?: number;
  notes?: string | null;
  lineItems: CreateLineItemInput[];
}

export type UpdateInvoiceInput = Partial<
  Omit<Invoice, 'id' | 'invoiceNumber' | 'lineItems' | 'createdAt' | 'updatedAt'>
> & {
  lineItems?: CreateLineItemInput[];
};
