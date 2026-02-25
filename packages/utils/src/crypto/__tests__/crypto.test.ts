import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Crypto } from '../../crypto'

describe('crypto', () => {
  const testData = 'Hello, World!'
  let crypto: Crypto
  let encryptedData: string

  beforeEach(() => {
    // 创建crypto实例 - AES需要16字节的key和iv
    crypto = new Crypto({
      key: '1234567890123456', // 16字节
      iv: 'abcdefghijklmnop', // 16字节
    })
    // 每个测试前加密测试数据
    encryptedData = crypto.encrypt(testData)
  })

  afterEach(() => {
    // 每个测试后清理数据
    encryptedData = ''
  })

  it('should encrypt data', () => {
    expect(encryptedData).toBeDefined()
    expect(typeof encryptedData).toBe('string')
    expect(encryptedData).not.toBe(testData)
  })

  it('should decrypt encrypted data correctly', () => {
    const decrypted = crypto.decrypt(encryptedData)
    expect(decrypted).toBe(testData)
  })

  it('should handle empty string', () => {
    const encrypted = crypto.encrypt('')
    const decrypted = crypto.decrypt(encrypted)
    expect(decrypted).toBe('')
  })

  it('should handle special characters', () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const encrypted = crypto.encrypt(specialChars)
    const decrypted = crypto.decrypt(encrypted)
    expect(decrypted).toBe(specialChars)
  })

  it('should handle Chinese characters', () => {
    const chinese = '你好，世界！'
    const encrypted = crypto.encrypt(chinese)
    const decrypted = crypto.decrypt(encrypted)
    expect(decrypted).toBe(chinese)
  })

  it('should handle invalid encrypted data', () => {
    // crypto-js 在解密无效数据时返回空字符串，而不是抛出错误
    const result = crypto.decrypt('invalid-data')
    expect(result).toBe('')
  })
})
