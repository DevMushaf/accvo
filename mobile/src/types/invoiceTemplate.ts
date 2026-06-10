export type InvoiceTemplate = 'corporate' | 'bold' | 'rounded' | 'vivid' | 'studio';

export interface InvoiceTemplateOption {
  id: InvoiceTemplate;
  label: string;
  description: string;
  accentColor: string;
  previewColors: [string, string, string];
}

export const INVOICE_TEMPLATE_OPTIONS: InvoiceTemplateOption[] = [
  {
    id: 'corporate',
    label: 'Corporate',
    description: 'Geometric header, teal table, contact footer bar',
    accentColor: '#0D9488',
    previewColors: ['#0F766E', '#14B8A6', '#134E4A'],
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Navy header with accent stripe, split table header',
    accentColor: '#1E3A5F',
    previewColors: ['#1E293B', '#3B9BFF', '#84CC16'],
  },
  {
    id: 'rounded',
    label: 'Rounded',
    description: 'Soft rounded header and pill-shaped table rows',
    accentColor: '#0D9488',
    previewColors: ['#14B8A6', '#CCFBF1', '#0F766E'],
  },
  {
    id: 'vivid',
    label: 'Vivid',
    description: 'Purple header, orange total bar, creative layout',
    accentColor: '#7C3AED',
    previewColors: ['#5B21B6', '#F97316', '#EDE9FE'],
  },
  {
    id: 'studio',
    label: 'Studio',
    description: 'Curved accents, account due box, wave footer',
    accentColor: '#0056B3',
    previewColors: ['#0056B3', '#93C5FD', '#1E3A8A'],
  },
];

export const DEFAULT_INVOICE_TEMPLATE: InvoiceTemplate = 'corporate';

export const LEGACY_INVOICE_TEMPLATE_MAP: Record<string, InvoiceTemplate> = {
  classic: 'corporate',
  modern: 'bold',
  elegant: 'rounded',
  minimal: 'vivid',
};

export function migrateInvoiceTemplate(value: string | undefined): InvoiceTemplate {
  if (!value) return DEFAULT_INVOICE_TEMPLATE;
  if (value in LEGACY_INVOICE_TEMPLATE_MAP) {
    return LEGACY_INVOICE_TEMPLATE_MAP[value];
  }
  if (INVOICE_TEMPLATE_OPTIONS.some((option) => option.id === value)) {
    return value as InvoiceTemplate;
  }
  return DEFAULT_INVOICE_TEMPLATE;
}
