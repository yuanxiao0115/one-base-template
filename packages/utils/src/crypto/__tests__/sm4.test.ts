import { describe, it, expect, beforeEach, vi } from 'vitest'
import { encryptedCode, decryptedCode } from '../../sm4'
import { SM4 } from 'gm-crypto'

// Mock gm-crypto
vi.mock('gm-crypto', () => ({
  SM4: {
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  },
}))

describe('sm4', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('encryptedCode', () => {
    it('should encrypt data correctly', () => {
      vi.mocked(SM4.encrypt).mockReturnValue('encrypted-data')
      const result = encryptedCode('test-data')
      expect(result).toBe('encrypted-data')
      expect(SM4.encrypt).toHaveBeenCalledWith('test-data', '6f889d54ad8c4ddb8c525fc96a185444', {
        inputEncoding: 'utf8',
        outputEncoding: 'base64',
      })
    })

    it('should handle empty string', () => {
      vi.mocked(SM4.encrypt).mockReturnValue('')
      const result = encryptedCode('')
      expect(result).toBe('')
      expect(SM4.encrypt).toHaveBeenCalled()
    })

    it('should handle Chinese characters', () => {
      vi.mocked(SM4.encrypt).mockReturnValue('encrypted-chinese')
      const result = encryptedCode('测试中文')
      expect(result).toBe('encrypted-chinese')
      expect(SM4.encrypt).toHaveBeenCalled()
    })
  })

  describe('decryptedCode', () => {
    it('should decrypt data correctly', () => {
      vi.mocked(SM4.decrypt).mockReturnValue('decrypted-data')
      const result = decryptedCode('encrypted-data')
      expect(result).toBe('decrypted-data')
      expect(SM4.decrypt).toHaveBeenCalledWith(
        'encrypted-data',
        '6f889d54ad8c4ddb8c525fc96a185444',
        {
          inputEncoding: 'base64',
          outputEncoding: 'utf8',
        },
      )
    })

    it('should handle empty string', () => {
      vi.mocked(SM4.decrypt).mockReturnValue('')
      const result = decryptedCode('')
      expect(result).toBe('')
      expect(SM4.decrypt).toHaveBeenCalled()
    })

    it('should handle Chinese characters', () => {
      vi.mocked(SM4.decrypt).mockReturnValue('测试中文')
      const result = decryptedCode('encrypted-chinese')
      expect(result).toBe('测试中文')
      expect(SM4.decrypt).toHaveBeenCalled()
    })
  })
})
