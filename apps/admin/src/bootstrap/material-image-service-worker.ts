import { appMaterialImageCacheConfig } from '@/config';
import { getAppEnv } from '@/config/env';

const MATERIAL_IMAGE_SW_FILE_NAME = 'material-image-cache-sw.js';

function resolveServiceWorkerUrl() {
  const baseUrl = new URL(getAppEnv().baseUrl, window.location.origin);
  return new URL(MATERIAL_IMAGE_SW_FILE_NAME, baseUrl);
}

function buildServiceWorkerScriptUrl() {
  const scriptUrl = resolveServiceWorkerUrl();
  scriptUrl.searchParams.set('version', 'v1');
  scriptUrl.searchParams.set('maxEntries', String(appMaterialImageCacheConfig.maxEntries));
  scriptUrl.searchParams.set('ttlMs', String(appMaterialImageCacheConfig.ttlMs));
  return scriptUrl;
}

function isMaterialImageRegistration(registration: ServiceWorkerRegistration) {
  const scripts = [
    registration.active?.scriptURL,
    registration.waiting?.scriptURL,
    registration.installing?.scriptURL
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);

  return scripts.some((scriptUrl) => scriptUrl.includes(MATERIAL_IMAGE_SW_FILE_NAME));
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

  const { enabled, enableInDev } = appMaterialImageCacheConfig;
  if (!enabled) {
    await unregisterMaterialImageServiceWorker();
    return;
  }
  if (!enableInDev && !getAppEnv().isProd) {
    return;
  }
  if (!window.isSecureContext) {
    return;
  }

  const scriptUrl = buildServiceWorkerScriptUrl();
  try {
    await navigator.serviceWorker.register(scriptUrl, {
      scope: getAppEnv().baseUrl
    });
  } catch (error) {
    if (!getAppEnv().isProd) {
      console.warn('[material-image-sw] 注册失败', error);
    }
  }
}
