import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Card } from '@/components/Card';
import { FilterChips } from '@/components/FilterChips';
import { RevenueBarChart } from '@/components/RevenueBarChart';
import { StatusDonutChart } from '@/components/StatusDonutChart';
import { useTheme } from '@/providers/ThemeProvider';
import {
  getAnalyticsSummary,
  getCurrentYearMonth,
  type AnalyticsPeriodMonths,
  type AnalyticsSummary,
} from '@/services/analyticsRepository';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import { formatCurrency } from '@/utils/currency';

const PERIOD_OPTIONS: { label: string; value: AnalyticsPeriodMonths }[] = [
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '12 months', value: 12 },
];

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const currency = useSettingsStore((s) => s.settings.defaultCurrency);
  const [period, setPeriod] = useState<AnalyticsPeriodMonths>(6);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (months: AnalyticsPeriodMonths) => {
    setData(await getAnalyticsSummary(months));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load(period);
    }, [load, period]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load(period);
    setRefreshing(false);
  }

  const monthChange =
    data && data.paidLastMonth > 0
      ? ((data.paidThisMonth - data.paidLastMonth) / data.paidLastMonth) * 100
      : data && data.paidThisMonth > 0
        ? 100
        : 0;

  const topCustomerMax = Math.max(...(data?.topCustomers.map((c) => c.total) ?? [1]), 1);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        On your device · Free · Offline
      </Text>

      <FilterChips options={PERIOD_OPTIONS} selected={period} onSelect={setPeriod} />

      {data ? (
        <>
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
              Paid revenue
            </Text>
            <RevenueBarChart
              data={data.monthlyRevenue}
              currency={currency}
              currentMonthKey={getCurrentYearMonth()}
            />
          </Card>

          <View style={styles.kpiGrid}>
            <KpiCard
              label="Outstanding"
              value={formatCurrency(data.outstandingAmount, currency)}
              hint={`${data.outstandingCount} unpaid`}
              accent={colors.warning}
              colors={colors}
            />
            <KpiCard
              label="Paid this month"
              value={formatCurrency(data.paidThisMonth, currency)}
              hint="From paid invoices"
              accent={colors.success}
              colors={colors}
            />
            <KpiCard
              label="Avg. paid invoice"
              value={formatCurrency(data.averageInvoiceValue, currency)}
              hint="All time"
              accent={colors.primary}
              colors={colors}
            />
            <KpiCard
              label="Created this month"
              value={String(data.invoiceCountThisMonth)}
              hint="All statuses"
              accent={colors.text}
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
            <View
              style={[
                styles.changeBadge,
                { backgroundColor: monthChange >= 0 ? `${colors.success}18` : `${colors.error}18` },
              ]}
            >
              <Text
                style={{
                  color: monthChange >= 0 ? colors.success : colors.error,
                  fontFamily: fontFamily.semibold,
                  fontSize: typography.sm,
                }}
              >
                {monthChange >= 0 ? '+' : ''}
                {monthChange.toFixed(0)}% paid revenue
              </Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
              Invoice status
            </Text>
            <StatusDonutChart breakdown={data.statusBreakdown} />
          </Card>

          {data.topCustomers.length > 0 ? (
            <Card style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
                Top customers
              </Text>
              {data.topCustomers.map((customer, index) => (
                <View key={`${customer.customerId ?? 'none'}-${index}`} style={styles.customerBlock}>
                  <View style={styles.customerRow}>
                    <Text style={[styles.rank, { color: colors.primary, fontFamily: fontFamily.bold }]}>
                      {index + 1}
                    </Text>
                    <View style={styles.customerInfo}>
                      <Text style={{ color: colors.text, fontFamily: fontFamily.medium }}>{customer.customerName}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                        {customer.invoiceCount} paid
                      </Text>
                    </View>
                    <Text style={{ color: colors.text, fontFamily: fontFamily.semibold }}>
                      {formatCurrency(customer.total, currency)}
                    </Text>
                  </View>
                  <View style={[styles.shareTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.shareFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${Math.max(4, (customer.total / topCustomerMax) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </Card>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

function KpiCard({
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
    <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: accent, fontFamily: fontFamily.bold }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.kpiHint, { color: colors.textSecondary }]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  subtitle: { fontSize: typography.sm, marginBottom: spacing.xs },
  card: {},
  cardTitle: { marginBottom: spacing.sm },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    minWidth: '46%',
  },
  kpiLabel: { fontSize: typography.xs, marginBottom: spacing.xs },
  kpiValue: { fontSize: typography.base },
  kpiHint: { fontSize: typography.xs, marginTop: spacing.xs },
  compareRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  compareCol: { flex: 1 },
  compareLabel: { fontSize: typography.xs, marginBottom: 2 },
  compareValue: { fontSize: typography.lg },
  changeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  customerBlock: { marginBottom: spacing.md },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  rank: { width: 20, fontSize: typography.sm },
  customerInfo: { flex: 1 },
  shareTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  shareFill: { height: '100%', borderRadius: 2 },
});
