/* Garden Grow Attendance — Service Worker (v46)
   Upload as sw.js in the SAME GitHub repo/folder as index.html.
   • Network-first: always loads the newest app when online, falls back to the
     saved copy offline.
   • Change CACHE below on every index.html update so phones pick it up.
   • Never touches attendance data (localStorage / IndexedDB) and never caches
     the Google Sheet sync calls.
*/
const CACHE = 'gg-attendance-v46';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
});

/* the app asks a newly installed version to take over right away */
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
  ]));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  /* Only the app's own files (and its fonts) are handled here. Everything else —
     above all the Google Sheet sync calls — goes straight to the network. */
  const isFont = /^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== self.location.origin && !isFont) return;
  e.respondWith(
    fetch(req)
      .then(r => {
        if (r.ok) {
          const c = r.clone();
          caches.open(CACHE).then(ca => ca.put(req, c)).catch(() => {});
        }
        return r;
      })
      .catch(() => caches.match(req, {ignoreSearch: true}).then(m => m || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
