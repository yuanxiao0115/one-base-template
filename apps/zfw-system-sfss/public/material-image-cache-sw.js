const workerUrl = new globalThis.URL(globalThis.location.href);
const cacheVersion = workerUrl.searchParams.get('version') || 'v1';
const maxEntries = parsePositiveNumber(workerUrl.searchParams.get('maxEntries'), 240);
const ttlMs = parsePositiveNumber(workerUrl.searchParams.get('ttlMs'), 7 * 24 * 60 * 60 * 1000);

const IMAGE_CACHE_NAME = `ob-admin-material-image-cache-${cacheVersion}`;
const META_CACHE_NAME = `ob-admin-material-image-meta-${cacheVersion}`;
const IMAGE_CACHE_PREFIX = 'ob-admin-material-image-cache-';
const META_CACHE_PREFIX = 'ob-admin-material-image-meta-';
const MATERIAL_IMAGE_PATH = '/cmict/file/resource/show';

let cleanupTask = null;

function parsePositiveNumber(raw, fallback) {
  const value = Number(raw);
  if (Number.isFinite(value) && value > 0) {
    return value;
  }
  return fallback;
}

function isMaterialImageRequest(request) {
  if (!request || request.method !== 'GET') {
    return false;
  }

  const url = new globalThis.URL(request.url);
  if (url.pathname !== MATERIAL_IMAGE_PATH) {
    return false;
  }

  if (!url.searchParams.get('id')) {
    return false;
  }

  const accept = request.headers.get('accept') || '';
  return request.destination === 'image' || accept.includes('image');
}

async function writeCacheTime(metaCache, request, timestamp) {
  await metaCache.put(request, new globalThis.Response(String(timestamp)));
}

async function readCacheTime(metaCache, request) {
  const response = await metaCache.match(request);
  if (!response) {
    return 0;
  }
  const text = await response.text();
  const timestamp = Number(text);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

async function cleanupLegacyCaches() {
  const cacheNames = await globalThis.caches.keys();
  await Promise.all(
    cacheNames
      .filter((cacheName) => {
        const isImageCache =
          cacheName.startsWith(IMAGE_CACHE_PREFIX) && cacheName !== IMAGE_CACHE_NAME;
        const isMetaCache =
          cacheName.startsWith(META_CACHE_PREFIX) && cacheName !== META_CACHE_NAME;
        return isImageCache || isMetaCache;
      })
      .map((cacheName) => globalThis.caches.delete(cacheName))
  );
}

async function cleanupMaterialCache() {
  const imageCache = await globalThis.caches.open(IMAGE_CACHE_NAME);
  const metaCache = await globalThis.caches.open(META_CACHE_NAME);
  const requests = await imageCache.keys();
  const now = Date.now();
  const entries = [];

  for (const request of requests) {
    const cachedAt = await readCacheTime(metaCache, request);
    if (cachedAt > 0 && now - cachedAt > ttlMs) {
      await imageCache.delete(request);
      await metaCache.delete(request);
      continue;
    }
    entries.push({ request, cachedAt });
  }

  if (entries.length <= maxEntries) {
    return;
  }

  const removeCount = entries.length - maxEntries;
  entries.sort((left, right) => left.cachedAt - right.cachedAt);
  const targets = entries.slice(0, removeCount);
  for (const { request } of targets) {
    await imageCache.delete(request);
    await metaCache.delete(request);
  }
}

function scheduleCleanupMaterialCache() {
  if (cleanupTask) {
    return cleanupTask;
  }

  cleanupTask = cleanupMaterialCache()
    .catch(() => undefined)
    .finally(() => {
      cleanupTask = null;
    });

  return cleanupTask;
}

async function fetchAndCacheMaterialImage(request) {
  const response = await globalThis.fetch(request);
  if (response && response.ok) {
    const imageCache = await globalThis.caches.open(IMAGE_CACHE_NAME);
    const metaCache = await globalThis.caches.open(META_CACHE_NAME);
    await imageCache.put(request, response.clone());
    await writeCacheTime(metaCache, request, Date.now());
    void scheduleCleanupMaterialCache();
  }
  return response;
}

async function handleMaterialImageRequest(request) {
  const imageCache = await globalThis.caches.open(IMAGE_CACHE_NAME);
  const cached = await imageCache.match(request);

  if (cached) {
    void fetchAndCacheMaterialImage(request).catch(() => undefined);
    return cached;
  }

  try {
    return await fetchAndCacheMaterialImage(request);
  } catch (error) {
    const fallback = await imageCache.match(request);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

globalThis.addEventListener('install', (event) => {
  globalThis.skipWaiting();
  event.waitUntil(Promise.resolve());
});

globalThis.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await cleanupLegacyCaches();
      await scheduleCleanupMaterialCache();
      await globalThis.clients.claim();
    })()
  );
});

globalThis.addEventListener('fetch', (event) => {
  if (!isMaterialImageRequest(event.request)) {
    return;
  }

  event.respondWith(handleMaterialImageRequest(event.request));
});
