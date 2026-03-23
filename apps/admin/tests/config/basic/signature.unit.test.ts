import { describe, expect, it } from 'vite-plus/test';
import { createClientSignature as createClientSignatureFromClient } from '@/config/basic/client-signature';
import { createClientSignature as createClientSignatureFromCrypto } from '@/config/basic/crypto';
import { createClientSignature as createClientSignatureFromSignature } from '@/config/basic/signature';

function decodeBase64(value: string): string {
  return window.atob(value);
}

describe('config/basic/signature', () => {
  it('应由 signature 提供单一签名实现', () => {
    const params = {
      clientId: 'admin-client',
      timestamp: 1711111111111,
      salt: 'salt-test'
    };

    const fromClient = createClientSignatureFromClient(params);
    const fromCrypto = createClientSignatureFromCrypto(params);
    const fromSignature = createClientSignatureFromSignature(params);

    expect(fromClient).toBe(fromSignature);
    expect(fromCrypto).toBe(fromSignature);
  });

  it('应生成三段式 Client-Signature 并保留 clientId/timestamp 语义', () => {
    const signature = createClientSignatureFromSignature({
      clientId: 'client-1',
      timestamp: 1700000000000,
      salt: 'salt-1'
    });
    const parts = signature.split('.');

    expect(parts).toHaveLength(3);
    expect(decodeBase64(parts[0])).toBe('client-1');
    expect(decodeBase64(parts[1])).toBe('1700000000000');
    expect(decodeBase64(parts[2])).toMatch(/^[a-f0-9]{64}$/);
  });
});
