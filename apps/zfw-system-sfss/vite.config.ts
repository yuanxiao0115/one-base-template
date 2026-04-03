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

function resolveDevPort(value: string | undefined) {
  const port = Number(value);
  if (Number.isFinite(port) && port > 0) {
    return port;
  }
  return DEFAULT_DEV_PORT;
}

function createDevProxy(options: { apiBaseUrl: string; zbBaseUrl: string; zfwBaseUrl: string }) {
  const proxy: Record<string, Record<string, unknown>> = {};

  if (options.apiBaseUrl) {
    proxy['/api'] = {
      target: options.apiBaseUrl,
      changeOrigin: true,
      secure: false
    };
    proxy['/cmict'] = {
      target: options.apiBaseUrl,
      changeOrigin: true,
      secure: false
    };
  }

  if (options.zbBaseUrl) {
    proxy['/zb'] = {
      target: options.zbBaseUrl,
      changeOrigin: true,
      secure: false,
      rewrite(path: string) {
        return path.replace(/^\/zb/, '');
      }
    };
  }

  if (options.zfwBaseUrl) {
    proxy['/zfw'] = {
      target: options.zfwBaseUrl,
      changeOrigin: true,
      secure: false
    };
  }

  return proxy;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL || '';
  const zbBaseUrl = env.VITE_ZB_BASE_URL || env.VITE_API_BASE_URL || '';
  const zfwBaseUrl = env.VITE_API_LM_URL || DEFAULT_ZFW_PROXY_TARGET;
  const devPort = resolveDevPort(env.VITE_PORT);
  const appBase = normalizeAppBase(env.VITE_APP_BASE);

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
      proxy: createDevProxy({
        apiBaseUrl,
        zbBaseUrl,
        zfwBaseUrl
      }),
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*']
      }
    }
  };
});
