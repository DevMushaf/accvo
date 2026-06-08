import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useAppMenu } from '@/providers/AppMenuProvider';
import { useTheme } from '@/providers/ThemeProvider';

export function HeaderMenuButton() {
  const { openMenu } = useAppMenu();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={openMenu}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
    >
      <Ionicons name="menu-outline" size={24} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
