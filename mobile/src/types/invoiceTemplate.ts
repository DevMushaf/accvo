export type InvoiceTemplate = 'classic' | 'minimal' | 'modern' | 'elegant';

export interface InvoiceTemplateOption {
  id: InvoiceTemplate;
  label: string;
  description: string;
  accentColor: string;
}

export const INVOICE_TEMPLATE_OPTIONS: InvoiceTemplateOption[] = [
  { id: 'classic', label: 'Classic', description: 'Professional blue header with structured table', accentColor: '#0056B3' },
  { id: 'minimal', label: 'Minimal', description: 'Refined serif layout, black & white', accentColor: '#111827' },
  { id: 'modern', label: 'Modern', description: 'Bold header band with accent stripe', accentColor: '#0056B3' },
  { id: 'elegant', label: 'Elegant', description: 'Soft borders, balanced spacing, premium feel', accentColor: '#004494' },
];

export const DEFAULT_INVOICE_TEMPLATE: InvoiceTemplate = 'classic';
