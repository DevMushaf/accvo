import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let opChain: Promise<unknown> = Promise.resolve();

const SCHEMA = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY NOT NULL,
    invoiceNumber TEXT NOT NULL,
    customerId TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    issueDate TEXT NOT NULL,
    dueDate TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    taxRate REAL NOT NULL DEFAULT 0,
    subtotal REAL NOT NULL DEFAULT 0,
    taxAmount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS invoice_line_items (
    id TEXT PRIMARY KEY NOT NULL,
    invoiceId TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unitPrice REAL NOT NULL DEFAULT 0,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS recurring_invoices (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    customerId TEXT,
    frequency TEXT NOT NULL,
    nextIssueDate TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    taxRate REAL NOT NULL DEFAULT 0,
    notes TEXT,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS recurring_line_items (
    id TEXT PRIMARY KEY NOT NULL,
    recurringInvoiceId TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unitPrice REAL NOT NULL DEFAULT 0,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (recurringInvoiceId) REFERENCES recurring_invoices(id) ON DELETE CASCADE
  );
`;

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const instance = await SQLite.openDatabaseAsync('accvo.db');
  await instance.execAsync(SCHEMA);
  await instance.execAsync('PRAGMA journal_mode = WAL;');
  await instance.execAsync('PRAGMA busy_timeout = 5000;');
  return instance;
}

async function ensureDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (!initPromise) {
    initPromise = openDatabase().then((instance) => {
      db = instance;
      return instance;
    });
  }
  return initPromise;
}

/** Serialize DB access — prevents "database is locked" on Android. */
export function withDatabase<T>(fn: (database: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  const op = opChain.then(() => ensureDatabase()).then((database) => fn(database));
  opChain = op.then(
    () => undefined,
    () => undefined,
  );
  return op;
}

/** Clears cached connection (closes first when possible). Use after Fast Refresh in dev. */
export async function resetDatabaseCache(): Promise<void> {
  if (db) {
    try {
      await db.closeAsync();
    } catch {
      // Native handle may already be invalid after reload.
    }
  }
  db = null;
  initPromise = null;
  opChain = Promise.resolve();
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return ensureDatabase();
}

export async function initDatabase(): Promise<void> {
  await withDatabase(async () => undefined);
}
