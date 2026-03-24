import { SM4 } from 'gm-crypto';
export { createClientSignature } from './signature';

/**
 * admin 安全加密能力（安全服务层）。
 */
// 说明：该 key 与老项目（standard-oa-web-basic）保持一致，用于登录参数与滑块验证码坐标加密
const DEFAULT_SM4_KEY_HEX = '6f889d54ad8c4ddb8c525fc96a185444';

export function sm4EncryptBase64(plainText: string, keyHex: string = DEFAULT_SM4_KEY_HEX): string {
  return SM4.encrypt(plainText, keyHex, {
    inputEncoding: 'utf8',
    outputEncoding: 'base64'
  });
}
