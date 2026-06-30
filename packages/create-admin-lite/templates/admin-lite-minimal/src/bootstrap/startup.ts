import { DYNAMIC_IMPORT_RELOAD_KEY, isDynamicImportLoadError } from '@one-base-template/core';
import type { bootstrapAdminLiteApp } from './index';
import { renderBootstrapError } from './error-view';
import './admin-lite-styles';

export type StartAdminLiteAppBeforeMountContext = Awaited<ReturnType<typeof bootstrapAdminLiteApp>>;

export interface StartAdminLiteAppOptions {
  beforeMount?: (context: StartAdminLiteAppBeforeMountContext) => Promise<void> | void;
}

function isWaitingForDynamicImportRecovery(error: unknown) {
  if (typeof window === 'undefined') {
    return false;
  }
  if (!isDynamicImportLoadError(error)) {
    return false;
  }
  return Boolean(window.sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY));
}

export async function startAdminLiteApp(options: StartAdminLiteAppOptions = {}) {
  try {
    const { bootstrapAdminLiteApp } = await import('./index');
    const context = await bootstrapAdminLiteApp();

    if (options.beforeMount) {
      await options.beforeMount(context);
    }

    if (context.router?.isReady) {
      await context.router.isReady();
    }

    context.app.mount('#app');
  } catch (error) {
    if (isWaitingForDynamicImportRecovery(error)) {
      return;
    }
    renderBootstrapError(error);
  }
}
