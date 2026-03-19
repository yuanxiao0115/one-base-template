import { startAppWithRuntimeConfig } from '@one-base-template/app-starter';
import 'element-plus/dist/index.css';
import './styles/index.css';

import { isPlatformConfigLoadError, loadPlatformConfig } from '@/config/platform-config';

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误';
}

function renderBootstrapError(error: unknown) {
  const appRoot = document.querySelector('#app');
  if (!appRoot) {
    return;
  }

  const title = isPlatformConfigLoadError(error)
    ? 'Template 启动失败（配置错误）'
    : 'Template 启动失败';
  const detail = toErrorMessage(error);

  appRoot.innerHTML = `
    <div style="min-height:100%;display:flex;align-items:center;justify-content:center;background:#f5f7fa;padding:24px;">
      <div style="width:100%;max-width:680px;background:#fff;border-radius:12px;padding:24px;box-shadow:0 8px 24px rgba(0,0,0,.08)">
        <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">${title}</h2>
        <p style="margin:0 0 12px;color:#4b5563;">请检查 apps/template/public/platform-config.json 配置。</p>
        <pre style="margin:0;padding:12px;background:#f3f4f6;border-radius:8px;white-space:pre-wrap;color:#b91c1c;">${detail}</pre>
      </div>
    </div>
  `;
}

void startAppWithRuntimeConfig({
  loadRuntimeConfig: loadPlatformConfig,
  bootstrap: async () => {
    const { bootstrapTemplateApp } = await import('@/bootstrap');
    return bootstrapTemplateApp();
  },
  onError: renderBootstrapError
});
