const TOKEN_KEY = 'token'

/**
 * 获取 token
 */
export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || ''
}

/**
 * 设置 token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除 token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
