import { getDatabase } from '@/services/localDb';
import { getNextInvoiceNumber } from '@/services/settingsRepository';
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  UpdateInvoiceInput,
} from '@/types/invoice';
import { generateId, toISODate } from '@/utils/dates';
import { calculateInvoiceTotals } from '@/utils/tax';

function mapLineItem(row: Record<string, unknown>): InvoiceLineItem {
  return {
    id: row.id as string,
    invoiceId: row.invoiceId as string,
    description: row.description as string,
    quantity: row.quantity as number,
    unitPrice: row.unitPrice as number,
    sortOrder: row.sortOrder as number,
  };
}

function mapInvoice(row: Record<string, unknown>, lineItems: InvoiceLineItem[]): Invoice {
  return {
    id: row.id as string,
    invoiceNumber: row.invoiceNumber as string,
    customerId: (row.customerId as string | null) ?? null,
    customerName: (row.customerName as string | null) ?? null,
    status: row.status as InvoiceStatus,
    issueDate: row.issueDate as string,
    dueDate: (row.dueDate as string | null) ?? null,
    currency: row.currency as string,
    taxRate: row.taxRate as number,
    subtotal: row.subtotal as number,
    taxAmount: row.taxAmount as number,
    total: row.total as number,
    notes: (row.notes as string | null) ?? null,
    lineItems,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

async function getLineItemsForInvoice(invoiceId: string): Promise<InvoiceLineItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    'SELECT * FROM invoice_line_items WHERE invoiceId = ? ORDER BY sortOrder ASC',
    invoiceId,
  );
  return rows.map((row) => mapLineItem(row as Record<string, unknown>));
}

async function hydrateInvoice(row: Record<string, unknown>): Promise<Invoice> {
  const lineItems = await getLineItemsForInvoice(row.id as string);
  return mapInvoice(row, lineItems);
}

export async function getAllInvoices(): Promise<Invoice[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(`
    SELECT i.*, c.name as customerName
    FROM invoices i
    LEFT JOIN customers c ON i.customerId = c.id
    ORDER BY i.createdAt DESC
  `);
  return Promise.all(rows.map((row) => hydrateInvoice(row as Record<string, unknown>)));
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `SELECT i.*, c.name as customerName
     FROM invoices i
     LEFT JOIN customers c ON i.customerId = c.id
     WHERE i.id = ?`,
    id,
  );
  return row ? hydrateInvoice(row as Record<string, unknown>) : null;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const invoiceNumber = await getNextInvoiceNumber();
  const taxRate = input.taxRate ?? 0;
  const totals = calculateInvoiceTotals(input.lineItems, taxRate);
  const id = generateId();

  await db.runAsync(
    `INSERT INTO invoices (
      id, invoiceNumber, customerId, status, issueDate, dueDate, currency,
      taxRate, subtotal, taxAmount, total, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    invoiceNumber,
    input.customerId ?? null,
    input.status ?? 'draft',
    input.issueDate ?? toISODate(),
    input.dueDate ?? null,
    input.currency ?? 'USD',
    taxRate,
    totals.subtotal,
    totals.taxAmount,
    totals.total,
    input.notes?.trim() || null,
    now,
    now,
  );

  for (let i = 0; i < input.lineItems.length; i++) {
    const item = input.lineItems[i];
    await db.runAsync(
      `INSERT INTO invoice_line_items (id, invoiceId, description, quantity, unitPrice, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?)`,
      generateId(),
      id,
      item.description.trim(),
      item.quantity,
      item.unitPrice,
      i,
    );
  }

  const invoice = await getInvoiceById(id);
  if (!invoice) throw new Error('Failed to create invoice');
  return invoice;
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice | null> {
  const existing = await getInvoiceById(id);
  if (!existing) return null;

  const lineItems = input.lineItems ?? existing.lineItems.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));
  const taxRate = input.taxRate ?? existing.taxRate;
  const totals = calculateInvoiceTotals(lineItems, taxRate);
  const now = new Date().toISOString();

  const db = await getDatabase();
  await db.runAsync(
    `UPDATE invoices SET
      customerId = ?, status = ?, issueDate = ?, dueDate = ?, currency = ?,
      taxRate = ?, subtotal = ?, taxAmount = ?, total = ?, notes = ?, updatedAt = ?
     WHERE id = ?`,
    input.customerId !== undefined ? input.customerId : existing.customerId,
    input.status ?? existing.status,
    input.issueDate ?? existing.issueDate,
    input.dueDate !== undefined ? input.dueDate : existing.dueDate,
    input.currency ?? existing.currency,
    taxRate,
    totals.subtotal,
    totals.taxAmount,
    totals.total,
    input.notes !== undefined ? input.notes?.trim() || null : existing.notes,
    now,
    id,
  );

  if (input.lineItems) {
    await db.runAsync('DELETE FROM invoice_line_items WHERE invoiceId = ?', id);
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      await db.runAsync(
        `INSERT INTO invoice_line_items (id, invoiceId, description, quantity, unitPrice, sortOrder)
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

  return getInvoiceById(id);
}

export async function deleteInvoice(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM invoice_line_items WHERE invoiceId = ?', id);
  await db.runAsync('DELETE FROM invoices WHERE id = ?', id);
}

export async function getDashboardStats(): Promise<{
  totalIncome: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  customerCount: number;
}> {
  const db = await getDatabase();

  const incomeRow = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status = 'paid'",
  );
  const paidRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM invoices WHERE status = 'paid'",
  );
  const pendingRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM invoices WHERE status IN ('draft', 'sent')",
  );
  const overdueRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM invoices WHERE status = 'overdue'",
  );
  const customerRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM customers',
  );

  return {
    totalIncome: incomeRow?.total ?? 0,
    paidCount: paidRow?.count ?? 0,
    pendingCount: pendingRow?.count ?? 0,
    overdueCount: overdueRow?.count ?? 0,
    customerCount: customerRow?.count ?? 0,
  };
}

export async function getRecentInvoices(limit = 5): Promise<Invoice[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT i.*, c.name as customerName
     FROM invoices i
     LEFT JOIN customers c ON i.customerId = c.id
     ORDER BY i.createdAt DESC
     LIMIT ?`,
    limit,
  );
  return Promise.all(rows.map((row) => hydrateInvoice(row as Record<string, unknown>)));
}
