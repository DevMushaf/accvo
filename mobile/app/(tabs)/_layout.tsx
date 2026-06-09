import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useMemo } from 'react';

import { HeaderMenuButton } from '@/components/HeaderMenuButton';
import { useTheme } from '@/providers/ThemeProvider';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily } from '@/theme';

const renderHeaderLeft = () => <HeaderMenuButton />;

export default function TabLayout() {
  const { colors } = useTheme();
  const businessName = useSettingsStore((s) => s.settings.businessName);

  const screenOptions = useMemo(
    () => ({
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.tabBar,
        borderTopColor: colors.tabBarBorder,
      },
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerTitleStyle: { fontFamily: fontFamily.semibold },
      headerLeft: renderHeaderLeft,
      sceneStyle: { backgroundColor: colors.background },
    }),
    [colors],
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: businessName || 'Accvo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Invoices',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
