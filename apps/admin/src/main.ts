import 'element-plus/dist/index.css';
import './styles/index.css';
import './styles/element-plus/button-overrides.css';
import './styles/element-plus/drawer-overrides.css';
import './styles/element-plus/dialog-overrides.css';
import './styles/element-plus/message-box-overrides.css';

import {
  isPlatformConfigLoadError,
  loadPlatformConfig,
  type PlatformConfigLoadError
} from './config/platform-config';

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

type BootstrapErrorView = {
  title: string;
  description: string;
  suggestion: string;
  detail: string;
};

function resolveBootstrapErrorView(error: unknown): BootstrapErrorView {
  if (isPlatformConfigLoadError(error)) {
    const detail = buildErrorMessage(error);
    return buildPlatformConfigErrorView(error, detail);
  }

  return {
    title: '应用启动失败',
    description: '初始化过程中发生未分类错误，请检查控制台日志与启动链路配置。',
    suggestion: '建议先确认依赖安装完整，再重启开发服务。',
    detail: buildErrorMessage(error)
  };
}

function buildPlatformConfigErrorView(
  error: PlatformConfigLoadError,
  detail: string
): BootstrapErrorView {
  if (error.code === 'REQUEST_TIMEOUT') {
    return {
      title: '运行时配置请求超时',
      description: '未在限定时间内读取到 platform-config.json。',
      suggestion: '请检查静态资源服务、网络连通性与代理链路是否可达。',
      detail
    };
  }

  if (error.code === 'REQUEST_FAILED') {
    return {
      title: '运行时配置加载失败',
      description: '无法获取 platform-config.json（HTTP 状态异常或网络失败）。',
      suggestion: '请确认 apps/admin/public/platform-config.json 已正确部署并可访问。',
      detail
    };
  }

  if (error.code === 'VALIDATION_FAILED') {
    return {
      title: '运行时配置校验失败',
      description: 'platform-config.json 字段不符合 schema 约束。',
      suggestion: '请按文档校正配置字段与取值后重试。',
      detail
    };
  }

  if (error.code === 'PARSE_FAILED') {
    return {
      title: '运行时配置格式错误',
      description: 'platform-config.json 解析失败（可能是 JSON 语法错误）。',
      suggestion: '请检查 JSON 结构、逗号与引号格式。',
      detail
    };
  }

  if (error.code === 'FALLBACK_PARSE_FAILED') {
    return {
      title: '本地兜底快照不可用',
      description: '已启用本地兜底，但快照损坏或格式不兼容，无法恢复启动。',
      suggestion: '请清理本地快照后重新加载，或修复线上配置文件。',
      detail
    };
  }

  return {
    title: '运行时配置加载失败',
    description: '加载 platform-config.json 时发生未分类错误。',
    suggestion: '请检查配置文件与网络环境后重试。',
    detail
  };
}

function renderBootstrapError(error: unknown) {
  const appRoot = document.querySelector('#app');
  if (!appRoot) return;
  const view = resolveBootstrapErrorView(error);

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
  title.textContent = view.title;
  title.style.margin = '0 0 12px';
  title.style.fontSize = '20px';
  title.style.color = '#111827';

  const desc = document.createElement('p');
  desc.textContent = view.description;
  desc.style.margin = '0 0 12px';
  desc.style.color = '#4b5563';

  const suggestion = document.createElement('p');
  suggestion.textContent = view.suggestion;
  suggestion.style.margin = '0 0 12px';
  suggestion.style.color = '#1d4ed8';

  const detail = document.createElement('pre');
  detail.textContent = view.detail;
  detail.style.margin = '0';
  detail.style.padding = '12px';
  detail.style.background = '#f3f4f6';
  detail.style.borderRadius = '8px';
  detail.style.color = '#b91c1c';
  detail.style.whiteSpace = 'pre-wrap';
  detail.style.wordBreak = 'break-word';

  card.append(title, desc, suggestion, detail);
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
