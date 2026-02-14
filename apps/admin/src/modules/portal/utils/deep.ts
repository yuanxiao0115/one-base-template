/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 深拷贝（仅用于 portal schema 这类纯 JSON 数据）
 *
 * - 优先使用 structuredClone（更安全）
 * - 兜底使用 JSON（不支持函数/循环引用，但足够覆盖本模块数据结构）
 */
export function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * 深比较（用于避免 schemaChange 引起的回写死循环）
 *
 * 约束：不处理循环引用。
 */
export function deepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a !== typeof b) return false;
  if (a == null || b == null) return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object') {
    if (Array.isArray(b)) return false;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

