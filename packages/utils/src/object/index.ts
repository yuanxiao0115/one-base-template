/**
 * 对象处理工具函数
 * @description 提供对象的深拷贝、合并、转换等功能
 */

/**
 * 深拷贝对象
 * @param obj - 要拷贝的对象
 * @returns 深拷贝后的对象
 *
 * @example
 * ```typescript
 * const original = { a: 1, b: { c: 2 } }
 * const copied = deepClone(original)
 * copied.b.c = 3
 * console.log(original.b.c) // => 2 (原对象未被修改)
 * ```
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 深度合并对象
 * @param target - 目标对象
 * @param sources - 源对象数组
 * @returns 合并后的对象
 *
 * @example
 * ```typescript
 * const obj1 = { a: 1, b: { c: 2 } }
 * const obj2 = { b: { d: 3 }, e: 4 }
 * deepMerge(obj1, obj2)
 * // => { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (!source) return target as T

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key] as any, source[key] as any)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 判断是否为对象
 * @param item - 要判断的项
 * @returns 是否为对象
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 获取对象指定路径的值
 * @param obj - 对象
 * @param path - 路径字符串或数组
 * @param defaultValue - 默认值
 * @returns 路径对应的值
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 1 } } }
 * get(obj, 'a.b.c') // => 1
 * get(obj, ['a', 'b', 'c']) // => 1
 * get(obj, 'a.b.d', 'default') // => 'default'
 * ```
 */
export function get<T = any>(
  obj: Record<string, any>,
  path: string | string[],
  defaultValue?: T,
): T {
  const keys = Array.isArray(path) ? path : path.split('.')
  let result = obj

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue as T
    }
    result = result[key]
  }

  return result === undefined ? (defaultValue as T) : (result as T)
}

/**
 * 设置对象指定路径的值
 * @param obj - 对象
 * @param path - 路径字符串或数组
 * @param value - 要设置的值
 * @returns 修改后的对象
 *
 * @example
 * ```typescript
 * const obj = {}
 * set(obj, 'a.b.c', 1)
 * // obj => { a: { b: { c: 1 } } }
 * ```
 */
export function set<T extends Record<string, any>>(obj: T, path: string | string[], value: any): T {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current: any = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
  return obj
}

/**
 * 删除对象指定路径的属性
 * @param obj - 对象
 * @param path - 路径字符串或数组
 * @returns 是否删除成功
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 1 } } }
 * unset(obj, 'a.b.c')
 * // obj => { a: { b: {} } }
 * ```
 */
export function unset<T extends Record<string, any>>(obj: T, path: string | string[]): boolean {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      return false
    }
    current = current[key]
  }

  const lastKey = keys[keys.length - 1]
  if (lastKey in current) {
    delete current[lastKey]
    return true
  }

  return false
}

/**
 * 检查对象是否有指定路径
 * @param obj - 对象
 * @param path - 路径字符串或数组
 * @returns 是否存在该路径
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 1 } } }
 * has(obj, 'a.b.c') // => true
 * has(obj, 'a.b.d') // => false
 * ```
 */
export function has(obj: Record<string, any>, path: string | string[]): boolean {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current = obj

  for (const key of keys) {
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return false
    }
    current = current[key]
  }

  return true
}

/**
 * 获取对象的所有键路径
 * @param obj - 对象
 * @param prefix - 路径前缀
 * @returns 所有键路径数组
 *
 * @example
 * ```typescript
 * const obj = { a: { b: 1, c: { d: 2 } } }
 * getPaths(obj)
 * // => ['a.b', 'a.c.d']
 * ```
 */
export function getPaths(obj: Record<string, any>, prefix: string = ''): string[] {
  const paths: string[] = []

  function traverse(current: any, currentPath: string) {
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      for (const key in current) {
        if (Object.prototype.hasOwnProperty.call(current, key)) {
          const newPath = currentPath ? `${currentPath}.${key}` : key
          if (current[key] && typeof current[key] === 'object' && !Array.isArray(current[key])) {
            traverse(current[key], newPath)
          } else {
            paths.push(newPath)
          }
        }
      }
    }
  }

  traverse(obj, prefix)
  return paths
}

/**
 * 扁平化对象
 * @param obj - 要扁平化的对象
 * @param separator - 分隔符，默认为'.'
 * @returns 扁平化后的对象
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 1 } }, d: 2 }
 * flatten(obj)
 * // => { 'a.b.c': 1, 'd': 2 }
 * ```
 */
export function flatten(obj: Record<string, any>, separator: string = '.'): Record<string, any> {
  const result: Record<string, any> = {}

  function flattenRecursive(current: any, prefix: string = '') {
    for (const key in current) {
      if (Object.prototype.hasOwnProperty.call(current, key)) {
        const newKey = prefix ? `${prefix}${separator}${key}` : key

        if (
          current[key] &&
          typeof current[key] === 'object' &&
          !Array.isArray(current[key]) &&
          !(current[key] instanceof Date)
        ) {
          flattenRecursive(current[key], newKey)
        } else {
          result[newKey] = current[key]
        }
      }
    }
  }

  flattenRecursive(obj)
  return result
}

/**
 * 反扁平化对象
 * @param obj - 扁平化的对象
 * @param separator - 分隔符，默认为'.'
 * @returns 反扁平化后的对象
 *
 * @example
 * ```typescript
 * const obj = { 'a.b.c': 1, 'd': 2 }
 * unflatten(obj)
 * // => { a: { b: { c: 1 } }, d: 2 }
 * ```
 */
export function unflatten(obj: Record<string, any>, separator: string = '.'): Record<string, any> {
  const result: Record<string, any> = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      set(result, key.split(separator), obj[key])
    }
  }

  return result
}

/**
 * 选择对象的指定属性
 * @param obj - 源对象
 * @param keys - 要选择的键数组
 * @returns 包含指定属性的新对象
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 }
 * pick(obj, ['a', 'c'])
 * // => { a: 1, c: 3 }
 * ```
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }

  return result
}

/**
 * 排除对象的指定属性
 * @param obj - 源对象
 * @param keys - 要排除的键数组
 * @returns 排除指定属性后的新对象
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 }
 * omit(obj, ['b'])
 * // => { a: 1, c: 3 }
 * ```
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj }

  for (const key of keys) {
    delete result[key]
  }

  return result
}

/**
 * 判断对象所有属性是否为空
 * @param obj - 要判断的对象
 * @returns 是否所有属性都为空
 *
 * @example
 * ```typescript
 * isAllEmpty({ a: '', b: '', c: '' }) // => true
 * isAllEmpty({ a: 'test', b: '' }) // => false
 * isAllEmpty({}) // => true
 * ```
 */
export function isAllEmpty(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return true
  return Object.keys(obj).every(
    (key) => obj[key] === '' || obj[key] === null || obj[key] === undefined,
  )
}
