import { SM4 } from 'gm-crypto';
export { createClientSignature } from './signature';

const DEFAULT_SM4_KEY_HEX = '6f889d54ad8c4ddb8c525fc96a185444';

export function sm4EncryptBase64(plainText: string, keyHex: string = DEFAULT_SM4_KEY_HEX): string {
  return SM4.encrypt(plainText, keyHex, {
    inputEncoding: 'utf8',
    outputEncoding: 'base64'
  });
}
