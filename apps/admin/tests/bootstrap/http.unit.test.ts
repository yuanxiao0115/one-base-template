import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { routePaths } from '@/router/constants';

const mocks = vi.hoisted(() => ({
  authReset: vi.fn(),
  menuReset: vi.fn(),
  systemReset: vi.fn(),
  tagHandle: vi.fn(),
  createObHttpMock: vi.fn(),
  createBasicClientSignatureBeforeRequestMock: vi.fn(
    (options: {
      basicHeaders?: Record<string, string>;
      clientSignatureSalt?: string;
      clientSignatureClientId?: string;
      loadCreateClientSignature: () => Promise<
        (params?: { salt?: string; clientId?: string }) => string
      >;
    }) => {
      return async (config: { headers?: Record<string, unknown> }) => {
        const createClientSignature = await options.loadCreateClientSignature();
        const signature = createClientSignature({
          salt: options.clientSignatureSalt,
          clientId: options.clientSignatureClientId
        });
        config.headers = {
          ...config.headers,
          ...options.basicHeaders,
          'Client-Signature': signature
        };
      };
    }
  ),
  createClientSignatureMock: vi.fn(() => 'client-signature'),
  elMessageError: vi.fn(),
  basicCryptoLoadCount: 0
}));

vi.mock('@one-base-template/core', () => ({
  createBasicClientSignatureBeforeRequest: mocks.createBasicClientSignatureBeforeRequestMock,
  createObHttp: mocks.createObHttpMock,
  useAuthStore: () => ({ reset: mocks.authReset }),
  useMenuStore: () => ({ reset: mocks.menuReset }),
  useSystemStore: () => ({ reset: mocks.systemReset })
}));

vi.mock('@one-base-template/tag/store', () => ({
  useTagStoreHook: () => ({
    handleTags: mocks.tagHandle
  })
}));

vi.mock('element-plus', () => ({
  ElMessage: {
    error: mocks.elMessageError
  }
}));

vi.mock('@/config/basic/client-signature', () => {
  mocks.basicCryptoLoadCount += 1;
  return {
    createClientSignature: mocks.createClientSignatureMock
  };
});

import { createAppHttp } from '@/bootstrap/http';

interface ObHttpMockOptions {
  axios: {
    baseURL?: string;
    withCredentials?: boolean;
    timeout?: number;
  };
  beforeRequestCallback?: (config: { headers: Record<string, string> }) => Promise<void> | void;
  hooks: {
    onUnauthorized: () => void;
    onBizError: (payload: { message?: string }) => void;
  };
}

function createStorageMock() {
  const map = new Map<string, string>();

  return {
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
    get length() {
      return map.size;
    }
  } as Storage;
}

describe('bootstrap/http', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.basicCryptoLoadCount = 0;
    vi.stubGlobal('localStorage', createStorageMock());
    mocks.createObHttpMock.mockImplementation((options: unknown) => options);
  });

  it('应按鉴权模式生成 axios 基础配置', () => {
    createAppHttp({
      backend: 'default',
      isProd: true,
      apiBaseUrl: 'https://api.example.com',
      authMode: 'cookie',
      tokenKey: 'token-key',
      idTokenKey: 'id-token-key',
      pinia: {} as never,
      router: { replace: vi.fn() } as never
    });

    const options = mocks.createObHttpMock.mock.calls[0]?.[0] as ObHttpMockOptions;
    expect(options.axios.baseURL).toBe('https://api.example.com');
    expect(options.axios.withCredentials).toBe(true);
    expect(options.axios.timeout).toBe(30_000);
  });

  it('basic 场景应按请求懒加载签名模块并注入签名请求头', async () => {
    createAppHttp({
      backend: 'basic',
      isProd: true,
      apiBaseUrl: 'https://api.example.com',
      authMode: 'token',
      tokenKey: 'token-key',
      idTokenKey: 'id-token-key',
      basicHeaders: {
        Appcode: 'admin-app'
      },
      clientSignatureSalt: 'salt-1',
      clientSignatureClientId: 'client-1',
      pinia: {} as never,
      router: { replace: vi.fn() } as never
    });

    const options = mocks.createObHttpMock.mock.calls[0]?.[0] as ObHttpMockOptions;
    expect(options.axios.withCredentials).toBe(false);
    expect(options.axios.timeout).toBe(100_000);
    expect(mocks.createBasicClientSignatureBeforeRequestMock).toHaveBeenCalledTimes(1);
    const beforeRequest = options.beforeRequestCallback;
    expect(typeof beforeRequest).toBe('function');
    expect(mocks.basicCryptoLoadCount).toBe(0);

    const config = {
      headers: {}
    };
    if (!beforeRequest) {
      throw new Error('beforeRequestCallback 应已注入');
    }
    await beforeRequest(config);

    expect(mocks.createClientSignatureMock).toHaveBeenCalledWith({
      salt: 'salt-1',
      clientId: 'client-1'
    });
    expect(mocks.basicCryptoLoadCount).toBe(1);
    expect(config.headers).toMatchObject({
      Appcode: 'admin-app',
      'Client-Signature': 'client-signature'
    });
  });

  it('未授权时应清理状态并回到登录页', async () => {
    const routerReplace = vi.fn();
    const storage = globalThis.localStorage;
    storage.setItem('token-key', 'token');
    storage.setItem('id-token-key', 'id-token');

    createAppHttp({
      backend: 'default',
      isProd: false,
      authMode: 'cookie',
      tokenKey: 'token-key',
      idTokenKey: 'id-token-key',
      pinia: {} as never,
      router: { replace: routerReplace } as never
    });

    const options = mocks.createObHttpMock.mock.calls[0]?.[0] as ObHttpMockOptions;
    options.hooks.onUnauthorized();
    await Promise.resolve();
    await Promise.resolve();

    expect(storage.getItem('token-key')).toBeNull();
    expect(storage.getItem('id-token-key')).toBeNull();
    expect(mocks.authReset).toHaveBeenCalledTimes(1);
    expect(mocks.menuReset).toHaveBeenCalledTimes(1);
    expect(mocks.systemReset).toHaveBeenCalledTimes(1);
    expect(routerReplace).toHaveBeenCalledWith(routePaths.login);
  });

  it('业务错误应触发统一错误提示', () => {
    createAppHttp({
      backend: 'default',
      isProd: false,
      authMode: 'cookie',
      tokenKey: 'token-key',
      idTokenKey: 'id-token-key',
      pinia: {} as never,
      router: { replace: vi.fn() } as never
    });

    const options = mocks.createObHttpMock.mock.calls[0]?.[0] as ObHttpMockOptions;
    options.hooks.onBizError({
      message: '请求失败'
    });

    expect(mocks.elMessageError).toHaveBeenCalledWith('请求失败');
  });
});
