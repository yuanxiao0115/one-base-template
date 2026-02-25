import type { StorageOptions } from './local'

export class SessionStorage {
  private prefix: string

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'one_'
  }

  private getKey(key: string): string {
    return this.prefix + key
  }

  private getAllKeys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key)
      }
    }
    return keys
  }

  set(key: string, value: any) {
    const prefixedKey = this.getKey(key)
    sessionStorage.setItem(prefixedKey, JSON.stringify(value))
  }

  get(key: string): any {
    const prefixedKey = this.getKey(key)
    const data = sessionStorage.getItem(prefixedKey)
    if (!data) return null
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  remove(key: string) {
    const prefixedKey = this.getKey(key)
    sessionStorage.removeItem(prefixedKey)
  }

  clear() {
    const keys = this.getAllKeys()
    keys.forEach((key) => {
      sessionStorage.removeItem(key)
    })
  }
}
