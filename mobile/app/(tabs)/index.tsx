import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { AnalyticsTeaserCard } from '@/components/AnalyticsTeaserCard';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { BusinessSetupCard, GuestPromptBanner } from '@/components/GuestPromptBanner';
import { InvoiceCard } from '@/components/InvoiceCard';
import { useTheme } from '@/providers/ThemeProvider';
import { getAnalyticsSummary } from '@/services/analyticsRepository';
import { getDashboardStats, getRecentInvoices } from '@/services/invoiceRepository';
import { processDueRecurringInvoices } from '@/services/recurringInvoiceRepository';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import type { AnalyticsSummary } from '@/services/analyticsRepository';
import type { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/utils/currency';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const defaultCurrency = useSettingsStore((s) => s.settings.defaultCurrency);
  const [stats, setStats] = useState({
    totalIncome: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    customerCount: 0,
  });
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recurringCreated, setRecurringCreated] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const created = await processDueRecurringInvoices();
    setRecurringCreated(created.length);

    const [dashboardStats, recent, analyticsData] = await Promise.all([
      getDashboardStats(),
      getRecentInvoices(5),
      getAnalyticsSummary(6),
    ]);
    setStats(dashboardStats);
    setRecentInvoices(recent);
    setAnalytics(analyticsData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const monthChange =
    analytics && analytics.paidLastMonth > 0
      ? ((analytics.paidThisMonth - analytics.paidLastMonth) / analytics.paidLastMonth) * 100
      : analytics && analytics.paidThisMonth > 0
        ? 100
        : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.pageSubtitle, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Your business at a glance
      </Text>

      <GuestPromptBanner />
      <BusinessSetupCard />

      {recurringCreated > 0 ? (
        <Card style={styles.recurringBanner}>
          <Text style={{ color: colors.text, fontFamily: fontFamily.medium }}>
            {recurringCreated} draft invoice{recurringCreated === 1 ? '' : 's'} created from recurring schedules.
          </Text>
        </Card>
      ) : null}

      <Card style={styles.incomeCard}>
        <Text style={[styles.incomeLabel, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          Total income
        </Text>
        <Text style={[styles.incomeValue, { color: colors.primary, fontFamily: fontFamily.bold }]}>
          {formatCurrency(stats.totalIncome, defaultCurrency)}
        </Text>
        {monthChange !== 0 && analytics ? (
          <Text
            style={[
              styles.incomeDelta,
              { color: monthChange >= 0 ? colors.success : colors.error, fontFamily: fontFamily.medium },
            ]}
          >
            {monthChange >= 0 ? '+' : ''}
            {monthChange.toFixed(0)}% paid revenue vs last month
          </Text>
        ) : null}
      </Card>

      <View style={styles.statsRow}>
        <StatBox label="Paid" value={stats.paidCount} colors={colors} accent={colors.success} />
        <StatBox label="Pending" value={stats.pendingCount} colors={colors} accent={colors.warning} />
        <StatBox label="Overdue" value={stats.overdueCount} colors={colors} accent={colors.error} />
      </View>

      {analytics ? <AnalyticsTeaserCard data={analytics} currency={defaultCurrency} /> : null}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          Recent invoices
        </Text>
      </View>

      {recentInvoices.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular }}>
            No invoices yet. Create your first one to start tracking income.
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <Button title="Create invoice" onPress={() => router.push('/invoices/create')} />
          </View>
        </Card>
      ) : (
        recentInvoices.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)
      )}

      <View style={styles.actions}>
        <Button title="New invoice" onPress={() => router.push('/invoices/create')} />
        <Button title="Recurring invoices" variant="secondary" onPress={() => router.push('/recurring')} />
      </View>
    </ScrollView>
  );
}

function StatBox({
  label,
  value,
  colors,
  accent,
}: {
  label: string;
  value: number;
  colors: { surface: string; text: string; border: string };
  accent: string;
}) {
  return (
    <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: accent, fontFamily: fontFamily.bold }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.text, fontFamily: fontFamily.regular }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  pageSubtitle: { fontSize: typography.sm, marginBottom: spacing.md },
  recurringBanner: { marginBottom: spacing.md },
  incomeCard: { marginBottom: spacing.md },
  incomeLabel: { fontSize: typography.sm, marginBottom: spacing.xs },
  incomeValue: { fontSize: typography.xxl },
  incomeDelta: { fontSize: typography.sm, marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: typography.xl },
  statLabel: { fontSize: typography.xs, marginTop: spacing.xs },
  sectionHeader: { marginBottom: spacing.sm },
  sectionTitle: { fontSize: typography.lg },
  actions: { marginTop: spacing.md, gap: spacing.sm },
});
