const CACHE_NAME = "jorge-organizer-v4";
const ASSETS = [
  "/organizer.html",
  "/organizer-manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  // Network-first for Firebase requests, cache-first for static assets
  const url = new URL(event.request.url);
  if (url.hostname.includes("firebase") || url.hostname.includes("google") || url.hostname.includes("gstatic") || url.hostname.includes("googleapis")) {
    return; // Externe Dienste direkt laden, nicht cachen
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
