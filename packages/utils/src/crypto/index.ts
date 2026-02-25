import CryptoJS from 'crypto-js'

export interface CryptoOptions {
  key?: string
  iv?: string
}

/**
 * AES 加密工具类
 */
export class Crypto {
  private key: string
  private iv: string

  constructor(options: CryptoOptions = {}) {
    this.key = options.key || 'default-key'
    this.iv = options.iv || 'default-iv'
  }

  /**
   * AES 加密
   * @param data 要加密的数据
   * @returns 加密后的数据
   */
  encrypt(data: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.key)
    const iv = CryptoJS.enc.Utf8.parse(this.iv)
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    return encrypted.toString()
  }

  /**
   * AES 解密
   * @param data 要解密的数据
   * @returns 解密后的数据
   */
  decrypt(data: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.key)
    const iv = CryptoJS.enc.Utf8.parse(this.iv)
    const decrypted = CryptoJS.AES.decrypt(data, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    return decrypted.toString(CryptoJS.enc.Utf8)
  }
}
