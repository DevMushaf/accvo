import type { InvoiceTemplate } from '@/types/invoiceTemplate';
import { DEFAULT_INVOICE_TEMPLATE } from '@/types/invoiceTemplate';
import type { ThemeMode } from '@/theme/colors';

export type SubscriptionTier = 'free' | 'pro';

export interface AppSettings {
  businessName: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  invoiceTemplate: InvoiceTemplate;
  themeMode: ThemeMode;
  subscriptionTier: SubscriptionTier;
  hasSeenOnboarding: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  businessName: 'My Business',
  defaultCurrency: 'USD',
  defaultTaxRate: 0,
  invoiceTemplate: DEFAULT_INVOICE_TEMPLATE,
  themeMode: 'system',
  subscriptionTier: 'free',
  hasSeenOnboarding: false,
};
