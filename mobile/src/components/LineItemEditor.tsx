import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Input } from '@/components/Input';
import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, spacing, typography } from '@/theme';
import type { CreateLineItemInput } from '@/types/invoice';

interface LineItemEditorProps {
  items: CreateLineItemInput[];
  onChange: (items: CreateLineItemInput[]) => void;
}

export function LineItemEditor({ items, onChange }: LineItemEditorProps) {
  const { colors } = useTheme();

  function updateItem(index: number, field: keyof CreateLineItemInput, value: string) {
    const next = [...items];
    const item = { ...next[index] };
    if (field === 'description') {
      item.description = value;
    } else {
      item[field] = parseFloat(value) || 0;
    }
    next[index] = item;
    onChange(next);
  }

  function addItem() {
    onChange([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length === 1) return;
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <View>
      <Text style={[styles.heading, { color: colors.text, fontFamily: fontFamily.semibold }]}>
        Line items
      </Text>
      {items.map((item, index) => (
        <View key={index} style={[styles.row, { borderColor: colors.border }]}>
          <View style={styles.rowHeader}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Item {index + 1}</Text>
            {items.length > 1 ? (
              <Pressable onPress={() => removeItem(index)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </Pressable>
            ) : null}
          </View>
          <Input
            label="Description"
            value={item.description}
            onChangeText={(v) => updateItem(index, 'description', v)}
            placeholder="Web design, consultation..."
          />
          <View style={styles.inline}>
            <View style={styles.half}>
              <Input
                label="Qty"
                value={String(item.quantity)}
                onChangeText={(v) => updateItem(index, 'quantity', v)}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.half}>
              <Input
                label="Unit price"
                value={String(item.unitPrice)}
                onChangeText={(v) => updateItem(index, 'unitPrice', v)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>
      ))}
      <Pressable onPress={addItem} style={styles.addButton}>
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={[styles.addText, { color: colors.primary, fontFamily: fontFamily.medium }]}>
          Add line item
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: typography.base,
    marginBottom: spacing.sm,
  },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  rowLabel: {
    fontSize: typography.xs,
    fontFamily: fontFamily.medium,
  },
  inline: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  half: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  addText: {
    fontSize: typography.sm,
  },
});
