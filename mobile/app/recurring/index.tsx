import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/components/EmptyState';
import { RecurringInvoiceCard } from '@/components/RecurringInvoiceCard';
import { useTheme } from '@/providers/ThemeProvider';
import { getAllRecurringInvoices } from '@/services/recurringInvoiceRepository';
import { fontFamily, spacing, typography } from '@/theme';
import type { RecurringInvoice } from '@/types/recurringInvoice';

export default function RecurringInvoicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [items, setItems] = useState<RecurringInvoice[]>([]);

  const load = useCallback(async () => {
    setItems(await getAllRecurringInvoices());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
        Draft invoices are created automatically when a schedule is due.
      </Text>

      {items.length === 0 ? (
        <EmptyState
          title="No recurring invoices"
          message="Set up a schedule for retainers, rent, or subscriptions."
          actionLabel="Add recurring invoice"
          onAction={() => router.push('/recurring/create')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <RecurringInvoiceCard recurring={item} />}
        />
      )}

      {items.length > 0 ? (
        <Pressable
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/recurring/create')}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hint: { fontSize: typography.sm, padding: spacing.md, paddingBottom: 0, lineHeight: 20 },
  list: { padding: spacing.md, paddingBottom: 80 },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
