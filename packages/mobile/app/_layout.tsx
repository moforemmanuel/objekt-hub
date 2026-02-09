import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useAuthStore } from '@/stores/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthRedirect() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    setNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isNavigationReady]);

  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthRedirect />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="objects/create"
          options={{ title: 'Create Object', presentation: 'modal' }}
        />
        <Stack.Screen name="objects/[id]" options={{ title: 'Object Details' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
