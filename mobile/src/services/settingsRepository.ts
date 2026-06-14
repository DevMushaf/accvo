import { withDatabase } from '@/services/localDb';
import type { AppSettings, AuthMode } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import {
  getCardAccentColor,
  migrateBusinessCardTemplate,
  type BusinessCardTemplate,
} from '@/types/businessCardTemplate';
import { migrateInvoiceTemplate } from '@/types/invoiceTemplate';
import type * as SQLite from 'expo-sqlite';

const SETTINGS_KEY = 'app_settings';

interface LegacySettings extends Partial<AppSettings> {
  hasSeenOnboarding?: boolean;
}

function migrateBusinessCardAccentColors(
  colors: Partial<Record<string, string>>,
): Partial<Record<BusinessCardTemplate, string>> {
  const migrated = { ...colors } as Partial<Record<BusinessCardTemplate, string>>;
  for (const template of ['wave', 'executive', 'orbit', 'royal', 'prestige'] as const) {
    const saved = migrated[template];
    if (!saved) continue;
    migrated[template] = getCardAccentColor(template, migrated);
  }
  return migrated;
}

function migrateSettings(parsed: LegacySettings): AppSettings {
  const hadLegacyOnboarding = parsed.hasSeenOnboarding === true;
  const hasSeenWelcome = parsed.hasSeenWelcome ?? hadLegacyOnboarding ?? false;

  let authMode: AuthMode = parsed.authMode ?? 'none';
  if (authMode === 'none' && hasSeenWelcome) {
    authMode = 'guest';
  }

  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    authMode,
    hasSeenWelcome: parsed.hasSeenWelcome ?? hadLegacyOnboarding ?? false,
    hasDismissedGuestBanner: parsed.hasDismissedGuestBanner ?? false,
    paymentNote: parsed.paymentNote ?? '',
    businessLogoShape: parsed.businessLogoShape === 'wide' ? 'square' : (parsed.businessLogoShape ?? 'square'),
    businessLogoWidth: parsed.businessLogoWidth ?? null,
    businessLogoHeight: parsed.businessLogoHeight ?? null,
    businessLogoScale:
      typeof parsed.businessLogoScale === 'number'
        ? Math.min(1.6, Math.max(0.45, parsed.businessLogoScale))
        : 1,
    businessLogoRevision: parsed.businessLogoRevision ?? 0,
    invoiceTemplate: migrateInvoiceTemplate(parsed.invoiceTemplate as string | undefined),
    businessCardTemplate: migrateBusinessCardTemplate(parsed.businessCardTemplate as string | undefined),
    businessCardPersonName: parsed.businessCardPersonName ?? '',
    businessCardPersonTitle: parsed.businessCardPersonTitle ?? '',
    businessCardAccentColors:
      parsed.businessCardAccentColors && typeof parsed.businessCardAccentColors === 'object'
        ? migrateBusinessCardAccentColors(parsed.businessCardAccentColors as Partial<Record<string, string>>)
        : {},
  };
}

export async function getSettings(): Promise<AppSettings> {
  return withDatabase(async (db) => {
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      SETTINGS_KEY,
    );

    if (!row?.value) {
      return { ...DEFAULT_SETTINGS };
    }

    try {
      const parsed = JSON.parse(row.value) as LegacySettings;
      const migrated = migrateSettings(parsed);

      if (parsed.hasSeenWelcome === undefined && parsed.hasSeenOnboarding === undefined) {
        return {
          ...migrated,
          hasSeenWelcome: true,
          authMode: migrated.authMode === 'none' ? 'guest' : migrated.authMode,
        };
      }

      return migrated;
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await withDatabase(async (db) => {
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      SETTINGS_KEY,
      JSON.stringify(settings),
    );
  });
}

export async function getNextInvoiceNumber(db: SQLite.SQLiteDatabase): Promise<string> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    'last_invoice_number',
  );

  const lastNumber = row?.value ? parseInt(row.value, 10) : 0;
  const nextNumber = lastNumber + 1;

  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    'last_invoice_number',
    String(nextNumber),
  );

  return `INV-${String(nextNumber).padStart(4, '0')}`;
}
