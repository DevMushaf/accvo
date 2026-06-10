import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { useTheme } from '@/providers/ThemeProvider';
import type { StatusBreakdown } from '@/services/analyticsRepository';
import { fontFamily, spacing, typography } from '@/theme';

interface StatusDonutChartProps {
  breakdown: StatusBreakdown;
}

const SIZE = 148;
const STROKE = 22;

export function StatusDonutChart({ breakdown }: StatusDonutChartProps) {
  const { colors } = useTheme();
  const segments = [
    { key: 'paid', label: 'Paid', value: breakdown.paid, color: colors.success },
    { key: 'sent', label: 'Sent', value: breakdown.sent, color: colors.warning },
    { key: 'overdue', label: 'Overdue', value: breakdown.overdue, color: colors.error },
    { key: 'draft', label: 'Draft', value: breakdown.draft, color: colors.border },
  ];

  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.chartCol}>
        <Svg width={SIZE} height={SIZE}>
          <G rotation="-90" origin={`${SIZE / 2}, ${SIZE / 2}`}>
            {total === 0 ? (
              <Circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={radius}
                stroke={colors.border}
                strokeWidth={STROKE}
                fill="transparent"
              />
            ) : (
              segments.map((seg) => {
                if (seg.value === 0) return null;
                const dash = (seg.value / total) * circumference;
                const element = (
                  <Circle
                    key={seg.key}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={radius}
                    stroke={seg.color}
                    strokeWidth={STROKE}
                    fill="transparent"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  />
                );
                offset += dash;
                return element;
              })
            )}
          </G>
        </Svg>
        <View style={styles.centerLabel} pointerEvents="none">
          <Text style={[styles.centerValue, { color: colors.text, fontFamily: fontFamily.bold }]}>{total}</Text>
          <Text style={[styles.centerHint, { color: colors.textSecondary }]}>invoices</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {segments.map((seg) => (
          <View key={seg.key} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: seg.color }]} />
            <Text style={[styles.legendLabel, { color: colors.text, fontFamily: fontFamily.regular }]}>
              {seg.label}
            </Text>
            <Text style={[styles.legendValue, { color: colors.text, fontFamily: fontFamily.semibold }]}>
              {seg.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  chartCol: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  centerLabel: { position: 'absolute', alignItems: 'center' },
  centerValue: { fontSize: typography.xl },
  centerHint: { fontSize: typography.xs },
  legend: { flex: 1, gap: spacing.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: typography.sm },
  legendValue: { fontSize: typography.sm },
});
