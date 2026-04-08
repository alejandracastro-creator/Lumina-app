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

export function trackPageView(path: string) {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  window.gtag('event', 'page_view', {
    page_location: window.location.href,
    page_path: path,
  });
}
