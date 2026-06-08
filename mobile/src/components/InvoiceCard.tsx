import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { StatusChip } from '@/components/StatusChip';
import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, spacing, typography } from '@/theme';
import type { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/dates';

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Pressable onPress={() => router.push(`/invoices/${invoice.id}`)}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.number, { color: colors.text, fontFamily: fontFamily.semibold }]}>
            {invoice.invoiceNumber}
          </Text>
          <StatusChip status={invoice.status} />
        </View>
        <Text
          style={[styles.customer, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}
        >
          {invoice.customerName ?? 'No customer'}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.date, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
            {formatDisplayDate(invoice.issueDate)}
          </Text>
          <Text style={[styles.total, { color: colors.primary, fontFamily: fontFamily.bold }]}>
            {formatCurrency(invoice.total, invoice.currency)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  number: {
    fontSize: typography.base,
  },
  customer: {
    fontSize: typography.sm,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: typography.xs,
  },
  total: {
    fontSize: typography.lg,
  },
});
