self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let payload = {};
      try {
        if (event.data) {
          try {
            payload = event.data.json();
          } catch {
            payload = JSON.parse(event.data.text());
          }
        }
      } catch {
        payload = {};
      }

      const title = (payload && payload.title) || 'LUMINA';
      const body = (payload && payload.body) || '';
      const url = (payload && payload.url) || '/oracle';

      try {
        await self.registration.showNotification(title, {
          body,
          icon: '/icons/apple-touch-icon.png',
          badge: '/icons/apple-touch-icon.png',
          data: { url },
        });
      } catch {}
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/oracle';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if (client.url && client.url.includes(url)) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
