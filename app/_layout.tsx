import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
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
  const reminderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!authReady) return;
    if (typeof window === 'undefined') return;

    const PROMPT_KEY = 'lumina_oracle_notif_prompted_v1';
    const ENABLED_KEY = 'lumina_oracle_notif_enabled_v1';
    const LAST_SHOWN_KEY = 'lumina_oracle_notif_last_shown_v1';
    const MESSAGES = [
      '🌟¿Ya viste qué carta te revela el Oráculo hoy?',
      '🌟 Tu mensaje del Oráculo ya está listo.',
      '🌟¿Qué tiene LUMINA para vos hoy? Descubrí tu carta.',
      '🌟 Un momento para vos: Mirá qué dice el Oráculo.',
    ];

    const getLocalIsoDate = (date: Date = new Date()) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const isoToUtcDayNumber = (iso: string) => {
      const [y, m, d] = iso.split('-').map((v) => Number(v));
      return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
    };

    const computeNextDelayMs = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(10, 30, 0, 0);
      if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
      return Math.max(0, next.getTime() - now.getTime());
    };

    const selectMessage = (iso: string) => {
      const idx = isoToUtcDayNumber(iso) % MESSAGES.length;
      return MESSAGES[(idx + MESSAGES.length) % MESSAGES.length];
    };

    const ensureServiceWorker = async () => {
      try {
        const nav: any = window.navigator;
        if (!nav?.serviceWorker) return null;
        const reg = await nav.serviceWorker.register('/sw.js', { scope: '/' });
        try {
          await reg.update();
        } catch {}
        return reg;
      } catch {
        return null;
      }
    };

    const showOracleNotification = async () => {
      const iso = getLocalIsoDate();
      if (window.localStorage.getItem(LAST_SHOWN_KEY) === iso) return;
      const perm = (window as any).Notification?.permission;
      if (perm !== 'granted') return;

      const reg = await ensureServiceWorker();
      const body = selectMessage(iso);
      try {
        if (reg?.showNotification) {
          await reg.showNotification('LUMINA', {
            body,
            icon: '/icons/apple-touch-icon.png',
            badge: '/icons/apple-touch-icon.png',
            tag: `lumina-oracle-${iso}`,
            data: { url: '/oracle' },
          });
          window.localStorage.setItem(LAST_SHOWN_KEY, iso);
        }
      } catch {}
    };

    const scheduleNext = async () => {
      if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
      const enabled = window.localStorage.getItem(ENABLED_KEY) === '1';
      if (!enabled) return;
      const delay = computeNextDelayMs();
      reminderTimerRef.current = setTimeout(async () => {
        await showOracleNotification();
        await scheduleNext();
      }, delay);
    };

    const maybePrompt = async () => {
      const alreadyPrompted = window.localStorage.getItem(PROMPT_KEY) === '1';
      if (alreadyPrompted) return;
      window.localStorage.setItem(PROMPT_KEY, '1');
      if (!(window as any).Notification) return;
      const ok = window.confirm('¿Querés activar recordatorios diarios del Oráculo a las 10:30?');
      if (!ok) return;
      try {
        const perm = await (window as any).Notification.requestPermission();
        if (perm === 'granted') {
          window.localStorage.setItem(ENABLED_KEY, '1');
          await ensureServiceWorker();
        }
      } catch {}
    };

    (async () => {
      await maybePrompt();
      await scheduleNext();
    })();

    return () => {
      if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
    };
  }, [authReady]);

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
