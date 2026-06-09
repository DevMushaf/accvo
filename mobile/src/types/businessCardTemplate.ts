export type BusinessCardTemplate = 'classic' | 'minimal' | 'modern' | 'bold';

export interface BusinessCardTemplateOption {
  id: BusinessCardTemplate;
  label: string;
  description: string;
  accentColor: string;
}

export const BUSINESS_CARD_TEMPLATE_OPTIONS: BusinessCardTemplateOption[] = [
  { id: 'classic', label: 'Classic', description: 'Monogram avatar, blue accent bar, soft pattern', accentColor: '#0056B3' },
  { id: 'minimal', label: 'Minimal', description: 'Cream card with gold accent lines', accentColor: '#C9A227' },
  { id: 'modern', label: 'Modern', description: 'Gradient background with frosted avatar', accentColor: '#0056B3' },
  { id: 'bold', label: 'Bold', description: 'Dark card with geometric accent corner', accentColor: '#3B9BFF' },
];

export const DEFAULT_BUSINESS_CARD_TEMPLATE: BusinessCardTemplate = 'classic';
