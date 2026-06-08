import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { AppMenuDrawer } from '@/components/AppMenuDrawer';
import { HeaderMenuButton } from '@/components/HeaderMenuButton';
import { AppMenuProvider } from '@/providers/AppMenuProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useSettingsStore } from '@/store/settingsStore';
import { fontFamily } from '@/theme';

export default function TabLayout() {
  const { colors } = useTheme();
  const businessName = useSettingsStore((s) => s.settings.businessName);

  return (
    <AppMenuProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
          },
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fontFamily.semibold },
          headerLeft: () => <HeaderMenuButton />,
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
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
      <AppMenuDrawer />
    </AppMenuProvider>
  );
}
