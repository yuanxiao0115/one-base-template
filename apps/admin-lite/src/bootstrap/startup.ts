import type { bootstrapAdminLiteApp } from './index';
import { renderBootstrapError } from './error-view';
import './admin-lite-styles';

export type StartAdminLiteAppBeforeMountContext = Awaited<ReturnType<typeof bootstrapAdminLiteApp>>;

export interface StartAdminLiteAppOptions {
  beforeMount?: (context: StartAdminLiteAppBeforeMountContext) => Promise<void> | void;
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
    renderBootstrapError(error);
  }
}
