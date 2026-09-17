
self.addEventListener("install", (event) => {
  console.log("Service worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
});

self.addEventListener("fetch", (event) => {
  // Pass-through fetch handler to satisfy PWA requirements
  event.respondWith(fetch(event.request));
});
