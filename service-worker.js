// Service Worker for NJ Rainbow Convention 2026 PWA
const CACHE_NAME = 'nj-rainbow-2026-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/profile.html',
  '/admin.html',
  '/my-schedule.html',
  '/schedule.html',
  '/meet-nj.html',
  '/speakers.html',
  '/notifications.html',
  '/checklist.html',
  '/messages.html',
  '/notes.html',
  '/gallery.html',
  '/styles.css',
  '/auth.js',
  '/admin-script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Strategy: Network First, Fall Back to Cache
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseClone = response.clone();
        
        // Cache the new response
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // If not in cache and offline, return offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background Sync (for future message/notification sync)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

function syncMessages() {
  // Placeholder for future background sync functionality
  return Promise.resolve();
}

// Push Notifications (for future implementation)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from NJ Rainbow Convention',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('NJ Rainbow Convention 2026', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
