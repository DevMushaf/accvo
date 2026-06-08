import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/components/EmptyState';
import { InvoiceCard } from '@/components/InvoiceCard';
import { useTheme } from '@/providers/ThemeProvider';
import { getAllInvoices } from '@/services/invoiceRepository';
import { spacing } from '@/theme';
import type { Invoice } from '@/types/invoice';

export default function InvoicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const loadInvoices = useCallback(async () => {
    const data = await getAllInvoices();
    setInvoices(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadInvoices();
    }, [loadInvoices]),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          message="Create professional invoices and share them as PDFs."
          actionLabel="Create invoice"
          onAction={() => router.push('/invoices/create')}
        />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <InvoiceCard invoice={item} />}
        />
      )}

      {invoices.length > 0 ? (
        <Pressable
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/invoices/create')}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
