// Service Worker for SmartRW-AI Web Push notifications
const CACHE_NAME = 'smartrw-ai-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through for fetch to keep app fully online-enabled and real-time (leaving fetch un-interfered)
self.addEventListener('fetch', (event) => {
  // Let the browser handle standard requests naturally
});

// Listens to standard Web Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: 'Sinyal Utama SmartRW-AI', body: 'Terjadi darurat wilayah!', icon: '/logosmartrwai.png' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data = {
        title: 'Peringatan Darurat SOS 🚨',
        body: event.data.text(),
        icon: '/logosmartrwai.png'
      };
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logosmartrwai.png',
    badge: '/logosmartrwai.png',
    sound: 'default',
    vibrate: [200, 100, 200, 100, 200, 100, 400],
    data: {
      url: data.url || '/'
    },
    tag: 'sos-alert',
    requireInteraction: true // Keeps the SOS notification on screen until user clicks it
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handles click event on Notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Or open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
