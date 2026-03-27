import type { bootstrapTemplateApp } from './index';
import { renderBootstrapError } from './error-view';
import './template-styles';

export type StartTemplateAppBeforeMountContext = Awaited<ReturnType<typeof bootstrapTemplateApp>>;

export interface StartTemplateAppOptions {
  beforeMount?: (context: StartTemplateAppBeforeMountContext) => Promise<void> | void;
}

export async function startTemplateApp(options: StartTemplateAppOptions = {}) {
  try {
    const { bootstrapTemplateApp } = await import('./index');
    const context = await bootstrapTemplateApp();

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
