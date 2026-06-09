import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { CustomerCard } from '@/components/CustomerCard';
import { EmptyState } from '@/components/EmptyState';
import { SearchBar } from '@/components/SearchBar';
import { useTheme } from '@/providers/ThemeProvider';
import { getAllCustomers } from '@/services/customerRepository';
import { fontFamily, spacing } from '@/theme';
import type { Customer } from '@/types/customer';

export default function CustomersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');

  const loadCustomers = useCallback(async () => {
    const data = await getAllCustomers();
    setCustomers(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCustomers();
    }, [loadCustomers]),
  );

  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return customers;
    return customers.filter((customer) => {
      const haystack = [customer.name, customer.email ?? '', customer.phone ?? '', customer.notes ?? '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [customers, query]);

  const showEmpty = customers.length === 0;
  const showNoResults = !showEmpty && filteredCustomers.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showEmpty ? (
        <EmptyState
          title="No customers yet"
          message="Save customer details to attach them to invoices."
          actionLabel="Add customer"
          onAction={() => router.push('/customers/create')}
        />
      ) : (
        <>
          <View style={styles.toolbar}>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Search customers..." />
          </View>
          {showNoResults ? (
            <View style={styles.noResults}>
              <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.regular }}>
                No customers match your search.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => <CustomerCard customer={item} />}
            />
          )}
        </>
      )}

      {!showEmpty ? (
        <Pressable
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/customers/create')}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { padding: spacing.md, paddingBottom: spacing.sm },
  list: { padding: spacing.md, paddingTop: 0, paddingBottom: 80 },
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
