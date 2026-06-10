import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { useTheme } from '@/providers/ThemeProvider';
import type { AnalyticsSummary } from '@/services/analyticsRepository';
import { fontFamily, spacing, typography } from '@/theme';
import { formatCurrency } from '@/utils/currency';

interface AnalyticsTeaserCardProps {
  data: AnalyticsSummary;
  currency: string;
}

export function AnalyticsTeaserCard({ data, currency }: AnalyticsTeaserCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const maxTotal = Math.max(...data.monthlyRevenue.map((m) => m.total), 1);
  const monthChange =
    data.paidLastMonth > 0
      ? ((data.paidThisMonth - data.paidLastMonth) / data.paidLastMonth) * 100
      : data.paidThisMonth > 0
        ? 100
        : 0;

  return (
    <Pressable onPress={() => router.push('/analytics')}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.semibold }]}>Analytics</Text>
          <View style={styles.linkRow}>
            <Text style={[styles.link, { color: colors.primary, fontFamily: fontFamily.medium }]}>
              View full analytics
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </View>
        </View>

        <View style={styles.miniChart}>
          {data.monthlyRevenue.slice(-6).map((month) => (
            <View key={month.month} style={styles.miniCol}>
              <View style={[styles.miniTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.miniBar,
                    {
                      height: `${Math.max(8, (month.total / maxTotal) * 100)}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.meta, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          Outstanding {formatCurrency(data.outstandingAmount, currency)} · {data.outstandingCount} invoice
          {data.outstandingCount === 1 ? '' : 's'}
          {monthChange !== 0 ? (
            <Text style={{ color: monthChange >= 0 ? colors.success : colors.error }}>
              {' '}
              · {monthChange >= 0 ? '+' : ''}
              {monthChange.toFixed(0)}% vs last month
            </Text>
          ) : null}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: typography.base },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  link: { fontSize: typography.sm },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 48,
    marginBottom: spacing.sm,
  },
  miniCol: { flex: 1, height: '100%' },
  miniTrack: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  miniBar: { width: '100%', borderRadius: 4, minHeight: 4 },
  meta: { fontSize: typography.xs, lineHeight: 18 },
});
