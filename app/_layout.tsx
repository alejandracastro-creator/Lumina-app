import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { initAnalytics, trackPageView } from '../lib/analytics';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font, PlayfairDisplay_700Bold });
  const pathname = usePathname();
  const router = useRouter();
  const [authReady, setAuthReady] = useState(Platform.OS !== 'web');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    initAnalytics();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!pathname) return;
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let mounted = true;
    let poll: ReturnType<typeof setInterval> | null = null;

    const attach = () => {
      const identity = (globalThis as any)?.netlifyIdentity || (window as any)?.netlifyIdentity;
      if (!identity) return false;

      identity.on('init', (u: any) => {
        if (!mounted) return;
        setUser(u ?? null);
        setAuthReady(true);
      });
      identity.on('login', (u: any) => {
        if (!mounted) return;
        setUser(u ?? null);
        try {
          identity.close();
        } catch {}
        router.replace('/(tabs)');
      });
      identity.on('logout', () => {
        if (!mounted) return;
        setUser(null);
        router.replace('/login');
      });

      try {
        identity.init();
      } catch {
        setAuthReady(true);
      }

      return true;
    };

    if (!attach()) {
      poll = setInterval(() => {
        if (attach() && poll) {
          clearInterval(poll);
          poll = null;
        }
      }, 80);
    }

    return () => {
      mounted = false;
      if (poll) clearInterval(poll);
    };
  }, [router]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!authReady) return;
    if (!pathname) return;

    const allowlist = pathname === '/login' || pathname === '/+not-found' || pathname === '/_sitemap';
    if (!user && !allowlist) {
      router.replace('/login');
      return;
    }
    if (user && pathname === '/login') {
      router.replace('/(tabs)');
    }
  }, [authReady, pathname, router, user]);

  if (!fontsLoaded) return null;
  if (!authReady) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
