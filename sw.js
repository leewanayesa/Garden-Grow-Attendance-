/* Garden Grow Attendance — Service Worker (v4)
   Upload this as sw.js in the SAME repo/folder as index.html.
   Network-first: always loads the latest app when online, falls back to cache offline.
   Does NOT touch attendance data (localStorage / IndexedDB) — only the app shell cache.
*/
const CACHE='gg-attendance-v4';

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(['./','./index.html']).catch(()=>{}))
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(Promise.all([
    self.clients.claim(),
    /* remove old caches (e.g. gg-attendance-v3) so the new app shell is used */
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  ]));
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request)
      .then(r=>{ if(r.ok){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c)).catch(()=>{})} return r; })
      .catch(()=>caches.match(e.request))
  );
});
