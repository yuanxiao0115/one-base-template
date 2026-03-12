/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 深拷贝（仅用于 portal schema 这类纯 JSON 数据）
 *
 * - 优先使用 structuredClone（更安全）
 * - 兜底使用 JSON 语义克隆（跳过函数/符号等不可序列化字段）
 */
export function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // 某些物料配置会混入不可结构化克隆字段（例如函数），降级到 JSON 语义克隆。
    }
  }
  return cloneWithJsonSemantics(value) as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function cloneWithJsonSemantics(value: unknown, seen: WeakMap<object, unknown> = new WeakMap()): unknown {
  if (value === null) {
    return null;
  }

  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    return value;
  }
  if (valueType === 'bigint') {
    return Number.isSafeInteger(value) ? Number(value) : String(value);
  }
  if (valueType === 'undefined' || valueType === 'function' || valueType === 'symbol') {
    return undefined;
  }
  if (valueType !== 'object') {
    return undefined;
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }

  const objectValue = value as object;
  if (seen.has(objectValue)) {
    return seen.get(objectValue);
  }

  if (Array.isArray(value)) {
    const arr: unknown[] = [];
    seen.set(objectValue, arr);
    for (const item of value) {
      const cloned = cloneWithJsonSemantics(item, seen);
      // 与 JSON.stringify 保持一致：数组中的 undefined/function/symbol 转成 null
      arr.push(cloned === undefined ? null : cloned);
    }
    return arr;
  }

  if (!isPlainObject(value)) {
    return undefined;
  }

  const result: Record<string, unknown> = {};
  seen.set(objectValue, result);
  for (const [key, item] of Object.entries(value)) {
    const cloned = cloneWithJsonSemantics(item, seen);
    // 与 JSON.stringify 保持一致：对象属性为 undefined 时剔除
    if (cloned !== undefined) {
      result[key] = cloned;
    }
  }
  return result;
}

/**
 * 深比较（用于避免 schemaChange 引起的回写死循环）
 *
 * 约束：不处理循环引用。
 */
export function deepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }
  if (a == null || b == null) {
    return false;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if (typeof a === 'object') {
    if (Array.isArray(b)) {
      return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!Object.hasOwn(b, key)) {
        return false;
      }
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
}
