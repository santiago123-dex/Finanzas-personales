/* Service worker para Finanzas Personales.
 * Estrategia:
 * - Navegaciones (HTML): network-first con fallback a caché.
 *   El arranque en frío siempre intenta red, pero reentradas y
 *   conexiones lentas pintan al instante desde caché.
 * - Assets versionados (/_next/static, /icons): cache-first,
 *   son inmutables por hash y es lo que más pesa en cada arranque.
 * - Todo lo demás (Supabase, server actions, POST): sin interceptar.
 */

const STATIC_CACHE = "finanzas-static-v1";
const PAGES_CACHE = "finanzas-pages-v1";

const PRECACHE = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PAGES_CACHE)
          .map((key) => caches.delete(key))
      );
      if ("navigationPreload" in self.registration) {
        try {
          await self.registration.navigationPreload.enable();
        } catch {
          // Navegadores sin soporte: se sigue sin preload.
        }
      }
      await self.clients.claim();
    })()
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/favicon.ico"
  );
}

async function networkFirstNavigation(event) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const preload = await event.preloadResponse;
    if (preload) {
      cache.put(event.request, preload.clone()).catch(() => {});
      return preload;
    }
    const fresh = await fetch(event.request);
    // Solo se cachean respuestas OK (no redirects de /login, no errores).
    if (fresh && fresh.ok) {
      cache.put(event.request, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch {
    const cached =
      (await cache.match(event.request)) || (await cache.match("/"));
    if (cached) return cached;
    return new Response("Sin conexión", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirstStatic(event) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(event.request);
  if (cached) {
    // Revalidación en segundo plano para la próxima apertura.
    event.waitUntil(
      fetch(event.request)
        .then((fresh) => {
          if (fresh && fresh.ok) cache.put(event.request, fresh);
        })
        .catch(() => {})
    );
    return cached;
  }
  const fresh = await fetch(event.request);
  if (fresh && fresh.ok) {
    cache.put(event.request, fresh.clone()).catch(() => {});
  }
  return fresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(event));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStatic(event));
  }
});
