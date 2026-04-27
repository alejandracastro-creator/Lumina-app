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

function normalizePath(path: string): string {
  const clean = (path || '/').split('?')[0].split('#')[0];
  const withoutGroups = clean.replace(/\/\([^/]+\)/g, '');
  return withoutGroups.length ? withoutGroups : '/';
}

function getTitleForPath(path: string): string {
  const clean = normalizePath(path || '/');
  const map: Record<string, string> = {
    '/': 'Home',
    '/oracle': 'Oráculo',
    '/ritual': 'Ritual',
    '/process': 'Tu Proceso',
    '/sos': 'S.O.S.',
    '/login': 'Login',
  };
  const base = map[clean] || 'LUMINA';
  return base === 'LUMINA' ? base : `${base} | LUMINA`;
}

export function trackPageView(path?: string) {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  const rawPath = path || `${window.location.pathname}${window.location.search || ''}${window.location.hash || ''}`;
  const pagePath = normalizePath(rawPath);
  const title = getTitleForPath(pagePath) || document.title || 'LUMINA';
  const pageLocation = window.location.href;

  window.gtag('event', 'page_view', {
    page_title: title,
    page_location: pageLocation,
    page_path: pagePath,
  });

  const screenName = pagePath;
  window.gtag('event', 'screen_view', {
    screen_name: screenName,
    firebase_screen: screenName,
    firebase_screen_class: 'expo-router',
  });
}
