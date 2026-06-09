import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { useTheme } from '@/providers/ThemeProvider';
import type { RecurringInvoice } from '@/types/recurringInvoice';
import { fontFamily, spacing, typography } from '@/theme';
import { formatCurrency } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/dates';
import { frequencyLabel } from '@/utils/recurringDates';
import { calculateInvoiceTotals } from '@/utils/tax';

interface RecurringInvoiceCardProps {
  recurring: RecurringInvoice;
}

export function RecurringInvoiceCard({ recurring }: RecurringInvoiceCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const totals = calculateInvoiceTotals(
    recurring.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    recurring.taxRate,
  );

  return (
    <Pressable onPress={() => router.push(`/recurring/${recurring.id}`)}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text, fontFamily: fontFamily.semibold }]}>
            {recurring.name}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: recurring.isActive ? colors.primaryLight : colors.border },
            ]}
          >
            <Text
              style={{
                color: recurring.isActive ? colors.primary : colors.textSecondary,
                fontFamily: fontFamily.medium,
                fontSize: typography.xs,
              }}
            >
              {recurring.isActive ? 'Active' : 'Paused'}
            </Text>
          </View>
        </View>
        <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular, fontSize: typography.sm }}>
          {frequencyLabel(recurring.frequency)} · Next {formatDisplayDate(recurring.nextIssueDate)}
        </Text>
        <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular, fontSize: typography.sm }}>
          {recurring.customerName ?? 'No customer'} · {formatCurrency(totals.total, recurring.currency)}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  name: { fontSize: typography.base, flex: 1, marginRight: spacing.sm },
  badge: { borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: 2 },
});
