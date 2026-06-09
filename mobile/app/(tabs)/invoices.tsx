import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { InvoiceCard } from '@/components/InvoiceCard';
import { SearchBar } from '@/components/SearchBar';
import { useTheme } from '@/providers/ThemeProvider';
import { getAllInvoices } from '@/services/invoiceRepository';
import { fontFamily, spacing, typography } from '@/theme';
import type { Invoice, InvoiceStatus } from '@/types/invoice';

type StatusFilter = 'all' | InvoiceStatus;

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
];

export default function InvoicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const loadInvoices = useCallback(async () => {
    const data = await getAllInvoices();
    setInvoices(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadInvoices();
    }, [loadInvoices]),
  );

  const filteredInvoices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (statusFilter !== 'all' && invoice.status !== statusFilter) return false;
      if (!normalized) return true;
      const haystack = [
        invoice.invoiceNumber,
        invoice.customerName ?? '',
        invoice.notes ?? '',
        invoice.status,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [invoices, query, statusFilter]);

  const showEmpty = invoices.length === 0;
  const showNoResults = !showEmpty && filteredInvoices.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showEmpty ? (
        <EmptyState
          title="No invoices yet"
          message="Create professional invoices and share them as PDFs."
          actionLabel="Create invoice"
          onAction={() => router.push('/invoices/create')}
        />
      ) : (
        <>
          <View style={styles.toolbar}>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Search invoices..." />
            <FilterChips options={STATUS_FILTERS} selected={statusFilter} onSelect={setStatusFilter} />
            <Pressable
              style={[styles.recurringLink, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => router.push('/recurring')}
            >
              <Ionicons name="repeat-outline" size={18} color={colors.primary} />
              <Text style={[styles.recurringText, { color: colors.text, fontFamily: fontFamily.medium }]}>
                Recurring schedules
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {showNoResults ? (
            <View style={styles.noResults}>
              <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular }}>
                No invoices match your search.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredInvoices}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => <InvoiceCard invoice={item} />}
            />
          )}
        </>
      )}

      {!showEmpty ? (
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
  toolbar: { padding: spacing.md, paddingBottom: 0, gap: spacing.sm },
  recurringLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  recurringText: { flex: 1, fontSize: typography.sm },
  list: { padding: spacing.md, paddingBottom: 80 },
  noResults: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
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
