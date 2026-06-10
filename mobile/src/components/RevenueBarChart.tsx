import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';
import type { MonthlyRevenue } from '@/services/analyticsRepository';
import { monthLabelLong } from '@/services/analyticsRepository';
import { fontFamily, spacing, typography } from '@/theme';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

interface RevenueBarChartProps {
  data: MonthlyRevenue[];
  currency: string;
  currentMonthKey: string;
}

function formatCompact(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
  if (amount === 0) return `${symbol}0`;
  return `${symbol}${Math.round(amount)}`;
}

export function RevenueBarChart({ data, currency, currentMonthKey }: RevenueBarChartProps) {
  const { colors } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const chartHeight = 160;
  const hasPaidData = data.some((d) => d.total > 0);

  const activeKey = selectedMonth ?? currentMonthKey;
  const activePoint = data.find((d) => d.month === activeKey) ?? data[data.length - 1];

  if (!hasPaidData) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          Mark invoices as paid to see your revenue trend here.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.yAxisRow}>
        <Text style={[styles.yLabel, { color: colors.textSecondary }]}>{formatCompact(maxTotal, currency)}</Text>
        <View style={[styles.chartArea, { height: chartHeight, borderColor: colors.border }]}>
          <View style={[styles.gridLine, { top: '50%', backgroundColor: colors.border }]} />
          <View style={styles.barsRow}>
            {data.map((point) => {
              const barHeight = Math.max(4, (point.total / maxTotal) * (chartHeight - 8));
              const isCurrent = point.month === currentMonthKey;
              const isSelected = point.month === activeKey;
              return (
                <Pressable
                  key={point.month}
                  style={styles.barCol}
                  onPress={() => setSelectedMonth(point.month)}
                >
                  <View style={[styles.barTrack, { height: chartHeight - 4 }]}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: isSelected ? colors.accent : isCurrent ? colors.primary : colors.primaryLight,
                          borderWidth: isSelected || isCurrent ? 0 : 1,
                          borderColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.xLabel,
                      {
                        color: isSelected ? colors.primary : colors.textSecondary,
                        fontFamily: isSelected ? fontFamily.semibold : fontFamily.regular,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {point.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {activePoint ? (
        <View style={[styles.selectionPill, { backgroundColor: colors.primaryLight }]}>
          <Text style={{ color: colors.primary, fontFamily: fontFamily.semibold, fontSize: typography.sm }}>
            {monthLabelLong(activePoint.month)} · {formatCurrency(activePoint.total, currency)} paid
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderRadius: 12,
    padding: spacing.lg,
    minHeight: 120,
    justifyContent: 'center',
  },
  emptyText: { fontSize: typography.sm, textAlign: 'center', lineHeight: 20 },
  yAxisRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  yLabel: { fontSize: typography.xs, width: 36, textAlign: 'right', marginBottom: 28 },
  chartArea: {
    flex: 1,
    borderBottomWidth: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    gap: 4,
    paddingBottom: 2,
  },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { justifyContent: 'flex-end', width: '100%' },
  bar: { width: '72%', alignSelf: 'center', borderRadius: 6, minHeight: 4 },
  xLabel: { fontSize: 10, marginTop: 6, textAlign: 'center' },
  selectionPill: {
    marginTop: spacing.sm,
    borderRadius: 20,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
  },
});
