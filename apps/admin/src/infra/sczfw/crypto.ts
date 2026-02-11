import { SM3, SM4 } from 'gm-crypto';

// 说明：该 key 与老项目（standard-oa-web-sczfw）保持一致，用于登录参数与滑块验证码坐标加密
const DEFAULT_SM4_KEY_HEX = '6f889d54ad8c4ddb8c525fc96a185444';

export function sm4EncryptBase64(plainText: string, keyHex: string = DEFAULT_SM4_KEY_HEX): string {
  return SM4.encrypt(plainText, keyHex, {
    inputEncoding: 'utf8',
    outputEncoding: 'base64'
  });
}

export function sm4DecryptUtf8(cipherTextBase64: string, keyHex: string = DEFAULT_SM4_KEY_HEX): string {
  return SM4.decrypt(cipherTextBase64, keyHex, {
    inputEncoding: 'base64',
    outputEncoding: 'utf8'
  });
}

export function sm3DigestHex(value: string): string {
  return SM3.digest(value, 'utf8', 'hex');
}

export function base64Encode(value: string): string {
  return window.btoa(value);
}

/**
 * 生成老项目同款的 Client-Signature：
 * `${b64(clientId)}.${b64(timestamp)}.${b64(sm3(clientId + timestamp + secret))}`
 */
export function createClientSignature(params?: {
  clientId?: string;
  timestamp?: number;
  secret?: string;
}): string {
  const clientId = params?.clientId ?? '1';
  const timestamp = params?.timestamp ?? Date.now();
  const secret = params?.secret ?? 'fc54f9655dc04da486663f1055978ba8';

  const digest = sm3DigestHex(`${clientId}${timestamp}${secret}`);
  return `${base64Encode(clientId)}.${base64Encode(String(timestamp))}.${base64Encode(digest)}`;
}

