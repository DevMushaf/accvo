export type InvoiceTemplate = 'classic' | 'minimal' | 'modern';

export interface InvoiceTemplateOption {
  id: InvoiceTemplate;
  label: string;
  description: string;
}

export const INVOICE_TEMPLATE_OPTIONS: InvoiceTemplateOption[] = [
  { id: 'classic', label: 'Classic', description: 'Accvo blue — professional default' },
  { id: 'minimal', label: 'Minimal', description: 'Clean black & white, lots of space' },
  { id: 'modern', label: 'Modern', description: 'Bold header band with accent stripe' },
];

export const DEFAULT_INVOICE_TEMPLATE: InvoiceTemplate = 'classic';
