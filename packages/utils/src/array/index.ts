/**
 * 数组处理工具函数
 * @description 提供数组的处理、转换、分组等功能
 */

/**
 * 为数组项添加序号
 * @param data - 数据数组
 * @param currentPage - 当前页码
 * @param pageSize - 每页大小
 * @returns 添加序号后的数组
 * 
 * @example
 * ```typescript
 * const data = [{ name: 'A' }, { name: 'B' }]
 * addIndex(data, 2, 10)
 * // => [{ name: 'A', index: 11 }, { name: 'B', index: 12 }]
 * ```
 */
export function addIndex<T extends Record<string, any>>(
  data: T[],
  currentPage: number,
  pageSize: number
): (T & { index: number })[] {
  return data.map((item, index) => ({
    ...item,
    index: (currentPage - 1) * pageSize + index + 1
  }))
}

/**
 * 获取两个数组的差异项
 * @param arr1 - 第一个数组
 * @param arr2 - 第二个数组
 * @param compareKey - 比较的键名，默认为'name'
 * @returns arr1中存在但arr2中不存在的项
 * 
 * @example
 * ```typescript
 * const arr1 = [{ name: 'A' }, { name: 'B' }]
 * const arr2 = [{ name: 'A' }]
 * getDifferentArr(arr1, arr2) // => [{ name: 'B' }]
 * ```
 */
export function getDifferentArr<T extends Record<string, any>>(
  arr1: T[],
  arr2: T[],
  compareKey: string = 'name'
): T[] {
  return arr1.filter(item1 => 
    !arr2.some(item2 => item2[compareKey] === item1[compareKey])
  )
}

/**
 * 数组分组
 * @param array - 要分组的数组
 * @param key - 分组依据的键名
 * @returns 分组后的对象
 * 
 * @example
 * ```typescript
 * const data = [
 *   { type: 'A', value: 1 },
 *   { type: 'A', value: 2 },
 *   { type: 'B', value: 3 }
 * ]
 * groupBy(data, 'type')
 * // => { A: [{ type: 'A', value: 1 }, { type: 'A', value: 2 }], B: [{ type: 'B', value: 3 }] }
 * ```
 */
export function groupBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * 数组去重
 * @param array - 要去重的数组
 * @param key - 去重依据的键名（可选）
 * @returns 去重后的数组
 * 
 * @example
 * ```typescript
 * // 基础类型去重
 * unique([1, 2, 2, 3]) // => [1, 2, 3]
 * 
 * // 对象数组去重
 * const data = [{ id: 1 }, { id: 2 }, { id: 1 }]
 * unique(data, 'id') // => [{ id: 1 }, { id: 2 }]
 * ```
 */
