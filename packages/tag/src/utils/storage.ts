import { configManager } from '../config/configManager'

/**
 * 获取存储实例
 */
export function getStorage() {
  const config = configManager.getConfig()
  return config.storageType === 'session' ? sessionStorage : localStorage
}

/**
 * 获取存储键名
 */
export function getStorageKey(): string {
  const config = configManager.getConfig()
  return config.storageKey
}

/**
 * 缓存标签页数据
 */
export function tagsCache(multiTags: any[]): void {
  try {
    const storage = getStorage()
    const key = getStorageKey()
    storage.setItem(key, JSON.stringify(multiTags))
  } catch (error) {
    console.error('缓存标签页数据失败:', error)
  }
}

/**
 * 获取存储的标签页数据
 */
export function getStoredTags() {
  try {
    const storage = getStorage()
    const key = getStorageKey()
    const data = storage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('获取标签页数据失败:', error)
    return null
  }
}

/**
 * 清除存储的标签页数据
 */
export function clearStoredTags(): void {
  try {
    const storage = getStorage()
    const key = getStorageKey()
    storage.removeItem(key)
  } catch (error) {
    console.error('清除标签页数据失败:', error)
  }
}
