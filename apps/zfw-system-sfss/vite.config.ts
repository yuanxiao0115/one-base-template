import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite-plus';
import {
  ZfwSystemSfssBuildConfig,
  ZfwSystemSfssFmtConfig,
  createZfwSystemSfssPlugins
} from './build';
import { normalizeAppBase } from '../../scripts/vite/app-base';

const INTERNAL_WORKSPACE_PACKAGES = [
  '@one-base-template/core',
  '@one-base-template/ui',
  '@one-base-template/tag',
  '@one-base-template/adapters',
  '@one-base-template/app-starter'
] as const;

const WORKSPACE_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DEFAULT_DEV_PORT = 5173;
const DEFAULT_ZFW_PROXY_TARGET = 'http://11.11.54.110:9999';

function isProxyDebugEnabled(value: string | undefined) {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function resolveDevPort(value: string | undefined) {
  const port = Number(value);
  if (Number.isFinite(port) && port > 0) {
    return port;
  }
  return DEFAULT_DEV_PORT;
}

function resolveForwardPath(rawUrl: string, rewrite?: (path: string) => string) {
  const queryIndex = rawUrl.indexOf('?');
  const pathname = queryIndex >= 0 ? rawUrl.slice(0, queryIndex) : rawUrl;
  const search = queryIndex >= 0 ? rawUrl.slice(queryIndex) : '';
  if (!rewrite) {
    return rawUrl;
  }
  return rewrite(pathname) + search;
}

function createProxyEntry(options: {
  prefix: string;
  target: string;
  rewrite?: (path: string) => string;
  enableProxyDebugLog: boolean;
}) {
  const entry: Record<string, unknown> = {
    target: options.target,
    changeOrigin: true,
    secure: false
  };

  if (options.rewrite) {
    entry.rewrite = options.rewrite;
  }

  if (options.enableProxyDebugLog) {
    entry.configure = (proxy: {
      on(
        event: 'proxyReq',
        handler: (proxyReq: unknown, req: { method?: string; url?: string }) => void
      ): void;
    }) => {
      proxy.on('proxyReq', (_proxyReq, req) => {
        const requestUrl = req.url || '/';
        const forwardPath = resolveForwardPath(requestUrl, options.rewrite);
        const method = req.method || 'GET';
        console.info(`[zfw-proxy] ${method} ${requestUrl} -> ${options.target}${forwardPath}`);
      });
    };
  }

  return entry;
}

function logProxySummary(proxy: Record<string, Record<string, unknown>>) {
  const entries = Object.entries(proxy);
  if (entries.length === 0) {
    console.info(
      '[zfw-proxy] 当前未启用后端代理（请检查 VITE_API_BASE_URL / VITE_ZB_BASE_URL / VITE_API_LM_URL）。'
    );
    return;
  }
  console.info('[zfw-proxy] 当前代理目标：');
  for (const [prefix, config] of entries) {
    const target = String(config.target || '');
    console.info(`  ${prefix} -> ${target}`);
  }
}

function createDevProxy(options: {
  apiBaseUrl: string;
  zbBaseUrl: string;
  zfwBaseUrl: string;
  enableProxyDebugLog: boolean;
}) {
  const proxy: Record<string, Record<string, unknown>> = {};

  if (options.apiBaseUrl) {
    proxy['/api'] = createProxyEntry({
      prefix: '/api',
      target: options.apiBaseUrl,
      enableProxyDebugLog: options.enableProxyDebugLog
    });
    proxy['/cmict'] = createProxyEntry({
      prefix: '/cmict',
      target: options.apiBaseUrl,
      enableProxyDebugLog: options.enableProxyDebugLog
    });
  }

  if (options.zbBaseUrl) {
    proxy['/zb'] = createProxyEntry({
      prefix: '/zb',
      target: options.zbBaseUrl,
      enableProxyDebugLog: options.enableProxyDebugLog,
      rewrite(path: string) {
        return path.replace(/^\/zb/, '');
      }
    });
  }

  if (options.zfwBaseUrl) {
    proxy['/zfw'] = createProxyEntry({
      prefix: '/zfw',
      target: options.zfwBaseUrl,
      enableProxyDebugLog: options.enableProxyDebugLog
    });
  }

  return proxy;
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL || '';
  const zbBaseUrl = env.VITE_ZB_BASE_URL || env.VITE_API_BASE_URL || '';
  const zfwBaseUrl = env.VITE_API_LM_URL || DEFAULT_ZFW_PROXY_TARGET;
  const devPort = resolveDevPort(env.VITE_PORT);
  const enableProxyDebugLog = isProxyDebugEnabled(env.VITE_PROXY_DEBUG);
  const appBase = normalizeAppBase(env.VITE_APP_BASE);
  const devProxy = createDevProxy({
    apiBaseUrl,
    zbBaseUrl,
    zfwBaseUrl,
    enableProxyDebugLog
  });

  if (command === 'serve') {
    logProxySummary(devProxy);
    if (enableProxyDebugLog) {
      console.info('[zfw-proxy] 已开启逐请求代理日志（VITE_PROXY_DEBUG=true）。');
    }
  }

  return {
    base: appBase,
    plugins: createZfwSystemSfssPlugins(),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // 子路径样式显式别名，避免某些环境下 package exports 子路径解析失败
        '@one-base-template/tag/style': fileURLToPath(
          new URL('../../packages/tag/src/styles/global.scss', import.meta.url)
        )
      }
    },
    optimizeDeps: {
      // workspace 源码包频繁迭代时，不走预构建缓存，避免新增导出后 dev 仍命中旧导出表。
      exclude: [...INTERNAL_WORKSPACE_PACKAGES]
    },
    build: ZfwSystemSfssBuildConfig,
    fmt: ZfwSystemSfssFmtConfig,
    server: {
      open: true,
      port: devPort,
      host: '0.0.0.0',
      // 允许访问 monorepo 根目录，便于直接引用 packages/* 源码
      fs: {
        allow: [WORKSPACE_ROOT]
      },
      proxy: devProxy,
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*']
      }
    }
  };
});
