import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useTheme } from '@/providers/ThemeProvider';
import { createCustomer } from '@/services/customerRepository';
import { spacing } from '@/theme';

export default function CreateCustomerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a customer name.');
      return;
    }

    setLoading(true);
    try {
      const customer = await createCustomer({ name, email, phone, notes });
      router.replace(`/customers/${customer.id}`);
    } catch {
      Alert.alert('Error', 'Could not save customer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Input label="Name *" value={name} onChangeText={setName} placeholder="John Smith" autoFocus />
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
      <Button title="Save customer" onPress={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
});
