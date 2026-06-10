import { withDatabase } from '@/services/localDb';
import type { AppSettings, AuthMode } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { migrateInvoiceTemplate } from '@/types/invoiceTemplate';
import type * as SQLite from 'expo-sqlite';

const SETTINGS_KEY = 'app_settings';

interface LegacySettings extends Partial<AppSettings> {
  hasSeenOnboarding?: boolean;
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
    businessLogoShape: parsed.businessLogoShape ?? 'square',
    invoiceTemplate: migrateInvoiceTemplate(parsed.invoiceTemplate as string | undefined),
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
