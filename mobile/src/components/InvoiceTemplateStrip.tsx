import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';
import { INVOICE_TEMPLATE_OPTIONS } from '@/types/invoiceTemplate';
import type { InvoiceTemplate } from '@/types/invoiceTemplate';
import { fontFamily, spacing, typography } from '@/theme';

function TemplateMiniPreview({ colors: previewColors }: { colors: [string, string, string] }) {
  const [header, table, footer] = previewColors;
  return (
    <View style={miniStyles.doc}>
      <View style={[miniStyles.headerBar, { backgroundColor: header }]} />
      <View style={miniStyles.body}>
        <View style={[miniStyles.line, { backgroundColor: table }]} />
        <View style={[miniStyles.line, { backgroundColor: '#E5E7EB' }]} />
        <View style={[miniStyles.line, { backgroundColor: table, opacity: 0.5 }]} />
      </View>
      <View style={[miniStyles.footerBar, { backgroundColor: footer }]} />
    </View>
  );
}

interface InvoiceTemplateStripProps {
  selectedId: InvoiceTemplate;
  onSelect: (id: InvoiceTemplate) => void;
}

export function InvoiceTemplateStrip({ selectedId, onSelect }: InvoiceTemplateStripProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.text, fontFamily: fontFamily.semibold }]}>
        Select Template
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {INVOICE_TEMPLATE_OPTIONS.map((option) => {
          const selected = option.id === selectedId;
          return (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              style={[
                styles.item,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primaryLight : colors.surface,
                },
              ]}
            >
              <TemplateMiniPreview colors={option.previewColors} />
              <Text
                style={[
                  styles.label,
                  {
                    color: selected ? colors.primary : colors.textSecondary,
                    fontFamily: selected ? fontFamily.semibold : fontFamily.regular,
                  },
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const miniStyles = StyleSheet.create({
  doc: {
    width: 44,
    height: 56,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerBar: { height: 14 },
  body: { flex: 1, padding: 4, gap: 3, justifyContent: 'center' },
  line: { height: 5, borderRadius: 2 },
  footerBar: { height: 8 },
});

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  heading: { fontSize: typography.sm, paddingHorizontal: spacing.xs },
  scrollContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  item: {
    width: 76,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 12,
    borderWidth: 2,
    gap: spacing.xs,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
  },
});
