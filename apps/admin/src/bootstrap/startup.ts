import type { bootstrapAdminApp } from './index';
import { renderBootstrapError } from './error-view';
import './admin-styles';

export type StartAdminAppBeforeMountContext = Awaited<ReturnType<typeof bootstrapAdminApp>>;

export interface StartAdminAppOptions {
  beforeMount?: (context: StartAdminAppBeforeMountContext) => Promise<void> | void;
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
    renderBootstrapError(error);
  }
}
