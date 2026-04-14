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
  const vapidPublicKey = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;
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

    const payload = { subscription: sub?.toJSON ? sub.toJSON() : sub };
    const res = await fetch('/.netlify/functions/push-subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
