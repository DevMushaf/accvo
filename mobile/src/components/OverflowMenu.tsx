import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/providers/ThemeProvider';
import { fontFamily, radius, spacing, typography } from '@/theme';

export interface OverflowMenuItem {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface OverflowMenuProps {
  visible: boolean;
  onClose: () => void;
  items: OverflowMenuItem[];
}

export function OverflowMenu({ visible, onClose, items }: OverflowMenuProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />
        <View
          style={[
            styles.menu,
            {
              top: insets.top + 44,
              right: spacing.md,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {items.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={() => {
                onClose();
                item.onPress();
              }}
              style={({ pressed }) => [
                styles.item,
                index < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                pressed && { backgroundColor: colors.primaryLight },
              ]}
            >
              <Text
                style={[
                  styles.itemText,
                  {
                    color: item.destructive ? colors.error : colors.text,
                    fontFamily: fontFamily.medium,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  menu: {
    position: 'absolute',
    minWidth: 200,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  item: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  itemText: {
    fontSize: typography.base,
  },
});
