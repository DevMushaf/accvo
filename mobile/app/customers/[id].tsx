import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { KeyboardAwareScreen } from '@/components/KeyboardAwareScreen';
import { useTheme } from '@/providers/ThemeProvider';
import { deleteCustomer, getCustomerById, updateCustomer } from '@/services/customerRepository';
import { fontFamily, spacing, typography } from '@/theme';
import type { Customer } from '@/types/customer';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCustomer = useCallback(async () => {
    if (!id) return;
    const data = await getCustomerById(id);
    if (data) {
      setCustomer(data);
      setName(data.name);
      setEmail(data.email ?? '');
      setPhone(data.phone ?? '');
      setNotes(data.notes ?? '');
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadCustomer();
    }, [loadCustomer]),
  );

  async function handleSave() {
    if (!customer || !name.trim()) return;
    setLoading(true);
    try {
      const updated = await updateCustomer(customer.id, { name, email, phone, notes });
      if (updated) setCustomer(updated);
      Alert.alert('Saved', 'Customer updated.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!customer) return;
    Alert.alert('Delete customer', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCustomer(customer.id);
          router.back();
        },
      },
    ]);
  }

  if (!customer) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScreen
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <Text style={[styles.created, { color: colors.textSecondary, fontFamily: fontFamily.regular }]}>
          Customer since {new Date(customer.createdAt).toLocaleDateString()}
        </Text>
      </Card>

      <Input label="Name *" value={name} onChangeText={setName} />
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />

      <Button title="Save changes" onPress={handleSave} loading={loading} />
      <View style={{ marginTop: spacing.sm }}>
        <Button title="Delete customer" variant="danger" onPress={handleDelete} />
      </View>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  created: { fontSize: typography.sm },
});
