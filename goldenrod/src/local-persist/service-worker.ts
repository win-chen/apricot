// Change version number when cache urls change to clear cache
const APP_CACHE = "app-cache-v1";
const STATIC_URLS = [
  "/", // index.html
];

self.addEventListener("activate", (event: ExtendableEvent) => {
  console.log("Service Worker activated");
  const cacheWhitelist = [APP_CACHE];

  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName); // Delete the old cache
            }
          })
        );
      }),
      // Claim control of all clients immediately
      self.clients.claim(),
    ])
  );
});

self.addEventListener("install", (event: ExtendableEvent) => {
  // Do not wait until existing service worker (from other opened tabs) are closed and take control of the page
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      try {
        // Fetch the manifest.json file
        const manifestResponse = await fetch("/.vite/manifest.json");

        // Check if the response is OK
        if (!manifestResponse.ok) {
          throw new Error("Manifest file not found");
        }

        // Parse the JSON content
        const manifest = await manifestResponse.json();

        // Extract the URLs of the files you want to cache
        let cacheUrls = Object.entries(manifest).map(([fileName, file]) => {
          const url = (file as any).file;
          if (!url) {
            throw new Error(
              `Manifest file is malformed. File not found in manifest for ${fileName}`
            );
          }
          return url;
        });
        cacheUrls = cacheUrls.concat(STATIC_URLS); // Include index.html

        // Open the cache and add the files to it
        const cache = await caches.open(APP_CACHE);
        await cache.addAll(cacheUrls);
        console.log("Assets cached successfully", cacheUrls);
      } catch (error) {
        console.error("Error caching assets from manifest:", error);
      }
    })()
  );

  console.log("Service Worker installed");
});

// TODO: cache the manifest so that it doesn't try to fetch other stuff that is tacked on (i.e. vercel stuff)

self.addEventListener("fetch", (event: FetchEvent) => {
  const url = event.request.url;

  console.log("Intercepting fetch for: ", url);
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(event.request);
        // 200 := complete data vs no data (deletes) or partial data (pagination?)
        if (networkResponse && networkResponse.status === 200) {
          // Cache the network response for future use
          const cache = await caches.open(APP_CACHE);
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch (err) {
        console.log(`Fetch failed for ${url}.`);

        const cacheResponse = await caches.match(event.request);
        if (cacheResponse) {
          console.log("Returning cache response for: ", url);
          return cacheResponse;
        } else {
          return new Response(
            "Application is offline and resource is unavailable.",
            {
              status: 503,
              statusText: "Service Unavailable",
            }
          );
        }
      }
    })()
  );
});
