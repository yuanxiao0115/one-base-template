import { SM3 } from 'gm-crypto';
import {
  buildClientSignature,
  getClientSignatureInput,
  type ClientSignatureOptions
} from '@one-base-template/core';

function sm3DigestHex(value: string): string {
  return SM3.digest(value, 'utf8', 'hex');
}

export type { ClientSignatureOptions };

/**
 * 生成与老项目兼容的 Client-Signature。
 */
export function createClientSignature(params?: ClientSignatureOptions): string {
  const { clientId, timestamp, salt } = getClientSignatureInput(params);

  const digest = sm3DigestHex(`${clientId}${timestamp}${salt}`);
  return buildClientSignature({
    clientId,
    timestamp,
    digestHex: digest
  });
}
