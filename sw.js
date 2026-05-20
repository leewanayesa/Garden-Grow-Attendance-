/* Garden Grow Attendance — Service Worker
   Upload this file as sw.js in the SAME folder as GardenGrow_Attendance_App.html on Netlify.
   This enables true offline support and proper PWA / APK installation.
*/
const CACHE='gg-attendance-v3';

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>
      c.addAll(['./','./GardenGrow_Attendance_App.html'])
      .catch(()=>{})
    )
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  ]));
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request)
      .then(r=>{
        if(r.ok){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c)).catch(()=>{})}
        return r;
      })
      .catch(()=>caches.match(e.request))
  );
});
