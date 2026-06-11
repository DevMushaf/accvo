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
  businessLogoWidth: number | null;
  businessLogoHeight: number | null;
  /** Display scale on invoices (0.5–1.5). */
  businessLogoScale: number;
  /** Bumped when the logo file is replaced so previews reload the same path. */
  businessLogoRevision: number;
  showLogoOnInvoice: boolean;
  showLogoOnBusinessCard: boolean;
  defaultCurrency: string;
  defaultTaxRate: number;
  invoiceTemplate: InvoiceTemplate;
  businessCardTemplate: BusinessCardTemplate;
  /** Person name shown on the back of business cards (e.g. Richard Miles). */
  businessCardPersonName: string;
  /** Role or title on the card back (e.g. Landscape Design). */
  businessCardPersonTitle: string;
  /** Per-template accent color overrides (hex). */
  businessCardAccentColors: Partial<Record<BusinessCardTemplate, string>>;
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
  businessLogoWidth: null,
  businessLogoHeight: null,
  businessLogoScale: 1,
  businessLogoRevision: 0,
  showLogoOnInvoice: false,
  showLogoOnBusinessCard: false,
  defaultCurrency: 'USD',
  defaultTaxRate: 0,
  invoiceTemplate: DEFAULT_INVOICE_TEMPLATE,
  businessCardTemplate: DEFAULT_BUSINESS_CARD_TEMPLATE,
  businessCardPersonName: '',
  businessCardPersonTitle: '',
  businessCardAccentColors: {},
  themeMode: 'system',
  subscriptionTier: 'free',
  authMode: 'none',
  hasSeenWelcome: false,
  hasDismissedGuestBanner: false,
};
