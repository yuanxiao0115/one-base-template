import { SM3 } from 'gm-crypto';

function sm3DigestHex(value: string): string {
  return SM3.digest(value, 'utf8', 'hex');
}

function base64Encode(value: string): string {
  return window.btoa(value);
}

/**
 * 生成老项目同款的 Client-Signature。
 */
export function createClientSignature(params?: { clientId?: string; timestamp?: number; salt?: string }): string {
  const clientId = params?.clientId ?? '1';
  const timestamp = params?.timestamp ?? Date.now();
  const salt = params?.salt ?? 'fc54f9655dc04da486663f1055978ba8';

  const digest = sm3DigestHex(`${clientId}${timestamp}${salt}`);
  return `${base64Encode(clientId)}.${base64Encode(String(timestamp))}.${base64Encode(digest)}`;
}
