import { startAppWithRuntimeConfig } from '@one-base-template/app-starter';
import type { bootstrapAdminApp } from './index';
import { renderBootstrapError } from './error-view';
import './admin-styles';

export type StartAdminAppBeforeMountContext = Awaited<ReturnType<typeof bootstrapAdminApp>>;

export interface StartAdminAppOptions {
  beforeMount?: (context: StartAdminAppBeforeMountContext) => Promise<void> | void;
}

export async function startAdminApp(options: StartAdminAppOptions = {}) {
  await startAppWithRuntimeConfig({
    loadRuntimeConfig: async () => {
      const { loadPlatformConfig } = await import('../config/platform-config');
      return loadPlatformConfig();
    },
    bootstrap: async () => {
      const { bootstrapAdminApp } = await import('./index');
      return bootstrapAdminApp();
    },
    beforeMount: options.beforeMount,
    onError: renderBootstrapError
  });
}
