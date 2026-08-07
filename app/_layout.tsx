import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import 'react-native-reanimated';

// Context providers
import { LiveSessionProvider } from '@/src/context/LiveSessionContext';
import { SessionProvider } from '@/src/context/SessionContext';
import { colors } from '@/src/theme';

// Expo Router error boundary
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Expo Router unstable settings
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * Root layout
 * @returns {JSX.Element}
 * @description This component is used to render the root layout.
 * @example
 * <RootLayout />
 */
export default function RootLayout() {
  // Load fonts
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Handle errors
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Hide splash screen
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Render loading indicator
  if (!loaded) {
    return null;
  }

  // Render root layout navigation
  return <RootLayoutNav />;
}

/**
 * Root layout navigation
 * @returns {JSX.Element}
 * @description This component is used to render the root layout navigation.
 * @example
 * <RootLayoutNav />
 */
function RootLayoutNav() {
  const navigationTheme = useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: colors.background,
        card: colors.surface,
        border: colors.border,
        primary: colors.primary,
        text: colors.text,
      },
    }),
    [],
  );

  return (
    <SessionProvider>
      <LiveSessionProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: colors.background },
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerTitleStyle: { fontWeight: '700' },
              headerBackButtonDisplayMode: 'minimal',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerBackTitle: 'Back', headerShown: false }} />
            <Stack.Screen name="live" options={{ title: 'Active session', headerBackTitle: 'Back' }} />
            <Stack.Screen
              name="session/[id]"
              options={{ title: 'Session details', headerBackTitle: 'Back' }}
            />
          </Stack>
        </ThemeProvider>
      </LiveSessionProvider>
    </SessionProvider>
  );
}
