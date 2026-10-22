/**
 * Parampara Heritage — Service Worker (sw.js)
 * High-performance PWA caching engine with Stale-While-Revalidate & Network-First strategies.
 */

const CACHE_VERSION = 'parampara-v1.4';
const STATIC_CACHE = `parampara-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `parampara-runtime-${CACHE_VERSION}`;

// Core static assets to precache for offline shell
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './profile.html',
  './checkout.html',
  './search.html',
  './states.html',
  './state_categories.html',
  './artisans.html',
  './about.html',
  './favicon.png',
  './assets/parampara_logo_crest.webp',
  './css/profile.css',
  './css/widget.css',
  './js/components.js',
  './js/auth.js',
  './js/nav.js',
  './js/profile.js',
  './js/checkout.js',
  './js/widget.js'
];

// Install Event — Precache essential app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Non-fatal precache asset notice:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — Invalidate obsolete cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('parampara-') && name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Strategic caching routing
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET requests and browser-extension requests
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-First with cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallback = await caches.match('./index.html');
          return fallback || new Response('<h1>Parampara Heritage Archive Offline</h1><p>Please check your internet connection.</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // 2. Data catalog files (/data/*.json): Stale-While-Revalidate
  if (url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cachedRes = await cache.match(req);
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            cache.put(req, networkRes.clone());
          }
          return networkRes;
        }).catch(() => cachedRes);

        return cachedRes || fetchPromise;
      })
    );
    return;
  }

  // 3. Static Assets (CSS, JS, Fonts, Images): Network-First with Cache Fallback
  const isStatic = (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com')
  );

  if (isStatic) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          return caches.match(req);
        })
    );
    return;
  }

  // 4. Default: Network with Cache Fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
