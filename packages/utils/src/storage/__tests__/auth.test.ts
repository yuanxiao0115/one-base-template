import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getToken, setToken, removeToken } from '../auth'
import Cookies from 'js-cookie'

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('auth', () => {
  beforeEach(() => {
    // 清理所有 mock 的调用记录
    vi.clearAllMocks()
  })

  describe('getToken', () => {
    it('should return token from cookie', () => {
      vi.mocked(Cookies.get).mockReturnValue('test-token')
      expect(getToken()).toBe('test-token')
      expect(Cookies.get).toHaveBeenCalledWith('token')
    })

    it('should return empty string when no token exists', () => {
      vi.mocked(Cookies.get).mockReturnValue(undefined)
      expect(getToken()).toBe('')
      expect(Cookies.get).toHaveBeenCalledWith('token')
    })
  })

  describe('setToken', () => {
    it('should set token to cookie', () => {
      setToken('test-token')
      expect(Cookies.set).toHaveBeenCalledWith('token', 'test-token')
    })

    it('should handle empty token', () => {
      setToken('')
      expect(Cookies.set).toHaveBeenCalledWith('token', '')
    })
  })

  describe('removeToken', () => {
    it('should remove token from cookie', () => {
      removeToken()
      expect(Cookies.remove).toHaveBeenCalledWith('token')
    })
  })
})
