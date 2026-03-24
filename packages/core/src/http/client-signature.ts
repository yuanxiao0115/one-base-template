export interface ClientSignatureOptions {
  clientId?: string;
  timestamp?: number;
  salt?: string;
}

export interface BuildClientSignatureOptions {
  clientId: string;
  timestamp: number;
  digestHex: string;
}

export interface ClientSignatureResolvedOptions {
  clientId: string;
  timestamp: number;
  salt: string;
}

export const DEFAULT_CLIENT_SIGNATURE_CLIENT_ID = '1';
export const DEFAULT_CLIENT_SIGNATURE_SALT = 'fc54f9655dc04da486663f1055978ba8';
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function encodeBase64ByAscii(value: string): string {
  let output = '';
  let index = 0;

  while (index < value.length) {
    const byte1 = value.charCodeAt(index++) & 0xff;
    const hasByte2 = index < value.length;
    const byte2 = hasByte2 ? value.charCodeAt(index++) & 0xff : 0;
    const hasByte3 = index < value.length;
    const byte3 = hasByte3 ? value.charCodeAt(index++) & 0xff : 0;

    const chunk = (byte1 << 16) | (byte2 << 8) | byte3;
    output += BASE64_ALPHABET[(chunk >> 18) & 0x3f];
    output += BASE64_ALPHABET[(chunk >> 12) & 0x3f];
    output += hasByte2 ? BASE64_ALPHABET[(chunk >> 6) & 0x3f] : '=';
    output += hasByte3 ? BASE64_ALPHABET[chunk & 0x3f] : '=';
  }

  return output;
}

function encodeBase64(value: string): string {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(value);
  }
  return encodeBase64ByAscii(value);
}

export function getClientSignatureInput(
  options?: ClientSignatureOptions
): ClientSignatureResolvedOptions {
  return {
    clientId: options?.clientId ?? DEFAULT_CLIENT_SIGNATURE_CLIENT_ID,
    timestamp: options?.timestamp ?? Date.now(),
    salt: options?.salt ?? DEFAULT_CLIENT_SIGNATURE_SALT
  };
}

export function buildClientSignature(options: BuildClientSignatureOptions): string {
  const { clientId, timestamp, digestHex } = options;
  return `${encodeBase64(clientId)}.${encodeBase64(String(timestamp))}.${encodeBase64(digestHex)}`;
}
