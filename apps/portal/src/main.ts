import { startAppWithRuntimeConfig } from '@one-base-template/app-starter';
import 'element-plus/dist/index.css';
import './styles/index.css';

import { isPlatformConfigLoadError, loadPlatformConfig } from '@/config/platform-config';

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', "&quot;")
    .replaceAll("'", '&#39;');
}

function renderBootstrapError(error: unknown) {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) {
    return;
  }

  const message =
    isPlatformConfigLoadError(error) && error.message
      ? error.message
      : error instanceof Error
        ? error.message
        : '启动失败，请联系管理员';

  app.innerHTML = `
    <div style="padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;">
      <h2 style="margin:0 0 12px;color:#d03050;">应用启动失败</h2>
      <p style="margin:0;color:#303133;">${escapeHtml(message)}</p>
    </div>
  `;
}

void startAppWithRuntimeConfig({
  loadRuntimeConfig: loadPlatformConfig,
  bootstrap: async () => {
    const { bootstrapPortalApp } = await import('@/bootstrap');
    return bootstrapPortalApp();
  },
  onError: renderBootstrapError,
});