export function unique<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)]
  }
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * 数组分块
 * @param array - 要分块的数组
 * @param size - 每块的大小
 * @returns 分块后的二维数组
 * 
 * @example
 * ```typescript
 * chunk([1, 2, 3, 4, 5], 2) // => [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return []
  
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

/**
 * 数组排序（支持多字段）
 * @param array - 要排序的数组
 * @param sortBy - 排序配置
 * @returns 排序后的数组
 * 
 * @example
 * ```typescript
 * const data = [
 *   { name: 'B', age: 20 },
 *   { name: 'A', age: 30 },
 *   { name: 'A', age: 25 }
 * ]
 * 
 * sortBy(data, [
 *   { key: 'name', order: 'asc' },
 *   { key: 'age', order: 'desc' }
 * ])
 * // => [{ name: 'A', age: 30 }, { name: 'A', age: 25 }, { name: 'B', age: 20 }]
 * ```
 */
export function sortBy<T extends Record<string, any>>(
  array: T[],
  sortBy: Array<{ key: keyof T; order: 'asc' | 'desc' }>
): T[] {
  return [...array].sort((a, b) => {
    for (const { key, order } of sortBy) {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
    }
    return 0
  })
}

/**
 * 数组交集
 * @param arr1 - 第一个数组
 * @param arr2 - 第二个数组
 * @param key - 比较键名（可选）
 * @returns 交集数组
 * 
 * @example
 * ```typescript
 * intersection([1, 2, 3], [2, 3, 4]) // => [2, 3]
 * 
 * const arr1 = [{ id: 1 }, { id: 2 }]
 * const arr2 = [{ id: 2 }, { id: 3 }]
 * intersection(arr1, arr2, 'id') // => [{ id: 2 }]
 * ```
 */
export function intersection<T>(
  arr1: T[],
  arr2: T[],
  key?: keyof T
): T[] {
  if (!key) {
    const set2 = new Set(arr2)
    return arr1.filter(item => set2.has(item))
  }
  
  const set2 = new Set(arr2.map(item => item[key]))
  return arr1.filter(item => set2.has(item[key]))
}

/**
 * 数组差集
 * @param arr1 - 第一个数组
 * @param arr2 - 第二个数组
 * @param key - 比较键名（可选）
 * @returns 差集数组（arr1中有但arr2中没有的元素）
 * 
 * @example
 * ```typescript
 * difference([1, 2, 3], [2, 3, 4]) // => [1]
 * ```
 */
export function difference<T>(
  arr1: T[],
  arr2: T[],
  key?: keyof T
): T[] {
  if (!key) {
    const set2 = new Set(arr2)
    return arr1.filter(item => !set2.has(item))
  }
  
  const set2 = new Set(arr2.map(item => item[key]))
  return arr1.filter(item => !set2.has(item[key]))
}

/**
 * 数组求和
 * @param array - 数组
 * @param key - 求和字段（可选）
 * @returns 求和结果
 * 
 * @example
 * ```typescript
 * sum([1, 2, 3]) // => 6
 * 
 * const data = [{ value: 10 }, { value: 20 }]
 * sum(data, 'value') // => 30
 * ```
 */
export function sum<T>(array: T[], key?: keyof T): number {
  if (!key) {
    return (array as number[]).reduce((acc, val) => acc + val, 0)
  }
  
  return array.reduce((acc, item) => {
    const value = Number(item[key]) || 0
    return acc + value
  }, 0)
}

/**
 * 数组平均值
 * @param array - 数组
 * @param key - 计算字段（可选）
 * @returns 平均值
 * 
 * @example
 * ```typescript
 * average([1, 2, 3]) // => 2
 * 
 * const data = [{ score: 80 }, { score: 90 }]
 * average(data, 'score') // => 85
 * ```
 */
export function average<T>(array: T[], key?: keyof T): number {
  if (array.length === 0) return 0
  return sum(array, key) / array.length
}

/**
 * 数组最大值
 * @param array - 数组
 * @param key - 比较字段（可选）
 * @returns 最大值或最大值对象
 * 
 * @example
 * ```typescript
 * max([1, 3, 2]) // => 3
 * 
 * const data = [{ score: 80 }, { score: 90 }]
 * max(data, 'score') // => { score: 90 }
 * ```
 */
export function max<T>(array: T[], key?: keyof T): T | undefined {
  if (array.length === 0) return undefined
  
  if (!key) {
    return array.reduce((max, current) => 
      current > max ? current : max
    )
  }
  
  return array.reduce((max, current) => 
    current[key] > max[key] ? current : max
  )
}

/**
 * 数组最小值
 * @param array - 数组
 * @param key - 比较字段（可选）
 * @returns 最小值或最小值对象
 * 
 * @example
 * ```typescript
 * min([1, 3, 2]) // => 1
 * 
 * const data = [{ score: 80 }, { score: 90 }]
 * min(data, 'score') // => { score: 80 }
 * ```
 */
export function min<T>(array: T[], key?: keyof T): T | undefined {
  if (array.length === 0) return undefined
  
  if (!key) {
    return array.reduce((min, current) => 
      current < min ? current : min
    )
  }
  
  return array.reduce((min, current) => 
    current[key] < min[key] ? current : min
  )
}
