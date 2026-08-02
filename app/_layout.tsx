import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { SessionProvider } from '@/src/context/SessionContext';
import { colors } from '@/src/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <SessionProvider>
      <ThemeProvider
        value={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: colors.background,
            card: colors.surface,
            border: colors.border,
            primary: colors.primary,
            text: colors.text,
          },
        }}
      >
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="session/[id]"
            options={{ title: 'Session details' }}
          />
        </Stack>
      </ThemeProvider>
    </SessionProvider>
  );
}
