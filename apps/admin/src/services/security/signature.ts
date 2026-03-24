import { SM3 } from 'gm-crypto';
import {
  buildClientSignature,
  getClientSignatureInput,
  type ClientSignatureOptions
} from '@one-base-template/core';

/**
 * basic 网关签名能力（安全服务层）。
 */
export function sm3DigestHex(value: string): string {
  return SM3.digest(value, 'utf8', 'hex');
}

export type { ClientSignatureOptions };

/**
 * 生成老项目同款的 Client-Signature：
 * `${b64(clientId)}.${b64(timestamp)}.${b64(sm3(clientId + timestamp + salt))}`
 * 说明：salt 只是公开签名盐值，不具备前端 secret 语义。
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
