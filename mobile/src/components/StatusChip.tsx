import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, radius, typography } from '@/theme';
import type { InvoiceStatus } from '@/types/invoice';

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
};

interface StatusChipProps {
  status: InvoiceStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  const { colors } = useTheme();

  const backgroundColor =
    status === 'paid'
      ? '#DCFCE7'
      : status === 'overdue'
        ? '#FEE2E2'
        : status === 'sent'
          ? '#FEF3C7'
          : colors.primaryLight;

  const textColor =
    status === 'paid'
      ? colors.success
      : status === 'overdue'
        ? colors.error
        : status === 'sent'
          ? colors.warning
          : colors.primary;

  return (
    <View style={[styles.chip, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor, fontFamily: fontFamily.medium }]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  text: {
    fontSize: typography.xs,
    textTransform: 'uppercase',
  },
});
