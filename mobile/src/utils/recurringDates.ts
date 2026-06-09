import type { RecurringFrequency } from '@/types/recurringInvoice';
import { toISODate } from '@/utils/dates';

export function advanceRecurringDate(isoDate: string, frequency: RecurringFrequency): string {
  const date = new Date(isoDate);
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return toISODate(date);
}

export function frequencyLabel(frequency: RecurringFrequency): string {
  switch (frequency) {
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
  }
}
