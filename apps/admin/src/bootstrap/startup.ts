import { DYNAMIC_IMPORT_RELOAD_KEY, isDynamicImportLoadError } from '@one-base-template/core';
import type { bootstrapAdminApp } from './index';
import { renderBootstrapError } from './error-view';
import './admin-styles';

export type StartAdminAppBeforeMountContext = Awaited<ReturnType<typeof bootstrapAdminApp>>;

export interface StartAdminAppOptions {
  beforeMount?: (context: StartAdminAppBeforeMountContext) => Promise<void> | void;
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

export async function startAdminApp(options: StartAdminAppOptions = {}) {
  try {
    const { bootstrapAdminApp } = await import('./index');
    const context = await bootstrapAdminApp();

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
