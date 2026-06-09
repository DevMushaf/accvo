import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppMenu } from '@/providers/AppMenuProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily, spacing, typography } from '@/theme';

const DRAWER_WIDTH = 280;

interface MenuItemProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? colors.primaryLight : 'transparent' },
      ]}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={[styles.menuLabel, { color: colors.text, fontFamily: fontFamily.medium }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function AppMenuDrawer() {
  const { isOpen, closeMenu } = useAppMenu();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const subscriptionTier = useSettingsStore((s) => s.settings.subscriptionTier);
  const [visible, setVisible] = useState(false);
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      translateX.value = withTiming(0, { duration: 250 });
      return;
    }

    if (visible) {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200 });
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, translateX, visible]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  function navigateTo(path: '/settings' | '/upgrade' | '/business-card') {
    closeMenu();
    setVisible(false);
    router.push(path);
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeMenu}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeMenu} accessibilityLabel="Close menu" />
        <Animated.View
          style={[
            styles.panel,
            panelStyle,
            {
              backgroundColor: colors.surface,
              paddingTop: insets.top + spacing.md,
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}
        >
          <View style={styles.logoRow}>
            <Image
              source={require('../../assets/images/logo-icon-only.png')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <Text style={[styles.logoText, { color: colors.primary, fontFamily: fontFamily.bold }]}>
              Accvo
            </Text>
          </View>

          <View style={styles.menuSection}>
            <MenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => navigateTo('/settings')}
            />
            <MenuItem
              icon="card-outline"
              label="Business Card"
              onPress={() => navigateTo('/business-card')}
            />
            {subscriptionTier === 'free' ? (
              <MenuItem
                icon="star-outline"
                label="Upgrade to Pro"
                onPress={() => navigateTo('/upgrade')}
              />
            ) : null}
          </View>

          <Text
            style={[
              styles.footer,
              { color: colors.textSecondary, fontFamily: fontFamily.regular },
            ]}
          >
            Accvo v1.0.0
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  logoIcon: {
    width: 40,
    height: 40,
  },
  logoText: {
    fontSize: typography.xl,
  },
  menuSection: {
    flex: 1,
    gap: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    minHeight: 48,
  },
  menuLabel: {
    fontSize: typography.base,
  },
  footer: {
    fontSize: typography.xs,
    paddingHorizontal: spacing.sm,
  },
});
