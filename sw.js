// ===== ZENVI SERVICE WORKER v1.0 =====
const CACHE_NAME = "zenvi-v3";
const PRECACHE = ["./","./index.html","./style.css","./script.js","./manifest.json"];
// Notify on update
self.addEventListener("message", e => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
const STATIC_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./assets/icon.png",
  "./assets/icon2.png",
  "./assets/logo.png",
  "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap",
  "https://fonts.googleapis.com/icon?family=Material+Icons+Round",
  "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js"
];

// Install — cache static files
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Zenvi: Caching files...");
      return cache.addAll(STATIC_FILES).catch(err => console.warn("Cache partial:", err));
    })
  );
  self.skipWaiting();
});

// Activate — clear old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
  console.log("✅ Zenvi SW: Activated");
});

// Fetch — cache first for static, network first for API
self.addEventListener("fetch", (e) => {
  const url = e.request.url;

  // Skip non-GET requests
  if (e.request.method !== "GET") return;

  // Skip Firebase, Mappls API, Gemini API — always fresh
  if (url.includes("firebase") || url.includes("mappls") ||
      url.includes("generativelanguage") || url.includes("data.gov.in") ||
      url.includes("nominatim")) {
    return; // Network only for APIs
  }

  // Cache first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache new responses
        if (response.ok && (url.includes("fonts.googleapis") || url.includes("jsdelivr"))) {
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, response.clone()));
        }
        return response;
      }).catch(() => {
        return caches.match("./index.html");
      });
    })
  );
});
