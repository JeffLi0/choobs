const CACHE_NAME = "choobs-app-cache-v1";
const urlsToCache = [
	"/",
	"/index.html",
	"/manifest.json",
	"/static/css/main.css",
	"/static/js/main.js",
	"/static/js/748.97b78b63.chunk.js",
	"/static/img/maskable_icon_x144.png",
	"/static/img/maskable_icon_x192.png",
	"/static/img/maskable_icon_x512.png",
	"/static/artwork/campfire.png",
	"/static/artwork/cello.png",
	"/static/artwork/fishing.png",
	"/static/artwork/nothing.png",
	"/static/artwork/reading.png",
	"/static/artwork/sleeping.png",
	"/static/artwork/stargazing.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches
			.match(event.request)
			.then((response) => {
				if (response) {
					return response;
				}
				return fetch(event.request).then((response) => {
					// Check if we received a valid response
					if (!response || response.status !== 200 || response.type !== "basic") {
						return response;
					}

					// Clone the response
					const responseToCache = response.clone();

					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});

					return response;
				});
			})
			.catch(() => {
				// If both cache and network fail, show a generic fallback:
				return caches.match("/offline.html");
			})
	);
});

self.addEventListener("activate", (event) => {
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheWhitelist.indexOf(cacheName) === -1) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});
