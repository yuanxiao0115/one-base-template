import type { bootstrapZfwSystemSfssApp } from './index';
import { renderBootstrapError } from './error-view';
import './zfw-system-sfss-styles';

export type StartZfwSystemSfssAppBeforeMountContext = Awaited<
  ReturnType<typeof bootstrapZfwSystemSfssApp>
>;

export interface StartZfwSystemSfssAppOptions {
  beforeMount?: (context: StartZfwSystemSfssAppBeforeMountContext) => Promise<void> | void;
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
    renderBootstrapError(error);
  }
}
