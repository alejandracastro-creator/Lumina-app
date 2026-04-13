const MEASUREMENT_ID = process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID || 'G-J7Y2KJ4MCM';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: any[]) => void;
  }
}

let initialized = false;

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  if (initialized || typeof window.gtag === 'function') return;
  initialized = true;

  if (!window.dataLayer) window.dataLayer = [];
  window.gtag =
    window.gtag ||
    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    };

  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

  const existing = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"]`);
  if (!existing) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }
}

function getTitleForPath(path: string): string {
  const clean = (path || '/').split('?')[0].split('#')[0];
  const map: Record<string, string> = {
    '/': 'Home',
    '/(tabs)': 'Home',
    '/oracle': 'Oráculo',
    '/(tabs)/oracle': 'Oráculo',
    '/ritual': 'Ritual',
    '/(tabs)/ritual': 'Ritual',
    '/process': 'Tu Proceso',
    '/(tabs)/process': 'Tu Proceso',
    '/sos': 'S.O.S.',
    '/(tabs)/sos': 'S.O.S.',
    '/login': 'Login',
  };
  const base = map[clean] || 'LUMINA';
  return base === 'LUMINA' ? base : `${base} | LUMINA`;
}

export function trackPageView(path?: string) {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  const pagePath = path || `${window.location.pathname}${window.location.search || ''}${window.location.hash || ''}`;
  const title = getTitleForPath(pagePath) || document.title || 'LUMINA';
  window.gtag('config', MEASUREMENT_ID, {
    page_title: title,
    page_location: window.location.href,
    page_path: pagePath,
    send_page_view: true,
  });
}
