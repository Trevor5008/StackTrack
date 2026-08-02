import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colors } from '@/src/theme';

/**
 * root layout for the tabs
 * - style the tab bar and the headers
 * - it is also used to navigate between the tabs
 * - it is also used to style the headers
 * - it is also used to style the headers
*/
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}>
      {/* dashboard screen */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 21 }}>♠</Text>
          ),
        }}
      />
      {/* add session screen */}
      <Tabs.Screen
        name="add-session"
        options={{
          title: 'Add Session',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>＋</Text>
          ),
        }}
      />
      {/* history screen */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>≡</Text>
          ),
        }}
      />
      {/* settings screen */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 19 }}>⚙</Text>
          ),
        }}
      />
    </Tabs>
  );
}
