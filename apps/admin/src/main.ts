import 'element-plus/dist/index.css';
import './styles/index.css';
import './styles/element-plus/button-overrides.css';
import './styles/element-plus/drawer-overrides.css';
import './styles/element-plus/message-box-overrides.css';

import { loadPlatformConfig } from './config/platform-config';

type RuntimeOs = 'macos' | 'windows' | 'other';

function detectRuntimeOs(): RuntimeOs {
  if (typeof navigator === 'undefined') return 'other';

  const platformSignature = `${navigator.platform} ${navigator.userAgent}`.toLowerCase();
  if (platformSignature.includes('mac')) return 'macos';
  if (platformSignature.includes('win')) return 'windows';
  return 'other';
}

function applyRuntimeOsMarker() {
  if (typeof document === 'undefined') return;

  // 写入根节点数据标记，配合全局 CSS 进行字体栈切换。
  document.documentElement.dataset.oneOs = detectRuntimeOs();
}

function buildErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return '未知错误';
}

function renderBootstrapError(error: unknown) {
  const appRoot = document.querySelector('#app');
  if (!appRoot) return;

  const container = document.createElement('div');
  container.style.minHeight = '100vh';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.background = '#f5f7fa';
  container.style.padding = '24px';

  const card = document.createElement('div');
  card.style.maxWidth = '720px';
  card.style.width = '100%';
  card.style.background = '#ffffff';
  card.style.borderRadius = '12px';
  card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
  card.style.padding = '24px';

  const title = document.createElement('h2');
  title.textContent = '应用启动失败';
  title.style.margin = '0 0 12px';
  title.style.fontSize = '20px';
  title.style.color = '#111827';

  const desc = document.createElement('p');
  desc.textContent = '运行时配置加载失败，请检查 apps/admin/public/platform-config.json。';
  desc.style.margin = '0 0 12px';
  desc.style.color = '#4b5563';

  const detail = document.createElement('pre');
  detail.textContent = buildErrorMessage(error);
  detail.style.margin = '0';
  detail.style.padding = '12px';
  detail.style.background = '#f3f4f6';
  detail.style.borderRadius = '8px';
  detail.style.color = '#b91c1c';
  detail.style.whiteSpace = 'pre-wrap';
  detail.style.wordBreak = 'break-word';

  card.append(title, desc, detail);
  container.append(card);
  appRoot.replaceChildren(container);
}

async function bootstrap() {
  try {
    await loadPlatformConfig();
    const { bootstrapAdminApp } = await import('./bootstrap');
    const { app, router } = bootstrapAdminApp();
    await router.isReady();
    app.mount('#app');
  } catch (error) {
    renderBootstrapError(error);
  }
}

applyRuntimeOsMarker();
void bootstrap();
