import { startAppWithRuntimeConfig } from '@one-base-template/app-starter';
import { renderBootstrapError } from './error-view';

export async function startAdminApp() {
  await startAppWithRuntimeConfig({
    loadRuntimeConfig: async () => {
      const { loadPlatformConfig } = await import('../config/platform-config');
      return loadPlatformConfig();
    },
    bootstrap: async () => {
      const { bootstrapAdminMode } = await import('./admin-entry');
      return bootstrapAdminMode();
    },
    onError: renderBootstrapError,
  });
}
