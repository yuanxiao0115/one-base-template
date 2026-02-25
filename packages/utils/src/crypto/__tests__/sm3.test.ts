import { describe, it, expect } from 'vitest'
import { hash } from '../../sm3'

describe('sm3', () => {
  it('should generate correct hash for string', () => {
    // SM3 哈希值是固定长度的 64 位十六进制字符串
    const result = hash('Hello, World!')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should generate different hashes for different strings', () => {
    const hash1 = hash('test1')
    const hash2 = hash('test2')
    expect(hash1).not.toBe(hash2)
  })

  it('should generate same hash for same string', () => {
    const str = 'test string'
    expect(hash(str)).toBe(hash(str))
  })

  it('should handle empty string', () => {
    const result = hash('')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should handle Chinese characters', () => {
    const result = hash('测试中文')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should handle special characters', () => {
    const result = hash('!@#$%^&*()')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })
})
