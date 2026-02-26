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

function ok(res: ServerResponse, data: unknown = null, message = 'ok') {
  return json(res, 200, { code: 200, data, message });
}

function fail(res: ServerResponse, status: number, message: string, code: number = status) {
  return json(res, status, { code, data: null, message });
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

function mockMiddleware(options?: { sczfwSystemPermissionCode?: string }): Plugin {
  // 简易内存会话：仅用于开发演示
  const sessions = new Map<string, { user: { id: string; name: string } }>();
  const cookieName = 'ob_session';

  const sczfwSystemPermissionCode = options?.sczfwSystemPermissionCode ?? 'admin_server';

  // token 模式（sczfw）mock：用 Authorization 头携带 token
  const tokenSessions = new Map<string, { user: { id: string; nickName: string; permissionCodes: string[]; roleCodes: string[] } }>();

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

  function createTokenSession(userName: string) {
    const token = crypto.randomUUID();
    tokenSessions.set(token, {
      user: {
        id: token,
        nickName: userName,
        permissionCodes: [sczfwSystemPermissionCode],
        roleCodes: ['admin']
      }
    });
    return token;
  }

  function clearSession(sid: string | undefined) {
    if (!sid) return;
    sessions.delete(sid);
  }

  return {
    name: 'ob-dev-mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // 只拦截 /api 与 /cmict（避免影响静态资源）
        const isApi = url.startsWith('/api/');
        const isCmict = url.startsWith('/cmict/');
        if (!isApi && !isCmict) return next();

        try {
          // ------------------------
          // sczfw (cmict) mock
          // ------------------------
          if (isCmict) {
            // 登录页配置
            if (req.method === 'GET' && url.startsWith('/cmict/portal/getLoginPage')) {
              return ok(res, { webLogoText: '统一门户高效协同', loginPageFodders: [] });
            }

            // 滑块验证码：获取
            if (req.method === 'GET' && url.startsWith('/cmict/auth/captcha/block-puzzle')) {
              // 1x1 png（仅用于占位渲染；校验逻辑由 check 接口 mock 通过）
              const onePxPng =
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6XbWQAAAABJRU5ErkJggg==';
              return ok(res, {
                originBase64: onePxPng,
                jigsawBase64: onePxPng,
                captchaKey: crypto.randomUUID()
              });
            }

            // 滑块验证码：校验（mock 一律通过）
            if (req.method === 'GET' && url.startsWith('/cmict/auth/captcha/check')) {
              return ok(res, true);
            }

            // 登录（token 模式）
            if (req.method === 'POST' && url === '/cmict/auth/login') {
              const body = await readJsonBody(req);
              const userName =
                typeof body.userAccount === 'string' && body.userAccount ? body.userAccount : 'demo';

              const token = createTokenSession(userName);
              return ok(res, { authToken: token, id: token, nickName: userName, permissionCodes: [sczfwSystemPermissionCode], roleCodes: ['admin'] });
            }

            // 外部 SSO：portal / om（以 token 兑换 authToken）
            if (req.method === 'GET' && url.startsWith('/cmict/auth/external/portal/sso')) {
              const u = new URL(url, 'http://localhost');
              const raw = u.searchParams.get('token') || 'demo';
              const token = createTokenSession(`portal-${raw}`);
              return ok(res, { authToken: token, token });
            }

            if (req.method === 'GET' && url.startsWith('/cmict/auth/external/om/sso')) {
              const u = new URL(url, 'http://localhost');
              const raw = u.searchParams.get('token') || 'demo';
              const token = createTokenSession(`om-${raw}`);
              return ok(res, { authToken: token, token });
            }

            // 外部 SSO：智慧协同 / 移动办公
            if (req.method === 'GET' && url.startsWith('/cmict/auth/external/zhxt/sso')) {
              const u = new URL(url, 'http://localhost');
              const raw = u.searchParams.get('zhxt-token') || 'demo';
              const token = createTokenSession(`zhxt-${raw}`);
              return ok(res, { authToken: token });
            }

            if (req.method === 'GET' && url.startsWith('/cmict/auth/external/ydbg/sso')) {
              const u = new URL(url, 'http://localhost');
              const raw = u.searchParams.get('ydbg-token') || 'demo';
              const token = createTokenSession(`ydbg-${raw}`);
              return ok(res, { authToken: token });
            }

            // 票据验证（ticket -> authToken）
            if (req.method === 'GET' && url.startsWith('/cmict/auth/ticket/sso')) {
              const u = new URL(url, 'http://localhost');
              const raw = u.searchParams.get('ticket') || 'demo';
              const token = createTokenSession(`ticket-${raw}`);
              return ok(res, { authToken: token });
            }

            // 统一桌面：换取 idToken
            if (req.method === 'POST' && url.startsWith('/cmict/uaa/unity-desktop/sso-login')) {
              const token = req.headers.authorization;
              if (!token) return fail(res, 401, '未登录');
              return ok(res, { idToken: `idToken-${token}` });
            }

            // 当前用户
            if (req.method === 'GET' && url.startsWith('/cmict/auth/token/verify')) {
              const token = req.headers.authorization;
              const session = token ? tokenSessions.get(token) : undefined;
              if (!session) {
                return fail(res, 401, '未登录');
              }
              return ok(res, session.user);
            }

            // 登出
            if (req.method === 'GET' && url.startsWith('/cmict/auth/logout')) {
              const token = req.headers.authorization;
              if (token) tokenSessions.delete(token);
              return ok(res);
            }

            // 登录日志：客户端枚举
            if (req.method === 'GET' && url.startsWith('/cmict/auth/login-record/client-type/enum')) {
              return ok(res, [
                { key: 'pc', value: 'PC 端' },
                { key: 'mobile', value: '移动端' },
                { key: 'mini', value: '小程序' },
                { key: 'pad', value: '平板端' }
              ]);
            }

            const loginTypeLabelMap: Record<string, string> = {
              pc: 'PC 端',
              mobile: '移动端',
              mini: '小程序',
              pad: '平板端'
            };

            const buildLoginRecord = (index: number) => {
              const typeKeys = Object.keys(loginTypeLabelMap);
              const clientType = typeKeys[index % typeKeys.length] || 'pc';
              const id = String(index + 1);
              const dayOffset = index % 15;
              const hour = String((index * 3) % 24).padStart(2, '0');
              const minute = String((index * 7) % 60).padStart(2, '0');

              return {
                id,
                userAccount: `demo_user_${id.padStart(3, '0')}`,
                nickName: `测试用户${id}`,
                clientType,
                clientTypeLabel: loginTypeLabelMap[clientType] || 'PC 端',
                clientIp: `192.168.${index % 10}.${(index % 200) + 20}`,
                location: `上海市浦东新区${(index % 12) + 1}号楼`,
                browserName: ['Chrome', 'Edge', 'Safari', 'Firefox'][index % 4],
                browserVersion: `120.${index % 20}.0`,
                clientOS: ['Windows 11', 'macOS', 'Android', 'iOS'][index % 4],
                createTime: `2026-02-${String(Math.max(1, 25 - dayOffset)).padStart(2, '0')} ${hour}:${minute}:00`
              };
            };

            // 登录日志：分页
            if (req.method === 'GET' && url.startsWith('/cmict/auth/login-record/page')) {
              const u = new URL(url, 'http://localhost');
              const nickName = (u.searchParams.get('nickName') || '').trim();
              const clientType = (u.searchParams.get('clientType') || '').trim();
              const startTime = (u.searchParams.get('startTime') || '').trim();
              const endTime = (u.searchParams.get('endTime') || '').trim();

              const currentPage = Number(
                u.searchParams.get('currentPage') ||
                  u.searchParams.get('current') ||
                  u.searchParams.get('page') ||
                  1
              );
              const pageSize = Number(
                u.searchParams.get('pageSize') || u.searchParams.get('size') || 10
              );

              let records = Array.from({ length: 186 }, (_, index) => buildLoginRecord(index));

              if (nickName) {
                records = records.filter((item) => item.nickName.includes(nickName));
              }

              if (clientType) {
                records = records.filter((item) => item.clientType === clientType);
              }

              if (startTime) {
                records = records.filter((item) => item.createTime.slice(0, 10) >= startTime);
              }

              if (endTime) {
                records = records.filter((item) => item.createTime.slice(0, 10) <= endTime);
              }

              const safeCurrentPage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
              const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10;
              const total = records.length;
              const start = (safeCurrentPage - 1) * safePageSize;
              const pageRecords = records.slice(start, start + safePageSize);

              return ok(res, {
                records: pageRecords,
                total,
                currentPage: safeCurrentPage,
                pageSize: safePageSize
              });
            }

            // 登录日志：详情
            if (req.method === 'GET' && url.startsWith('/cmict/auth/login-record/detail')) {
              const u = new URL(url, 'http://localhost');
              const id = u.searchParams.get('id') || '1';
              const parsed = Number(id);

              if (!Number.isFinite(parsed) || parsed <= 0) {
                return fail(res, 400, '参数错误');
              }

              return ok(res, buildLoginRecord(parsed - 1));
            }

            // 登录日志：删除
            if (req.method === 'POST' && url.startsWith('/cmict/auth/login-record/delete')) {
              const body = await readJsonBody(req);
              const idList = Array.isArray(body.idList) ? body.idList : [];
              if (idList.length === 0) {
                return fail(res, 400, '请选择待删除记录');
              }
              return ok(res, null);
            }

            // 菜单树（my-tree）
            if (req.method === 'GET' && url.startsWith('/cmict/admin/permission/my-tree')) {
              // 注意：保持与 sczfwAdapter 的解析规则一致（permissionCode 可配置）
              return ok(res, [
                {
                  permissionCode: sczfwSystemPermissionCode,
                  title: '系统 A',
                  children: [
                    { url: '/home/index', resourceName: '首页', resourceType: 1, hidden: 0, routeCache: 1 },
                    {
                      url: '/demo',
                      resourceName: '示例',
                      resourceType: 1,
                      hidden: 0,
                      children: [
                        { url: '/demo/page-a', resourceName: '页面 A', resourceType: 1, hidden: 0, routeCache: 1 },
                        { url: '/demo/page-b', resourceName: '页面 B', resourceType: 1, hidden: 0, routeCache: 1 }
                      ]
                    },
                    {
                      url: '/portal',
                      resourceName: '门户管理',
                      resourceType: 1,
                      hidden: 0,
                      children: [
                        { url: '/portal/templates', resourceName: '门户模板', resourceType: 1, hidden: 0, routeCache: 0 },
                        // 详情/编辑页通常不出现在菜单里，但需要在白名单中才能直达访问
                        { url: '/portal/designer', resourceName: '门户配置', resourceType: 1, hidden: 1, routeCache: 0 },
                        { url: '/portal/layout', resourceName: '页面编辑', resourceType: 1, hidden: 1, routeCache: 0 }
                      ]
                    }
                  ]
                },
                {
                  permissionCode: 'b_system',
                  title: '系统 B',
                  children: [
                    { url: '/b/home', resourceName: 'B 首页', resourceType: 1, hidden: 0, routeCache: 1 },
                    {
                      url: '/b/demo',
                      resourceName: 'B 示例',
                      resourceType: 1,
                      hidden: 0,
                      children: [
                        { url: '/b/demo/page-1', resourceName: '页面 1', resourceType: 1, hidden: 0, routeCache: 1 },
                        { url: '/b/demo/page-2', resourceName: '页面 2', resourceType: 1, hidden: 0, routeCache: 1 }
                      ]
                    }
                  ]
                }
              ]);
            }

            return next();
          }

          // 登录
          if (req.method === 'POST' && url === '/api/auth/login') {
            const body = await readJsonBody(req);
            const userName =
              typeof body.username === 'string' && body.username ? body.username : 'demo';

            const sid = createSession(userName);
            setCookie(res, `${cookieName}=${encodeURIComponent(sid)}; HttpOnly; Path=/; SameSite=Lax`);
            return ok(res);
          }

          // 登出
          if (req.method === 'POST' && url === '/api/auth/logout') {
            const cookies = parseCookies(req.headers.cookie);
            clearSession(cookies[cookieName]);
            setCookie(res, `${cookieName}=; Max-Age=0; HttpOnly; Path=/; SameSite=Lax`);
            return ok(res);
          }

          // 当前用户
          if (req.method === 'GET' && url === '/api/auth/me') {
            const cookies = parseCookies(req.headers.cookie);
            const sid = cookies[cookieName];
            const session = sid ? sessions.get(sid) : undefined;
            if (!session) {
              return fail(res, 401, '未登录');
            }
            return ok(res, session.user);
          }

          // 菜单树
          if (req.method === 'GET' && url === '/api/menu/tree') {
            return ok(res, [
              { path: '/home/index', title: '首页', order: 10, keepAlive: true },
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

          // 下载示例：返回二进制流（触发 core 的 autoDownload）
          if (req.method === 'GET' && url === '/api/demo/download') {
            const cookies = parseCookies(req.headers.cookie);
            const sid = cookies[cookieName];
            const session = sid ? sessions.get(sid) : undefined;
            if (!session) {
              return fail(res, 401, '未登录');
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', 'attachment; filename="ob-demo.txt"');

            const content = [
              'one-base-template demo download',
              `user=${session.user.name}`,
              `time=${new Date().toISOString()}`
            ].join('\n');

            res.end(Buffer.from(content, 'utf-8'));
            return;
          }

          // 下载错误示例：虽然是“下载接口”，但返回 JSON 业务错误（用于验证 blob->json 探测）
          if (req.method === 'GET' && url === '/api/demo/download-error') {
            return json(res, 200, { code: 500, data: null, message: '下载失败：模拟业务错误' });
          }

          // SSO: token/ticket/code 换会话
          if (req.method === 'POST' && url.startsWith('/api/sso/')) {
            const sid = createSession('sso-user');
            setCookie(res, `${cookieName}=${encodeURIComponent(sid)}; HttpOnly; Path=/; SameSite=Lax`);
            return ok(res);
          }

          return next();
        } catch (e: unknown) {
          const message = e instanceof Error && e.message ? e.message : 'mock error';
          return fail(res, 500, message);
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL;
  const useMock = env.VITE_USE_MOCK ? env.VITE_USE_MOCK === 'true' : !apiBaseUrl;
  const sczfwSystemPermissionCode = env.VITE_SCZFW_SYSTEM_PERMISSION_CODE || 'admin_server';

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
      ...(useMock ? [mockMiddleware({ sczfwSystemPermissionCode })] : [])
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // 子路径样式显式别名，避免某些环境下 package exports 子路径解析失败
        '@one/tag/style': fileURLToPath(new URL('../../packages/tag/src/styles/global.scss', import.meta.url))
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
              },
              '/cmict': {
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
