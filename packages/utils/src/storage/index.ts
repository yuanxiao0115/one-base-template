import { LocalStorage } from './local'
export * from './local'
export * from './session'

// 创建默认的 storage 实例
export const storage = new LocalStorage()
