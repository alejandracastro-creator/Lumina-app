import Constants from 'expo-constants';
import { Platform } from 'react-native';

const VAPID_PUBLIC_KEY = 'BBrN0_QQxEEFLP1eGddPQGoBqE1_iNpXPRcMJdk_9iCaebgydQXS9BfV_lCYL1mtdl8PRkQkVaM8bjzQ85_Olvs';
const LAST_PUSH_ENDPOINT_KEY = 'lumina_last_push_endpoint_v1';

async function loadExpoNotifications() {
  return await import('expo-notifications');
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') return null;
  const nav: any = window.navigator;
  if (!nav?.serviceWorker) return null;
  try {
    const reg = await nav.serviceWorker.register('/sw.js', { scope: '/' });
    try {
      await reg.update();
    } catch {}
    return reg;
  } catch {
    return null;
  }
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (Platform.OS !== 'web') {
    try {
      const Notifications = await loadExpoNotifications();
      const existing = await Notifications.getPermissionsAsync();
      if (existing.status === 'granted') return 'granted';
      const res = await Notifications.requestPermissionsAsync();
      return res.status === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }

  if (typeof window === 'undefined') return 'denied';
  const NotificationApi: any = (window as any).Notification;
  if (!NotificationApi?.requestPermission) return 'denied';
  try {
    const perm: NotificationPermission = await NotificationApi.requestPermission();
    return perm;
  } catch {
    return NotificationApi.permission ?? 'default';
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = globalThis.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function ensurePushSubscription(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const perm = (window as any).Notification?.permission;
  if (perm !== 'granted') return false;
  const extraKey =
    (Constants as any)?.expoConfig?.extra?.vapidPublicKey ??
    (Constants as any)?.manifest?.extra?.vapidPublicKey ??
    (Constants as any)?.manifest2?.extra?.vapidPublicKey;
  const vapidPublicKey = extraKey || process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    try {
      console.error('push: missing EXPO_PUBLIC_VAPID_PUBLIC_KEY');
    } catch {}
    return false;
  }

  const reg = await registerServiceWorker();
  if (!reg?.pushManager) return false;

  try {
    let sub: any = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    const serialized = sub?.toJSON ? sub.toJSON() : sub;
    const currentEndpoint = serialized?.endpoint || null;
    let previousEndpoint: string | null = null;
    try {
      previousEndpoint = window.localStorage.getItem(LAST_PUSH_ENDPOINT_KEY);
    } catch {}

    const payload = { subscription: serialized, previousEndpoint };
    const res = await fetch('/.netlify/functions/push-subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok && currentEndpoint) {
      try {
        window.localStorage.setItem(LAST_PUSH_ENDPOINT_KEY, currentEndpoint);
      } catch {}
    }
    if (!res.ok) {
      let detail = '';
      try {
        detail = await res.text();
      } catch {}
      try {
        console.error('push: push-subscribe failed', res.status, detail);
      } catch {}
    }
    return res.ok;
  } catch (err) {
    try {
      console.error('push: subscribe failed', err);
    } catch {}
    return false;
  }
}

export async function subscribeToPush(): Promise<boolean> {
  return ensurePushSubscription();
}

export async function ensureDailyLocalNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const Notifications = await loadExpoNotifications();
    const perm = await requestPermission();
    if (perm !== 'granted') return false;

    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0B0720',
      });
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    const morningMessages = [
      '🌟¿Ya viste qué carta te revela el Oráculo hoy?',
      '🌟 Tu mensaje del Oráculo ya está listo.',
      '🌟¿Qué tiene LUMINA para vos hoy? Descubrí tu carta.',
      '🌟 Un momento para vos: Mirá qué dice el Oráculo.',
    ];

    const nightMessages = [
      'Tu ritual nocturno te espera 🌙',
      'Cerrá el día con intención ✨',
      'Un momento para vos antes de dormir 🕯️',
      'El ritual de la noche está listo 🌟',
    ];

    const day = Math.floor(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()) / 86400000);
    const morningBody = morningMessages[((day % morningMessages.length) + morningMessages.length) % morningMessages.length];
    const nightBody = nightMessages[((day % nightMessages.length) + nightMessages.length) % nightMessages.length];

    await Notifications.scheduleNotificationAsync({
      content: { title: 'LUMINA', body: morningBody, data: { url: '/oracle' } },
      trigger: { hour: 9, minute: 0, repeats: true },
    });

    await Notifications.scheduleNotificationAsync({
      content: { title: 'LUMINA', body: nightBody, data: { url: '/ritual' } },
      trigger: { hour: 20, minute: 0, repeats: true },
    });

    return true;
  } catch {
    return false;
  }
}

export async function scheduleLocalNotification(title: string, body: string, delayMinutes: number): Promise<void> {
  if (typeof window === 'undefined') return;
  const perm = (window as any).Notification?.permission;
  if (perm !== 'granted') return;

  const reg = await registerServiceWorker();
  if (!reg?.showNotification) return;

  const delayMs = Math.max(0, Math.floor(delayMinutes * 60 * 1000));
  window.setTimeout(() => {
    try {
      reg.showNotification(title, {
        body,
        icon: '/icons/apple-touch-icon.png',
        badge: '/icons/apple-touch-icon.png',
        data: { url: '/oracle' },
      });
    } catch {}
  }, delayMs);
}
