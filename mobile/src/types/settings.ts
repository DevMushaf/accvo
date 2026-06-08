import type { ThemeMode } from '@/theme/colors';

export type SubscriptionTier = 'free' | 'pro';

export interface AppSettings {
  businessName: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  themeMode: ThemeMode;
  subscriptionTier: SubscriptionTier;
  hasSeenOnboarding: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  businessName: 'My Business',
  defaultCurrency: 'USD',
  defaultTaxRate: 0,
  themeMode: 'system',
  subscriptionTier: 'free',
  hasSeenOnboarding: false,
};
