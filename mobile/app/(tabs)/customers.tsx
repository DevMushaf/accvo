import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { CustomerCard } from '@/components/CustomerCard';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/providers/ThemeProvider';
import { getAllCustomers } from '@/services/customerRepository';
import { spacing } from '@/theme';
import type { Customer } from '@/types/customer';

export default function CustomersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);

  const loadCustomers = useCallback(async () => {
    const data = await getAllCustomers();
    setCustomers(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCustomers();
    }, [loadCustomers]),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          message="Save customer details to attach them to invoices."
          actionLabel="Add customer"
          onAction={() => router.push('/customers/create')}
        />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <CustomerCard customer={item} />}
        />
      )}

      {customers.length > 0 ? (
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
