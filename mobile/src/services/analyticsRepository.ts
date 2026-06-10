import { withDatabase } from '@/services/localDb';

export type AnalyticsPeriodMonths = 3 | 6 | 12;

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

export interface StatusBreakdown {
  paid: number;
  sent: number;
  overdue: number;
  draft: number;
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
  statusBreakdown: StatusBreakdown;
}

function monthLabel(ym: string): string {
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'short' });
}

export function monthLabelLong(ym: string): string {
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
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

function buildMonthlySeries(
  rows: { month: string; total: number }[],
  months: AnalyticsPeriodMonths,
): MonthlyRevenue[] {
  const lookup = new Map(rows.map((row) => [row.month, row.total]));
  const series: MonthlyRevenue[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    series.push({
      month: key,
      label: monthLabel(key),
      total: lookup.get(key) ?? 0,
    });
  }

  return series;
}

/** Local-only analytics — computed from SQLite, no network or cost. */
export async function getAnalyticsSummary(months: AnalyticsPeriodMonths = 6): Promise<AnalyticsSummary> {
  return withDatabase(async (db) => {
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
     GROUP BY month ORDER BY month ASC`,
  );

  const statusRows = await db.getAllAsync<{ status: string; count: number }>(
    'SELECT status, COUNT(*) as count FROM invoices GROUP BY status',
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

  const statusBreakdown: StatusBreakdown = { paid: 0, sent: 0, overdue: 0, draft: 0 };
  for (const row of statusRows) {
    if (row.status in statusBreakdown) {
      statusBreakdown[row.status as keyof StatusBreakdown] = row.count;
    }
  }

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
    monthlyRevenue: buildMonthlySeries(monthlyRows, months),
    topCustomers: topCustomerRows.map((row) => ({
      customerId: row.customerId,
      customerName: row.customerName ?? 'No customer',
      total: row.total,
      invoiceCount: row.invoiceCount,
    })),
    statusBreakdown,
  };
  });
}

export function getCurrentYearMonth(): string {
  return currentYearMonth();
}
