import { createInvoice } from '@/services/invoiceRepository';
import { withDatabase } from '@/services/localDb';
import type * as SQLite from 'expo-sqlite';
import type { Invoice } from '@/types/invoice';
import type {
  CreateRecurringInvoiceInput,
  RecurringInvoice,
  RecurringLineItem,
  UpdateRecurringInvoiceInput,
} from '@/types/recurringInvoice';
import { advanceRecurringDate } from '@/utils/recurringDates';
import { generateId, toISODate } from '@/utils/dates';

const RECURRING_SELECT = `
  SELECT r.*, c.name as customerName
  FROM recurring_invoices r
  LEFT JOIN customers c ON r.customerId = c.id
`;

function mapLineItem(row: Record<string, unknown>): RecurringLineItem {
  return {
    id: row.id as string,
    recurringInvoiceId: row.recurringInvoiceId as string,
    description: row.description as string,
    quantity: row.quantity as number,
    unitPrice: row.unitPrice as number,
    sortOrder: row.sortOrder as number,
  };
}

function mapRecurring(row: Record<string, unknown>, lineItems: RecurringLineItem[]): RecurringInvoice {
  return {
    id: row.id as string,
    name: row.name as string,
    customerId: (row.customerId as string | null) ?? null,
    customerName: (row.customerName as string | null) ?? null,
    frequency: row.frequency as RecurringInvoice['frequency'],
    nextIssueDate: row.nextIssueDate as string,
    currency: row.currency as string,
    taxRate: row.taxRate as number,
    notes: (row.notes as string | null) ?? null,
    isActive: Boolean(row.isActive),
    lineItems,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

async function getLineItems(
  db: SQLite.SQLiteDatabase,
  recurringInvoiceId: string,
): Promise<RecurringLineItem[]> {
  const rows = await db.getAllAsync(
    'SELECT * FROM recurring_line_items WHERE recurringInvoiceId = ? ORDER BY sortOrder ASC',
    recurringInvoiceId,
  );
  return rows.map((row) => mapLineItem(row as Record<string, unknown>));
}

async function getLineItemsForRecurringInvoices(
  db: SQLite.SQLiteDatabase,
  recurringInvoiceIds: string[],
): Promise<Map<string, RecurringLineItem[]>> {
  const grouped = new Map<string, RecurringLineItem[]>();
  if (recurringInvoiceIds.length === 0) return grouped;

  const placeholders = recurringInvoiceIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync(
    `SELECT * FROM recurring_line_items WHERE recurringInvoiceId IN (${placeholders}) ORDER BY sortOrder ASC`,
    ...recurringInvoiceIds,
  );

  for (const row of rows) {
    const item = mapLineItem(row as Record<string, unknown>);
    const list = grouped.get(item.recurringInvoiceId) ?? [];
    list.push(item);
    grouped.set(item.recurringInvoiceId, list);
  }

  return grouped;
}

async function hydrateRecurring(
  db: SQLite.SQLiteDatabase,
  row: Record<string, unknown>,
): Promise<RecurringInvoice> {
  const lineItems = await getLineItems(db, row.id as string);
  return mapRecurring(row, lineItems);
}

function hydrateRecurringInvoices(
  rows: Record<string, unknown>[],
  lineItemsByRecurring: Map<string, RecurringLineItem[]>,
): RecurringInvoice[] {
  return rows.map((row) =>
    mapRecurring(row, lineItemsByRecurring.get(row.id as string) ?? []),
  );
}

export async function getAllRecurringInvoices(): Promise<RecurringInvoice[]> {
  return withDatabase(async (db) => {
    const rows = await db.getAllAsync(`${RECURRING_SELECT} ORDER BY r.nextIssueDate ASC`);
    const typedRows = rows as Record<string, unknown>[];
    const lineItemsByRecurring = await getLineItemsForRecurringInvoices(
      db,
      typedRows.map((row) => row.id as string),
    );
    return hydrateRecurringInvoices(typedRows, lineItemsByRecurring);
  });
}

export async function getRecurringInvoiceById(id: string): Promise<RecurringInvoice | null> {
  return withDatabase(async (db) => {
    const row = await db.getFirstAsync(`${RECURRING_SELECT} WHERE r.id = ?`, id);
    return row ? hydrateRecurring(db, row as Record<string, unknown>) : null;
  });
}

export async function createRecurringInvoice(input: CreateRecurringInvoiceInput): Promise<RecurringInvoice> {
  return withDatabase(async (db) => {
    const now = new Date().toISOString();
    const id = generateId();

    await db.runAsync(
      `INSERT INTO recurring_invoices (
        id, name, customerId, frequency, nextIssueDate, currency, taxRate, notes, isActive, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.name.trim(),
      input.customerId ?? null,
      input.frequency,
      input.nextIssueDate,
      input.currency ?? 'USD',
      input.taxRate ?? 0,
      input.notes?.trim() || null,
      input.isActive === false ? 0 : 1,
      now,
      now,
    );

    for (let i = 0; i < input.lineItems.length; i++) {
      const item = input.lineItems[i];
      await db.runAsync(
        `INSERT INTO recurring_line_items (id, recurringInvoiceId, description, quantity, unitPrice, sortOrder)
         VALUES (?, ?, ?, ?, ?, ?)`,
        generateId(),
        id,
        item.description.trim(),
        item.quantity,
        item.unitPrice,
        i,
      );
    }

    const row = await db.getFirstAsync(`${RECURRING_SELECT} WHERE r.id = ?`, id);
    if (!row) throw new Error('Failed to create recurring invoice');
    return hydrateRecurring(db, row as Record<string, unknown>);
  });
}

export async function updateRecurringInvoice(
  id: string,
  input: UpdateRecurringInvoiceInput,
): Promise<RecurringInvoice | null> {
  return withDatabase(async (db) => {
    const existingRow = await db.getFirstAsync(`${RECURRING_SELECT} WHERE r.id = ?`, id);
    if (!existingRow) return null;

    const existing = await hydrateRecurring(db, existingRow as Record<string, unknown>);
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE recurring_invoices SET
        name = ?, customerId = ?, frequency = ?, nextIssueDate = ?, currency = ?,
        taxRate = ?, notes = ?, isActive = ?, updatedAt = ?
       WHERE id = ?`,
      input.name?.trim() ?? existing.name,
      input.customerId !== undefined ? input.customerId : existing.customerId,
      input.frequency ?? existing.frequency,
      input.nextIssueDate ?? existing.nextIssueDate,
      input.currency ?? existing.currency,
      input.taxRate ?? existing.taxRate,
      input.notes !== undefined ? input.notes?.trim() || null : existing.notes,
      input.isActive !== undefined ? (input.isActive ? 1 : 0) : existing.isActive ? 1 : 0,
      now,
      id,
    );

    if (input.lineItems) {
      await db.runAsync('DELETE FROM recurring_line_items WHERE recurringInvoiceId = ?', id);
      for (let i = 0; i < input.lineItems.length; i++) {
        const item = input.lineItems[i];
        await db.runAsync(
          `INSERT INTO recurring_line_items (id, recurringInvoiceId, description, quantity, unitPrice, sortOrder)
           VALUES (?, ?, ?, ?, ?, ?)`,
          generateId(),
          id,
          item.description.trim(),
          item.quantity,
          item.unitPrice,
          i,
        );
      }
    }

    const row = await db.getFirstAsync(`${RECURRING_SELECT} WHERE r.id = ?`, id);
    return row ? hydrateRecurring(db, row as Record<string, unknown>) : null;
  });
}

export async function deleteRecurringInvoice(id: string): Promise<void> {
  await withDatabase(async (db) => {
    await db.runAsync('DELETE FROM recurring_line_items WHERE recurringInvoiceId = ?', id);
    await db.runAsync('DELETE FROM recurring_invoices WHERE id = ?', id);
  });
}

export async function processDueRecurringInvoices(): Promise<Invoice[]> {
  const today = toISODate();
  const all = await getAllRecurringInvoices();
  const created: Invoice[] = [];

  for (const recurring of all) {
    if (!recurring.isActive || recurring.nextIssueDate > today) continue;

    let nextDate = recurring.nextIssueDate;
    while (nextDate <= today) {
      const invoice = await createInvoice({
        customerId: recurring.customerId,
        status: 'draft',
        issueDate: nextDate,
        dueDate: null,
        currency: recurring.currency,
        taxRate: recurring.taxRate,
        notes: recurring.notes
          ? `${recurring.notes}\n\nFrom recurring: ${recurring.name}`
          : `From recurring: ${recurring.name}`,
        lineItems: recurring.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      created.push(invoice);
      nextDate = advanceRecurringDate(nextDate, recurring.frequency);
    }

    await updateRecurringInvoice(recurring.id, { nextIssueDate: nextDate });
  }

  return created;
}
