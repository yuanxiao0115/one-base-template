import { DYNAMIC_IMPORT_RELOAD_KEY, isDynamicImportLoadError } from '@one-base-template/core';
import type { bootstrapZfwSystemSfssApp } from './index';
import { renderBootstrapError } from './error-view';
import './zfw-system-sfss-styles';

export type StartZfwSystemSfssAppBeforeMountContext = Awaited<
  ReturnType<typeof bootstrapZfwSystemSfssApp>
>;

export interface StartZfwSystemSfssAppOptions {
  beforeMount?: (context: StartZfwSystemSfssAppBeforeMountContext) => Promise<void> | void;
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

export async function startZfwSystemSfssApp(options: StartZfwSystemSfssAppOptions = {}) {
  try {
    const { bootstrapZfwSystemSfssApp } = await import('./index');
    const context = await bootstrapZfwSystemSfssApp();

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
