import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/Card';
import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, spacing, typography } from '@/theme';
import type { Customer } from '@/types/customer';

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Pressable onPress={() => router.push(`/customers/${customer.id}`)}>
      <Card style={styles.card}>
        <Text style={[styles.name, { color: colors.text, fontFamily: fontFamily.semibold }]}>
          {customer.name}
        </Text>
        {customer.email ? (
          <Text
            style={[styles.detail, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}
          >
            {customer.email}
          </Text>
        ) : null}
        {customer.phone ? (
          <Text
            style={[styles.detail, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}
          >
            {customer.phone}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: typography.base,
    marginBottom: spacing.xs,
  },
  detail: {
    fontSize: typography.sm,
  },
});
