import { isLightHex } from '@/services/pdf/cardColorUtils';

export type BusinessCardTemplate = 'wave' | 'executive' | 'orbit' | 'royal' | 'prestige';

const BRAND_COLOR_TEMPLATES = new Set<BusinessCardTemplate>(['wave', 'executive', 'orbit', 'royal']);

export interface BusinessCardTemplateOption {
  id: BusinessCardTemplate;
  label: string;
  description: string;
  accentColor: string;
}

export const BUSINESS_CARD_TEMPLATE_OPTIONS: BusinessCardTemplateOption[] = [
  {
    id: 'wave',
    label: 'Split',
    description: 'Branded navy front; diagonal back with contact',
    accentColor: '#1B2A41',
  },
  {
    id: 'executive',
    label: 'Executive',
    description: 'Gold on navy front; split back with QR',
    accentColor: '#0D1F3C',
  },
  {
    id: 'orbit',
    label: 'Orbit',
    description: 'Navy rings front; pill contact rows on back',
    accentColor: '#1A2744',
  },
  {
    id: 'royal',
    label: 'Royal',
    description: 'Purple minimalist front; structured back',
    accentColor: '#5B2C83',
  },
  {
    id: 'prestige',
    label: 'Prestige',
    description: 'White & gold front; navy back with QR',
    accentColor: '#C5A059',
  },
];

export const DEFAULT_BUSINESS_CARD_TEMPLATE: BusinessCardTemplate = 'wave';

export const DEFAULT_CARD_ACCENT_COLORS: Record<BusinessCardTemplate, string> = {
  wave: '#1B2A41',
  executive: '#0D1F3C',
  orbit: '#1A2744',
  royal: '#5B2C83',
  prestige: '#C5A059',
};

/** Swatches offered in the card accent picker (per template). */
export const CARD_ACCENT_PRESETS: string[] = [
  '#1B2A41',
  '#0D1F3C',
  '#1A2744',
  '#2D3748',
  '#C9A227',
  '#C5A059',
  '#B8860B',
  '#5B2C83',
  '#3D1F5C',
  '#1E3A5F',
  '#0F766E',
  '#7C2D12',
];

/** Dark accents for templates that use the picker as a navy / brand background. */
export const NAVY_ACCENT_PRESETS: string[] = [
  '#1B2A41',
  '#0D1F3C',
  '#1A2744',
  '#2D3748',
  '#1E3A5F',
  '#5B2C83',
  '#3D1F5C',
  '#0F766E',
  '#7C2D12',
];

/** Dark brand accents for Royal (purple-friendly; no gold). */
export const ROYAL_ACCENT_PRESETS: string[] = [
  '#5B2C83',
  '#3D1F5C',
  '#1B2A41',
  '#0D1F3C',
  '#1A2744',
  '#2D3748',
  '#1E3A5F',
  '#0F766E',
  '#7C2D12',
];

/** Gold accents for Prestige (front highlights only; back navy stays fixed). */
export const PRESTIGE_ACCENT_PRESETS: string[] = [
  '#C5A059',
  '#C9A227',
  '#B8860B',
  '#D4AF37',
  '#E8C547',
  '#A67C00',
  '#CFB53B',
  '#C2A04A',
];

export function getCardAccentPresets(template: BusinessCardTemplate): string[] {
  switch (template) {
    case 'wave':
    case 'executive':
    case 'orbit':
      return NAVY_ACCENT_PRESETS;
    case 'royal':
      return ROYAL_ACCENT_PRESETS;
    case 'prestige':
      return PRESTIGE_ACCENT_PRESETS;
    default:
      return CARD_ACCENT_PRESETS;
  }
}

export function getCardAccentColor(
  template: BusinessCardTemplate,
  overrides?: Partial<Record<BusinessCardTemplate, string>>,
): string {
  const custom = overrides?.[template]?.trim();
  const fallback = DEFAULT_CARD_ACCENT_COLORS[template];
  if (!custom || !/^#[0-9A-Fa-f]{6}$/.test(custom)) return fallback;
  if (BRAND_COLOR_TEMPLATES.has(template) && isLightHex(custom)) return fallback;
  if (template === 'prestige') {
    const goldPreset = PRESTIGE_ACCENT_PRESETS.some((p) => p.toLowerCase() === custom.toLowerCase());
    if (!goldPreset && !isLightHex(custom)) return fallback;
  }
  return custom;
}

export function usesBrandColorPicker(template: BusinessCardTemplate): boolean {
  return BRAND_COLOR_TEMPLATES.has(template);
}

const LEGACY_CARD_MAP: Record<string, BusinessCardTemplate> = {
  classic: 'wave',
  minimal: 'prestige',
  modern: 'orbit',
  bold: 'executive',
};

export function migrateBusinessCardTemplate(id: string | undefined): BusinessCardTemplate {
  if (!id) return DEFAULT_BUSINESS_CARD_TEMPLATE;
  if (id in LEGACY_CARD_MAP) return LEGACY_CARD_MAP[id];
  const valid = BUSINESS_CARD_TEMPLATE_OPTIONS.some((o) => o.id === id);
  return valid ? (id as BusinessCardTemplate) : DEFAULT_BUSINESS_CARD_TEMPLATE;
}
