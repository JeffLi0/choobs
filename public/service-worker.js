const CACHE_NAME = "choobs-app-cache-v0";

const urlsToCache = [
	"/",
	"/index.html",
	"/manifest.json",
	"/static/maskable_icon_x144.png",
	"/static/maskable_icon_x192.png",
	"/static/maskable_icon_x512.png",
];

self.addEventListener("install", (event) => {
	self.skipWaiting(); // Force new SW to activate immediately
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
	);
});

self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request).catch(() => caches.match("/index.html"))
        );
        return;
    }

    if (
        event.request.url.includes("/static/artwork/") ||
        event.request.url.includes("/assets/")
    ) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) =>
                cache.match(event.request).then((response) =>
                    response ||
                    fetch(event.request).then((response) => {
                        cache.put(event.request, response.clone());
                        return response;
                    })
                )
            )
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) return response;
                return fetch(event.request).then((response) => {
                    if (
                        !response ||
                        response.status !== 200 ||
                        response.type !== "basic"
                    ) {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                });
            }).catch(() => caches.match("/offline.html"))
        );
    }
});

self.addEventListener("activate", (event) => {
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then((cacheNames) =>
			Promise.all(
				cacheNames.map((cacheName) => {
					if (!cacheWhitelist.includes(cacheName)) {
						return caches.delete(cacheName);
					}
				})
			)
		)
	);
	self.clients.claim(); // Ensure immediate control
});
