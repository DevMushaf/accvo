import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { InvoiceCard } from '@/components/InvoiceCard';
import { useTheme } from '@/providers/ThemeProvider';
import { getDashboardStats, getRecentInvoices } from '@/services/invoiceRepository';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';
import type { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/utils/currency';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const [stats, setStats] = useState({
    totalIncome: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    customerCount: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [dashboardStats, recent] = await Promise.all([
      getDashboardStats(),
      getRecentInvoices(5),
    ]);
    setStats(dashboardStats);
    setRecentInvoices(recent);
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.pageSubtitle, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Your business at a glance
      </Text>

      <Card style={styles.incomeCard}>
        <Text style={[styles.incomeLabel, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          Total income
        </Text>
        <Text style={[styles.incomeValue, { color: colors.primary, fontFamily: fontFamily.bold }]}>
          {formatCurrency(stats.totalIncome, settings.defaultCurrency)}
        </Text>
      </Card>

      <View style={styles.statsRow}>
        <StatBox label="Paid" value={stats.paidCount} colors={colors} accent={colors.success} />
        <StatBox label="Pending" value={stats.pendingCount} colors={colors} accent={colors.warning} />
        <StatBox label="Overdue" value={stats.overdueCount} colors={colors} accent={colors.error} />
      </View>

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
  incomeCard: { marginBottom: spacing.md },
  incomeLabel: { fontSize: typography.sm, marginBottom: spacing.xs },
  incomeValue: { fontSize: typography.xxl },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
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
  actions: { marginTop: spacing.md },
});
