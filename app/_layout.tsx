import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { initAnalytics, trackPageView } from '@/lib/analytics';
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
  const [notifPromptOpen, setNotifPromptOpen] = useState(false);
  const [notifSupported, setNotifSupported] = useState(false);
  const [notifPermission, setNotifPermission] = useState<'default' | 'denied' | 'granted'>('default');
  const [notifEnabled, setNotifEnabled] = useState(false);

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
    if (!user) return;
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

    const isAfterTargetTime = () => {
      const now = new Date();
      const t = new Date(now);
      t.setHours(10, 30, 0, 0);
      return now.getTime() >= t.getTime();
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

    const showOracleNotification = async (markShown: boolean) => {
      const iso = getLocalIsoDate();
      const perm = (window as any).Notification?.permission;
      if (perm !== 'granted') return;
      if (markShown && window.localStorage.getItem(LAST_SHOWN_KEY) === iso) return;

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
          if (markShown) window.localStorage.setItem(LAST_SHOWN_KEY, iso);
        }
      } catch {}
    };

    const syncState = () => {
      const supported = !!(window as any).Notification && !!(window.navigator as any)?.serviceWorker;
      setNotifSupported(supported);
      const perm = (window as any).Notification?.permission ?? 'default';
      setNotifPermission(perm);
      const enabled = window.localStorage.getItem(ENABLED_KEY) === '1';
      setNotifEnabled(enabled);
      const prompted = window.localStorage.getItem(PROMPT_KEY) === '1';
      if (supported && !prompted) setNotifPromptOpen(true);
    };

    const showIfDue = async () => {
      const enabled = window.localStorage.getItem(ENABLED_KEY) === '1';
      if (!enabled) return;
      if (!isAfterTargetTime()) return;
      await showOracleNotification(true);
    };

    const scheduleNext = async () => {
      if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
      const enabled = window.localStorage.getItem(ENABLED_KEY) === '1';
      if (!enabled) return;
      const delay = computeNextDelayMs();
      reminderTimerRef.current = setTimeout(async () => {
        await showOracleNotification(true);
        await scheduleNext();
      }, delay);
    };

    (async () => {
      syncState();
      await showIfDue();
      await scheduleNext();
    })();

    const onVis = () => {
      if (document.visibilityState === 'visible') {
        showIfDue();
        scheduleNext();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [authReady, user]);

  const handleNotifDecline = () => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('lumina_oracle_notif_prompted_v1', '1');
    setNotifPromptOpen(false);
    setNotifEnabled(false);
  };

  const handleNotifEnable = async () => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('lumina_oracle_notif_prompted_v1', '1');
    try {
      const perm = await (window as any).Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        window.localStorage.setItem('lumina_oracle_notif_enabled_v1', '1');
        setNotifEnabled(true);
        try {
          const reg = await (window.navigator as any).serviceWorker?.register?.('/sw.js', { scope: '/' });
          try {
            await reg?.showNotification?.('LUMINA', {
              body: 'Recordatorios del Oráculo activados.',
              icon: '/icons/apple-touch-icon.png',
              badge: '/icons/apple-touch-icon.png',
              tag: 'lumina-oracle-test',
              data: { url: '/oracle' },
            });
          } catch {}
        } catch {}
      }
    } catch {}
    setNotifPromptOpen(false);
  };

  if (!fontsLoaded) return null;
  if (!authReady) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {Platform.OS === 'web' && notifSupported && notifPromptOpen && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setNotifPromptOpen(false)}>
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.55)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 22,
            }}
            onPress={() => setNotifPromptOpen(false)}
          >
            <Pressable
              style={{
                width: '100%',
                maxWidth: 520,
                backgroundColor: 'rgba(26, 16, 61, 0.96)',
                borderRadius: 22,
                padding: 16,
                borderWidth: 1,
                borderColor: 'rgba(196, 181, 253, 0.35)',
              }}
              onPress={() => undefined}
            >
              <Text style={{ color: '#E9D5FF', fontSize: 18, fontWeight: '900', marginBottom: 10 }}>
                Recordatorio del Oráculo
              </Text>
              <Text style={{ color: 'rgba(233, 213, 255, 0.88)', fontSize: 14, lineHeight: 20 }}>
                Si querés, LUMINA puede enviarte un recordatorio diario a las 10:30 para que mires tu carta.
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14, gap: 10 }}>
                <TouchableOpacity
                  onPress={handleNotifDecline}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.16)',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  <Text style={{ color: '#E9D5FF', fontSize: 12, fontWeight: '800' }}>Ahora no</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNotifEnable}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: 'rgba(251, 207, 232, 0.65)',
                    backgroundColor: 'rgba(219, 39, 119, 0.78)',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900' }}>Activar</Text>
                </TouchableOpacity>
              </View>
              {notifPermission === 'denied' && (
                <Text style={{ color: 'rgba(253, 186, 116, 0.95)', fontSize: 12, marginTop: 10, lineHeight: 16 }}>
                  Las notificaciones están bloqueadas para este sitio. Activálas en la configuración del navegador.
                </Text>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </ThemeProvider>
  );
}
