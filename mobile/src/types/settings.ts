import type { BusinessCardTemplate } from '@/types/businessCardTemplate';
import { DEFAULT_BUSINESS_CARD_TEMPLATE } from '@/types/businessCardTemplate';
import type { InvoiceTemplate } from '@/types/invoiceTemplate';
import { DEFAULT_INVOICE_TEMPLATE } from '@/types/invoiceTemplate';
import type { ThemeMode } from '@/theme/colors';

export type SubscriptionTier = 'free' | 'pro';
export type AuthMode = 'none' | 'guest' | 'signed_in';

export type BusinessLogoShape = 'square' | 'wide';

export interface AppSettings {
  businessName: string;
  businessTagline: string;
  businessEmail: string;
  businessPhone: string;
  businessWebsite: string;
  businessAddress: string;
  paymentNote: string;
  businessLogoUri: string | null;
  businessLogoShape: BusinessLogoShape;
  showLogoOnInvoice: boolean;
  showLogoOnBusinessCard: boolean;
  defaultCurrency: string;
  defaultTaxRate: number;
  invoiceTemplate: InvoiceTemplate;
  businessCardTemplate: BusinessCardTemplate;
  themeMode: ThemeMode;
  subscriptionTier: SubscriptionTier;
  authMode: AuthMode;
  hasSeenWelcome: boolean;
  hasDismissedGuestBanner: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  businessName: 'My Business',
  businessTagline: '',
  businessEmail: '',
  businessPhone: '',
  businessWebsite: '',
  businessAddress: '',
  paymentNote: '',
  businessLogoUri: null,
  businessLogoShape: 'square',
  showLogoOnInvoice: false,
  showLogoOnBusinessCard: false,
  defaultCurrency: 'USD',
  defaultTaxRate: 0,
  invoiceTemplate: DEFAULT_INVOICE_TEMPLATE,
  businessCardTemplate: DEFAULT_BUSINESS_CARD_TEMPLATE,
  themeMode: 'system',
  subscriptionTier: 'free',
  authMode: 'none',
  hasSeenWelcome: false,
  hasDismissedGuestBanner: false,
};
