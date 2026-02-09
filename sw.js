const CACHE_NAME = 'pl-tracker-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://img.icons8.com/ios-filled/512/football.png'
];

// Install: Cache the basic app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches if version changes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
});

// Fetch: Handle requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For API calls (football data), try network first, then fallback to cache
  if (url.href.includes('api.football-data.org') || url.href.includes('corsproxy.io')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedRes = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedRes));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // For static files (HTML/CSS), use cache first
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
