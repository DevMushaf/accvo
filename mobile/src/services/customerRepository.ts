import { getDatabase } from '@/services/localDb';
import type { CreateCustomerInput, Customer, UpdateCustomerInput } from '@/types/customer';
import { generateId } from '@/utils/dates';

function mapRow(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

export async function getAllCustomers(): Promise<Customer[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM customers ORDER BY name ASC');
  return rows.map((row) => mapRow(row as Record<string, unknown>));
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT * FROM customers WHERE id = ?', id);
  return row ? mapRow(row as Record<string, unknown>) : null;
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const customer: Customer = {
    id: generateId(),
    name: input.name.trim(),
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    notes: input.notes?.trim() || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO customers (id, name, email, phone, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    customer.id,
    customer.name,
    customer.email,
    customer.phone,
    customer.notes,
    customer.createdAt,
    customer.updatedAt,
  );

  return customer;
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput,
): Promise<Customer | null> {
  const existing = await getCustomerById(id);
  if (!existing) return null;

  const updated: Customer = {
    ...existing,
    ...input,
    name: input.name?.trim() ?? existing.name,
    email: input.email !== undefined ? input.email?.trim() || null : existing.email,
    phone: input.phone !== undefined ? input.phone?.trim() || null : existing.phone,
    notes: input.notes !== undefined ? input.notes?.trim() || null : existing.notes,
    updatedAt: new Date().toISOString(),
  };

  const db = await getDatabase();
  await db.runAsync(
    `UPDATE customers SET name = ?, email = ?, phone = ?, notes = ?, updatedAt = ? WHERE id = ?`,
    updated.name,
    updated.email,
    updated.phone,
    updated.notes,
    updated.updatedAt,
    id,
  );

  return updated;
}

export async function deleteCustomer(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM customers WHERE id = ?', id);
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const db = await getDatabase();
  const pattern = `%${query.trim()}%`;
  const rows = await db.getAllAsync(
    `SELECT * FROM customers
     WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
     ORDER BY name ASC`,
    pattern,
    pattern,
    pattern,
  );
  return rows.map((row) => mapRow(row as Record<string, unknown>));
}
