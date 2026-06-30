import { ui } from '@/config';
import { getRuntime } from '@/bootstrap/runtime';

const MATERIAL_IMAGE_SW_FILE = 'material-image-cache-sw.js';
const MATERIAL_IMAGE_SW_VERSION = 'v1';

function resolveServiceWorkerUrl() {
  const baseUrl = new URL(getRuntime().baseUrl, window.location.origin);
  return new URL(MATERIAL_IMAGE_SW_FILE, baseUrl);
}

function buildServiceWorkerScriptUrl() {
  const scriptUrl = resolveServiceWorkerUrl();
  scriptUrl.searchParams.set('version', MATERIAL_IMAGE_SW_VERSION);
  scriptUrl.searchParams.set('maxEntries', String(ui.materialCache.maxEntries));
  scriptUrl.searchParams.set('ttlMs', String(ui.materialCache.ttlMs));
  return scriptUrl;
}

function isMaterialImageRegistration(registration: ServiceWorkerRegistration) {
  const scripts = [
    registration.active?.scriptURL,
    registration.waiting?.scriptURL,
    registration.installing?.scriptURL
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);

  return scripts.some((scriptUrl) => scriptUrl.includes(MATERIAL_IMAGE_SW_FILE));
}

async function unregisterMaterialImageServiceWorker() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  const targets = registrations.filter(isMaterialImageRegistration);
  await Promise.all(targets.map((registration) => registration.unregister()));
}

export async function registerMaterialImageServiceWorker() {
  if (typeof window === 'undefined') {
    return;
  }
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const { enabled, enableInDev } = ui.materialCache;
  if (!enabled) {
    await unregisterMaterialImageServiceWorker();
    return;
  }
  if (!enableInDev && !getRuntime().isProd) {
    return;
  }
  if (!window.isSecureContext) {
    return;
  }

  const scriptUrl = buildServiceWorkerScriptUrl();
  try {
    await navigator.serviceWorker.register(scriptUrl, {
      scope: getRuntime().baseUrl
    });
  } catch (error) {
    if (!getRuntime().isProd) {
      console.warn('[material-image-sw] 注册失败', error);
    }
  }
}
