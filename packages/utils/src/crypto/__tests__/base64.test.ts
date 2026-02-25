import { describe, it, expect } from 'vitest'
import { encode, decode } from '../../base64'

describe('base64', () => {
  describe('encode', () => {
    it('should encode string correctly', () => {
      const result1 = encode('Hello, World!')
      expect(result1).toBeTruthy()
      expect(decode(result1)).toBe('Hello, World!')

      const result2 = encode('测试中文')
      expect(result2).toBeTruthy()
      expect(decode(result2)).toBe('测试中文')
    })

    it('should handle empty string', () => {
      expect(encode('')).toBe('')
    })

    it('should handle special characters', () => {
      const result = encode('!@#$%^&*()')
      expect(result).toBeTruthy()
      expect(decode(result)).toBe('!@#$%^&*()')
    })
  })

  describe('decode', () => {
    it('should decode encoded string correctly', () => {
      const original = 'Hello, World!'
      const encoded = encode(original)
      expect(decode(encoded)).toBe(original)
    })

    it('should handle Chinese characters', () => {
      const original = '测试中文'
      const encoded = encode(original)
      expect(decode(encoded)).toBe(original)
    })

    it('should handle empty string', () => {
      expect(decode('')).toBe('')
    })

    it('should handle special characters', () => {
      const original = '!@#$%^&*()'
      const encoded = encode(original)
      expect(decode(encoded)).toBe(original)
    })
  })
})
