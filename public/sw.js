const CACHE_NAME = 'focusbuddy-shell-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/pwa-icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('focusbuddy-') && key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        void caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
        return response;
      }).catch(async () => await caches.match('/') || await caches.match('/index.html'))
    );
    return;
  }

  if (/\.(?:js|css|svg|png|jpg|webp|woff2?)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      const network = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
      return cached || network;
    })());
  }
});

// ---------------------------------------------------------------------------
// Push Notification Handlers (work even when app / browser tab is closed)
// ---------------------------------------------------------------------------

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'FocusBuddy', body: event.data.text() };
  }

  const title = data.title || 'FocusBuddy Reminder';
  const options = {
    body: data.body || '',
    icon: data.icon || '/pwa-icon.svg',
    badge: data.badge || '/pwa-icon.svg',
    image: data.image, // Large banner image inside notification
    vibrate: [300, 100, 400, 100, 400, 100, 300], // Richer vibration pattern
    tag: data.tag || 'focusbuddy-notification',
    renotify: true,
    requireInteraction: true, // Keeps the notification on screen until interacted with
    actions: data.actions || [
      { action: 'open', title: 'Open Task 🚀' },
      { action: 'dismiss', title: 'Dismiss ❌' }
    ],
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Handle "Dismiss" action explicitly
  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(targetUrl);
    })
  );
});