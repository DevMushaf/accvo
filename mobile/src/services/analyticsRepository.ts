import { getDatabase } from '@/services/localDb';

export interface MonthlyRevenue {
  month: string;
  label: string;
  total: number;
}

export interface TopCustomer {
  customerId: string | null;
  customerName: string;
  total: number;
  invoiceCount: number;
}

export interface AnalyticsSummary {
  totalIncome: number;
  outstandingAmount: number;
  outstandingCount: number;
  averageInvoiceValue: number;
  paidThisMonth: number;
  paidLastMonth: number;
  invoiceCountThisMonth: number;
  draftCount: number;
  customerCount: number;
  monthlyRevenue: MonthlyRevenue[];
  topCustomers: TopCustomer[];
}

function monthLabel(ym: string): string {
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function previousYearMonth(): string {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Local-only analytics — computed from SQLite, no network or cost. */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const db = await getDatabase();
  const thisMonth = currentYearMonth();
  const lastMonth = previousYearMonth();

  const incomeRow = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status = 'paid'",
  );
  const outstandingRow = await db.getFirstAsync<{ total: number; count: number }>(
    "SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count FROM invoices WHERE status IN ('sent', 'overdue')",
  );
  const avgRow = await db.getFirstAsync<{ avg: number }>(
    "SELECT COALESCE(AVG(total), 0) as avg FROM invoices WHERE status = 'paid'",
  );
  const paidThisMonthRow = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status = 'paid' AND strftime('%Y-%m', issueDate) = ?",
    thisMonth,
  );
  const paidLastMonthRow = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status = 'paid' AND strftime('%Y-%m', issueDate) = ?",
    lastMonth,
  );
  const invoiceThisMonthRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM invoices WHERE strftime('%Y-%m', createdAt) = ?",
    thisMonth,
  );
  const draftRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM invoices WHERE status = 'draft'",
  );
  const customerRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM customers',
  );

  const monthlyRows = await db.getAllAsync<{ month: string; total: number }>(
    `SELECT strftime('%Y-%m', issueDate) as month, COALESCE(SUM(total), 0) as total
     FROM invoices WHERE status = 'paid'
     GROUP BY month ORDER BY month DESC LIMIT 6`,
  );

  const topCustomerRows = await db.getAllAsync<{
    customerId: string | null;
    customerName: string | null;
    total: number;
    invoiceCount: number;
  }>(
    `SELECT i.customerId, COALESCE(c.name, 'No customer') as customerName,
            COALESCE(SUM(i.total), 0) as total, COUNT(*) as invoiceCount
     FROM invoices i
     LEFT JOIN customers c ON i.customerId = c.id
     WHERE i.status = 'paid'
     GROUP BY i.customerId
     ORDER BY total DESC
     LIMIT 5`,
  );

  const monthlyRevenue = monthlyRows
    .map((row) => ({
      month: row.month,
      label: monthLabel(row.month),
      total: row.total,
    }))
    .reverse();

  return {
    totalIncome: incomeRow?.total ?? 0,
    outstandingAmount: outstandingRow?.total ?? 0,
    outstandingCount: outstandingRow?.count ?? 0,
    averageInvoiceValue: avgRow?.avg ?? 0,
    paidThisMonth: paidThisMonthRow?.total ?? 0,
    paidLastMonth: paidLastMonthRow?.total ?? 0,
    invoiceCountThisMonth: invoiceThisMonthRow?.count ?? 0,
    draftCount: draftRow?.count ?? 0,
    customerCount: customerRow?.count ?? 0,
    monthlyRevenue,
    topCustomers: topCustomerRows.map((row) => ({
      customerId: row.customerId,
      customerName: row.customerName ?? 'No customer',
      total: row.total,
      invoiceCount: row.invoiceCount,
    })),
  };
}
