import { describe, expect, it, vi } from 'vite-plus/test';

import {
  createBasicClientSignatureBeforeRequest,
  type CreateClientSignature
} from './basic-client-signature';

describe('http/basic-client-signature', () => {
  it('应在回调执行时懒加载签名函数并缓存加载结果', async () => {
    const createClientSignature = vi.fn<CreateClientSignature>(() => 'sig-1');
    const loadCreateClientSignature = vi.fn(async () => createClientSignature);
    const beforeRequest = createBasicClientSignatureBeforeRequest({
      loadCreateClientSignature
    });

    expect(loadCreateClientSignature).not.toHaveBeenCalled();

    const firstConfig = {
      headers: {}
    };
    const secondConfig = {
      headers: {}
    };

    await beforeRequest(firstConfig);
    await beforeRequest(secondConfig);

    expect(loadCreateClientSignature).toHaveBeenCalledTimes(1);
    expect(createClientSignature).toHaveBeenCalledTimes(2);
  });

  it('应透传签名参数并合并请求头', async () => {
    const createClientSignature = vi.fn<CreateClientSignature>(() => 'sig-2');
    const beforeRequest = createBasicClientSignatureBeforeRequest({
      basicHeaders: {
        Appcode: 'admin-app',
        'Authorization-Type': 'ADMIN'
      },
      clientSignatureSalt: 'salt-1',
      clientSignatureClientId: 'client-1',
      loadCreateClientSignature: async () => createClientSignature
    });

    const config = {
      headers: {
        'X-Trace-Id': 'trace-1',
        Appcode: 'legacy'
      }
    };

    await beforeRequest(config);

    expect(createClientSignature).toHaveBeenCalledWith({
      salt: 'salt-1',
      clientId: 'client-1'
    });
    expect(config.headers).toEqual({
      'X-Trace-Id': 'trace-1',
      Appcode: 'admin-app',
      'Authorization-Type': 'ADMIN',
      'Client-Signature': 'sig-2'
    });
  });
});
