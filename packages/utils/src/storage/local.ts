export interface StorageOptions {
  prefix?: string
}

export interface StorageData {
  value: any
  expire?: number
}

export class LocalStorage {
  private prefix: string

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'one_'
  }

  private getKey(key: string): string {
    return this.prefix + key
  }

  private getAllKeys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key)
      }
    }
    return keys
  }

  set(key: string, value: any, expire?: number) {
    const prefixedKey = this.getKey(key)
    const data: StorageData = {
      value,
      expire: expire ? Date.now() + expire : undefined,
    }
    localStorage.setItem(prefixedKey, JSON.stringify(data))
  }

  get(key: string): any {
    const prefixedKey = this.getKey(key)
    const data = localStorage.getItem(prefixedKey)
    if (!data) return null

    try {
      const { value, expire } = JSON.parse(data) as StorageData
      if (expire && expire < Date.now()) {
        this.remove(key)
        return null
      }
      return value
    } catch {
      return null
    }
  }

  remove(key: string) {
    const prefixedKey = this.getKey(key)
    localStorage.removeItem(prefixedKey)
  }

  clear() {
    const keys = this.getAllKeys()
    keys.forEach((key) => {
      localStorage.removeItem(key)
    })
  }
}
