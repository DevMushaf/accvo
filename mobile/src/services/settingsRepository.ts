import { getDatabase } from '@/services/localDb';
import type { AppSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

const SETTINGS_KEY = 'app_settings';

export async function getSettings(): Promise<AppSettings> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    SETTINGS_KEY,
  );

  if (!row?.value) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(row.value) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    SETTINGS_KEY,
    JSON.stringify(settings),
  );
}

export async function getNextInvoiceNumber(): Promise<string> {
  const db = await getDatabase();
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
