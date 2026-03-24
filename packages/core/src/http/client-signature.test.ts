import { describe, expect, it, vi } from 'vite-plus/test';
import {
  buildClientSignature,
  DEFAULT_CLIENT_SIGNATURE_CLIENT_ID,
  DEFAULT_CLIENT_SIGNATURE_SALT,
  getClientSignatureInput
} from './client-signature';

function decodeBase64(value: string): string {
  if (typeof globalThis.atob !== 'function') {
    throw new Error('当前环境缺少 atob，无法执行签名测试');
  }
  return globalThis.atob(value);
}

describe('http/client-signature', () => {
  it('应提供稳定默认输入参数', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    expect(getClientSignatureInput()).toEqual({
      clientId: DEFAULT_CLIENT_SIGNATURE_CLIENT_ID,
      timestamp: 1700000000000,
      salt: DEFAULT_CLIENT_SIGNATURE_SALT
    });

    nowSpy.mockRestore();
  });

  it('应生成三段式签名', () => {
    const signature = buildClientSignature({
      clientId: 'client-1',
      timestamp: 1700000000000,
      digestHex: 'abc123'
    });

    const parts = signature.split('.');
    expect(parts).toHaveLength(3);
    const [clientIdEncoded, timestampEncoded, digestEncoded] = parts as [string, string, string];
    expect(decodeBase64(clientIdEncoded)).toBe('client-1');
    expect(decodeBase64(timestampEncoded)).toBe('1700000000000');
    expect(decodeBase64(digestEncoded)).toBe('abc123');
  });
});
