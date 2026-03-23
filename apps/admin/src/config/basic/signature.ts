import { SM3 } from 'gm-crypto';

export interface ClientSignatureOptions {
  clientId?: string;
  timestamp?: number;
  salt?: string;
}

export function sm3DigestHex(value: string): string {
  return SM3.digest(value, 'utf8', 'hex');
}

export function base64Encode(value: string): string {
  return window.btoa(value);
}

/**
 * 生成老项目同款的 Client-Signature：
 * `${b64(clientId)}.${b64(timestamp)}.${b64(sm3(clientId + timestamp + salt))}`
 * 说明：salt 只是公开签名盐值，不具备前端 secret 语义。
 */
export function createClientSignature(params?: ClientSignatureOptions): string {
  const clientId = params?.clientId ?? '1';
  const timestamp = params?.timestamp ?? Date.now();
  const salt = params?.salt ?? 'fc54f9655dc04da486663f1055978ba8';

  const digest = sm3DigestHex(`${clientId}${timestamp}${salt}`);
  return `${base64Encode(clientId)}.${base64Encode(String(timestamp))}.${base64Encode(digest)}`;
}
