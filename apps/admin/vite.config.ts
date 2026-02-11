import { fileURLToPath, URL } from 'node:url';
import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  const parts = header.split(';');
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=');
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join('=') || '');
  }
  return out;
}

type JsonObject = Record<string, unknown>;

async function readJsonBody(req: IncomingMessage): Promise<JsonObject> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString('utf-8');
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === 'object') return resolve(parsed as JsonObject);
        return resolve({});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function setCookie(res: ServerResponse, cookie: string) {
  const prev = res.getHeader('Set-Cookie');
  if (!prev) {
    res.setHeader('Set-Cookie', cookie);
    return;
  }
  if (Array.isArray(prev)) {
    res.setHeader('Set-Cookie', [...prev, cookie]);
    return;
  }
  res.setHeader('Set-Cookie', [String(prev), cookie]);
}

function mockMiddleware(): Plugin {
  // 简易内存会话：仅用于开发演示
  const sessions = new Map<string, { user: { id: string; name: string } }>();
  const cookieName = 'sb_session';

  function createSession(userName: string) {
    const sid = crypto.randomUUID();
    sessions.set(sid, {
      user: {
        id: sid,
        name: userName
      }
    });
    return sid;
  }

  function clearSession(sid: string | undefined) {
    if (!sid) return;
    sessions.delete(sid);
  }

  return {
    name: 'sb-dev-mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // 只拦截 /api
        if (!url.startsWith('/api/')) return next();

        try {
          // 登录
          if (req.method === 'POST' && url === '/api/auth/login') {
            const body = await readJsonBody(req);
            const userName =
              typeof body.username === 'string' && body.username ? body.username : 'demo';

            const sid = createSession(userName);
            setCookie(res, `${cookieName}=${encodeURIComponent(sid)}; HttpOnly; Path=/; SameSite=Lax`);
            return json(res, 200, { ok: true });
          }

          // 登出
          if (req.method === 'POST' && url === '/api/auth/logout') {
            const cookies = parseCookies(req.headers.cookie);
            clearSession(cookies[cookieName]);
            setCookie(res, `${cookieName}=; Max-Age=0; HttpOnly; Path=/; SameSite=Lax`);
            return json(res, 200, { ok: true });
          }

          // 当前用户
          if (req.method === 'GET' && url === '/api/auth/me') {
            const cookies = parseCookies(req.headers.cookie);
            const sid = cookies[cookieName];
            const session = sid ? sessions.get(sid) : undefined;
            if (!session) {
              return json(res, 401, { message: '未登录' });
            }
            return json(res, 200, session.user);
          }

          // 菜单树
          if (req.method === 'GET' && url === '/api/menu/tree') {
            return json(res, 200, [
              { path: '/home', title: '首页', order: 10, keepAlive: true },
              {
                path: '/demo',
                title: '示例',
                order: 20,
                children: [
                  { path: '/demo/page-a', title: '页面 A', order: 1, keepAlive: true },
                  { path: '/demo/page-b', title: '页面 B', order: 2, keepAlive: true }
                ]
              },
              { path: 'https://example.com', title: '外链示例', order: 30, external: true }
            ]);
          }

          // SSO: token/ticket/code 换会话
          if (req.method === 'POST' && url.startsWith('/api/sso/')) {
            const sid = createSession('sso-user');
            setCookie(res, `${cookieName}=${encodeURIComponent(sid)}; HttpOnly; Path=/; SameSite=Lax`);
            return json(res, 200, { ok: true });
          }

          return next();
        } catch (e: unknown) {
          const message = e instanceof Error && e.message ? e.message : 'mock error';
          return json(res, 500, { message });
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL;
  const useMock = env.VITE_USE_MOCK ? env.VITE_USE_MOCK === 'true' : !apiBaseUrl;

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        dts: 'src/components.d.ts',
        resolvers: [ElementPlusResolver({ importStyle: 'css' })]
      }),
      ...(useMock ? [mockMiddleware()] : [])
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      // 允许访问 monorepo 根目录，便于直接引用 packages/* 源码
      fs: {
        allow: [fileURLToPath(new URL('../../', import.meta.url))]
      },
      // 当配置了真实后端地址时，使用同源代理，Cookie 模式更顺畅（避免跨域）
      ...(apiBaseUrl
        ? {
            proxy: {
              '/api': {
                target: apiBaseUrl,
                changeOrigin: true,
                secure: false
              }
            }
          }
        : {})
    }
  };
});
