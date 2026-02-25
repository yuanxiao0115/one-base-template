/**
 * 类型判断和检测工具函数
 * @description 提供各种数据类型的判断和检测功能
 */

/**
 * 判断是否为函数
 * @param value - 要判断的值
 * @returns 是否为函数
 *
 * @example
 * ```typescript
 * isFunction(() => {}) // => true
 * isFunction('string') // => false
 * isFunction(null) // => false
 * ```
 */
export function isFunction(value: any): value is Function {
  return (
    typeof value === 'function' ||
    (value !== null && typeof value === 'object' && typeof (value as any).call === 'function')
  )
}

/**
 * 判断是否为字符串
 * @param value - 要判断的值
 * @returns 是否为字符串
 *
 * @example
 * ```typescript
 * isString('hello') // => true
 * isString(123) // => false
 * ```
 */
export function isString(value: any): value is string {
  return typeof value === 'string'
}

/**
 * 判断是否为数字
 * @param value - 要判断的值
 * @returns 是否为数字
 *
 * @example
 * ```typescript
 * isNumber(123) // => true
 * isNumber('123') // => false
 * isNumber(NaN) // => false
 * ```
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * 判断是否为布尔值
 * @param value - 要判断的值
 * @returns 是否为布尔值
 *
 * @example
 * ```typescript
 * isBoolean(true) // => true
 * isBoolean(false) // => true
 * isBoolean(1) // => false
 * ```
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 判断是否为数组
 * @param value - 要判断的值
 * @returns 是否为数组
 *
 * @example
 * ```typescript
 * isArray([1, 2, 3]) // => true
 * isArray('string') // => false
 * ```
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

/**
 * 判断是否为对象（不包括null和数组）
 * @param value - 要判断的值
 * @returns 是否为对象
 *
 * @example
 * ```typescript
 * isObject({}) // => true
 * isObject([]) // => false
 * isObject(null) // => false
 * ```
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 判断是否为纯对象（通过Object构造函数创建的对象）
 * @param value - 要判断的值
 * @returns 是否为纯对象
 *
 * @example
 * ```typescript
 * isPlainObject({}) // => true
 * isPlainObject(new Date()) // => false
 * isPlainObject([]) // => false
 * ```
 */
export function isPlainObject(value: any): value is Record<string, any> {
  if (!isObject(value)) return false

  // 检查是否有原型
  if (Object.getPrototypeOf(value) === null) return true

  // 检查是否是通过Object构造函数创建的
  let proto = value
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(value) === proto
}

/**
 * 判断是否为null或undefined
 * @param value - 要判断的值
 * @returns 是否为null或undefined
 *
 * @example
 * ```typescript
 * isNullOrUndefined(null) // => true
 * isNullOrUndefined(undefined) // => true
 * isNullOrUndefined('') // => false
 * ```
 */
export function isNullOrUndefined(value: any): value is null | undefined {
  return value === null || value === undefined
}

/**
 * 判断是否为空值（null、undefined、空字符串、空数组、空对象）
 * @param value - 要判断的值
 * @returns 是否为空值
 *
 * @example
 * ```typescript
 * isEmpty('') // => true
 * isEmpty([]) // => true
 * isEmpty({}) // => true
 * isEmpty(null) // => true
 * isEmpty(0) // => false
 * ```
 */
export function isEmpty(value: any): boolean {
  if (isNullOrUndefined(value)) return true
  if (isString(value)) return value.trim() === ''
  if (isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}

/**
 * 判断是否为Date对象
 * @param value - 要判断的值
 * @returns 是否为Date对象
 *
 * @example
 * ```typescript
 * isDate(new Date()) // => true
 * isDate('2023-01-01') // => false
 * ```
 */
export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

/**
 * 判断是否为正则表达式
 * @param value - 要判断的值
 * @returns 是否为正则表达式
 *
 * @example
 * ```typescript
 * isRegExp(/test/) // => true
 * isRegExp('test') // => false
 * ```
 */
export function isRegExp(value: any): value is RegExp {
  return value instanceof RegExp
}

/**
 * 判断是否为Error对象
 * @param value - 要判断的值
 * @returns 是否为Error对象
 *
 * @example
 * ```typescript
 * isError(new Error()) // => true
 * isError('error') // => false
 * ```
 */
export function isError(value: any): value is Error {
  return value instanceof Error
}

/**
 * 判断是否为Promise对象
 * @param value - 要判断的值
 * @returns 是否为Promise对象
 *
 * @example
 * ```typescript
 * isPromise(Promise.resolve()) // => true
 * isPromise({}) // => false
 * ```
 */
export function isPromise(value: any): value is Promise<any> {
  return (
    value instanceof Promise ||
    (value !== null && typeof value === 'object' && typeof value.then === 'function')
  )
}

/**
 * 获取值的类型字符串
 * @param value - 要获取类型的值
 * @returns 类型字符串
 *
 * @example
 * ```typescript
 * getType('hello') // => 'string'
 * getType([]) // => 'array'
 * getType({}) // => 'object'
 * getType(null) // => 'null'
 * ```
 */
export function getType(value: any): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (isArray(value)) return 'array'
  if (isDate(value)) return 'date'
  if (isRegExp(value)) return 'regexp'
  if (isError(value)) return 'error'
  if (isPromise(value)) return 'promise'

  return typeof value
}

/**
 * 类型守卫：检查对象是否具有指定的键
 * @param obj - 要检查的对象
 * @param key - 要检查的键
 * @returns 是否具有指定的键
 *
 * @example
 * ```typescript
 * const obj = { name: 'test' }
 * if (hasKey(obj, 'name')) {
 *   console.log(obj.name) // TypeScript知道obj.name存在
 * }
 * ```
 */
export function hasKey<T extends object, K extends string | number | symbol>(
  obj: T,
  key: K,
): obj is T & Record<K, unknown> {
  return key in obj
}

/**
 * 类型守卫：检查值是否为指定类型的数组
 * @param value - 要检查的值
 * @param typeGuard - 类型守卫函数
 * @returns 是否为指定类型的数组
 *
 * @example
 * ```typescript
 * const arr = [1, 2, 3]
 * if (isArrayOf(arr, isNumber)) {
 *   // TypeScript知道arr是number[]
 * }
 * ```
 */
export function isArrayOf<T>(value: any, typeGuard: (item: any) => item is T): value is T[] {
  return isArray(value) && value.every(typeGuard)
}
