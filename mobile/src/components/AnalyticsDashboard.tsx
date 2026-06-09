import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { useTheme } from '@/providers/ThemeProvider';
import type { AnalyticsSummary } from '@/services/analyticsRepository';
import { fontFamily, spacing, typography } from '@/theme';
import { formatCurrency } from '@/utils/currency';

interface AnalyticsDashboardProps {
  data: AnalyticsSummary;
  currency: string;
}

export function AnalyticsDashboard({ data, currency }: AnalyticsDashboardProps) {
  const { colors } = useTheme();
  const maxMonthly = Math.max(...data.monthlyRevenue.map((m) => m.total), 1);
  const monthChange =
    data.paidLastMonth > 0
      ? ((data.paidThisMonth - data.paidLastMonth) / data.paidLastMonth) * 100
      : data.paidThisMonth > 0
        ? 100
        : 0;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: fontFamily.semibold }]}>
        Analytics
      </Text>
      <Text style={[styles.sectionHint, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Calculated on your device — free, offline, no tracking services.
      </Text>

      <View style={styles.metricsRow}>
        <MetricCard
          label="Outstanding"
          value={formatCurrency(data.outstandingAmount, currency)}
          hint={`${data.outstandingCount} invoice${data.outstandingCount === 1 ? '' : 's'}`}
          accent={colors.warning}
          colors={colors}
        />
        <MetricCard
          label="Avg. paid invoice"
          value={formatCurrency(data.averageInvoiceValue, currency)}
          hint="All time"
          accent={colors.primary}
          colors={colors}
        />
      </View>

      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          This month vs last
        </Text>
        <View style={styles.compareRow}>
          <View style={styles.compareCol}>
            <Text style={[styles.compareLabel, { color: colors.textSecondary }]}>This month</Text>
            <Text style={[styles.compareValue, { color: colors.success, fontFamily: fontFamily.bold }]}>
              {formatCurrency(data.paidThisMonth, currency)}
            </Text>
          </View>
          <View style={styles.compareCol}>
            <Text style={[styles.compareLabel, { color: colors.textSecondary }]}>Last month</Text>
            <Text style={[styles.compareValue, { color: colors.text, fontFamily: fontFamily.bold }]}>
              {formatCurrency(data.paidLastMonth, currency)}
            </Text>
          </View>
        </View>
        <Text style={[styles.changeText, { color: monthChange >= 0 ? colors.success : colors.error }]}>
          {monthChange >= 0 ? '+' : ''}
          {monthChange.toFixed(0)}% paid revenue change
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {data.invoiceCountThisMonth} invoice{data.invoiceCountThisMonth === 1 ? '' : 's'} created this month
        </Text>
      </Card>

      {data.monthlyRevenue.length > 0 ? (
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
            Paid revenue (last 6 months)
          </Text>
          {data.monthlyRevenue.map((month) => (
            <View key={month.month} style={styles.barRow}>
              <Text style={[styles.barLabel, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
                {month.label}
              </Text>
              <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${Math.max(4, (month.total / maxMonthly) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barValue, { color: colors.text, fontFamily: fontFamily.medium }]}>
                {formatCurrency(month.total, currency)}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      {data.topCustomers.length > 0 ? (
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
            Top customers by paid revenue
          </Text>
          {data.topCustomers.map((customer, index) => (
            <View
              key={`${customer.customerId ?? 'none'}-${index}`}
              style={[styles.customerRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.customerRank, { color: colors.primary, fontFamily: fontFamily.bold }]}>
                {index + 1}
              </Text>
              <View style={styles.customerInfo}>
                <Text style={{ color: colors.text, fontFamily: fontFamily.medium }}>{customer.customerName}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sm }}>
                  {customer.invoiceCount} paid invoice{customer.invoiceCount === 1 ? '' : 's'}
                </Text>
              </View>
              <Text style={{ color: colors.text, fontFamily: fontFamily.semibold }}>
                {formatCurrency(customer.total, currency)}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}

function MetricCard({
  label,
  value,
  hint,
  accent,
  colors,
}: {
  label: string;
  value: string;
  hint: string;
  accent: string;
  colors: { surface: string; border: string; textSecondary: string };
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent, fontFamily: fontFamily.bold }]}>{value}</Text>
      <Text style={[styles.metricHint, { color: colors.textSecondary }]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  sectionHeading: { fontSize: typography.lg, marginBottom: spacing.xs },
  sectionHint: { fontSize: typography.xs, marginBottom: spacing.md, lineHeight: 18 },
  metricsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  metricLabel: { fontSize: typography.xs, marginBottom: spacing.xs },
  metricValue: { fontSize: typography.base },
  metricHint: { fontSize: typography.xs, marginTop: spacing.xs },
  card: { marginBottom: spacing.md },
  cardTitle: { marginBottom: spacing.sm },
  compareRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  compareCol: { flex: 1 },
  compareLabel: { fontSize: typography.xs, marginBottom: 2 },
  compareValue: { fontSize: typography.lg },
  changeText: { fontSize: typography.sm, fontFamily: fontFamily.medium, marginBottom: spacing.xs },
  meta: { fontSize: typography.xs },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  barLabel: { width: 52, fontSize: typography.xs },
  barTrack: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  barValue: { width: 72, fontSize: typography.xs, textAlign: 'right' },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  customerRank: { width: 20, fontSize: typography.sm },
  customerInfo: { flex: 1 },
});
