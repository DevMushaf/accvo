import type { CreateLineItemInput } from '@/types/invoice';

export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function calculateLineTotal(item: CreateLineItemInput): number {
  return item.quantity * item.unitPrice;
}

export function calculateInvoiceTotals(
  lineItems: CreateLineItemInput[],
  taxRate: number,
): InvoiceTotals {
  const subtotal = lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  return {
    subtotal: roundMoney(subtotal),
    taxAmount: roundMoney(taxAmount),
    total: roundMoney(total),
  };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
