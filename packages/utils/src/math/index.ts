/**
 * 数学计算和几何操作工具函数
 * @description 提供数学计算、几何操作、坐标转换等功能
 */

/**
 * 点坐标接口
 */
export interface Point {
  x: number
  y: number
}

/**
 * 点坐标转换
 * @param point - 坐标点
 * @returns 转换后的坐标点
 * 
 * @example
 * ```typescript
 * const point = { x: 10, y: 20 }
 * const transformed = pointTransform(point)
 * // => { x: 10, y: 20 }
 * ```
 */
export function pointTransform(point: Point): Point {
  return {
    x: point.x,
    y: point.y,
  }
}

/**
 * 计算两点之间的距离
 * @param point1 - 第一个点
 * @param point2 - 第二个点
 * @returns 两点间的距离
 * 
 * @example
 * ```typescript
 * const distance = getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })
 * // => 5
 * ```
 */
export function getDistance(point1: Point, point2: Point): number {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 计算点到直线的距离
 * @param point - 点坐标
 * @param lineStart - 直线起点
 * @param lineEnd - 直线终点
 * @returns 点到直线的距离
 * 
 * @example
 * ```typescript
 * const distance = getDistanceToLine(
 *   { x: 0, y: 0 },
 *   { x: 0, y: 1 },
 *   { x: 1, y: 1 }
 * )
 * ```
 */
export function getDistanceToLine(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.x - lineStart.x
  const B = point.y - lineStart.y
  const C = lineEnd.x - lineStart.x
  const D = lineEnd.y - lineStart.y

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  
  if (lenSq === 0) {
    return getDistance(point, lineStart)
  }

  const param = dot / lenSq
  let xx: number, yy: number

  if (param < 0) {
    xx = lineStart.x
    yy = lineStart.y
  } else if (param > 1) {
    xx = lineEnd.x
    yy = lineEnd.y
  } else {
    xx = lineStart.x + param * C
    yy = lineStart.y + param * D
  }

  return getDistance(point, { x: xx, y: yy })
}

/**
 * 角度转弧度
 * @param degrees - 角度
 * @returns 弧度
 * 
 * @example
 * ```typescript
 * degreesToRadians(180) // => Math.PI
 * degreesToRadians(90) // => Math.PI / 2
 * ```
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * 弧度转角度
 * @param radians - 弧度
 * @returns 角度
 * 
 * @example
 * ```typescript
 * radiansToDegrees(Math.PI) // => 180
 * radiansToDegrees(Math.PI / 2) // => 90
 * ```
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * 限制数值在指定范围内
 * @param value - 要限制的值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的值
 * 
 * @example
 * ```typescript
 * clamp(15, 0, 10) // => 10
 * clamp(-5, 0, 10) // => 0
 * clamp(5, 0, 10) // => 5
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 线性插值
 * @param start - 起始值
 * @param end - 结束值
 * @param t - 插值参数 (0-1)
 * @returns 插值结果
 * 
 * @example
 * ```typescript
 * lerp(0, 10, 0.5) // => 5
 * lerp(0, 10, 0.2) // => 2
 * ```
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * 生成指定范围内的随机数
 * @param min - 最小值
 * @param max - 最大值
 * @returns 随机数
 * 
 * @example
 * ```typescript
 * random(1, 10) // => 1到10之间的随机数
 * random(0, 1) // => 0到1之间的随机数
 * ```
 */
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * 生成指定范围内的随机整数
 * @param min - 最小值
 * @param max - 最大值
 * @returns 随机整数
 * 
 * @example
 * ```typescript
 * randomInt(1, 10) // => 1到10之间的随机整数
 * randomInt(0, 100) // => 0到100之间的随机整数
 * ```
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 计算数组的平均值
 * @param numbers - 数字数组
 * @returns 平均值
 * 
 * @example
 * ```typescript
 * average([1, 2, 3, 4, 5]) // => 3
 * average([10, 20, 30]) // => 20
 * ```
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}

/**
 * 计算数组的中位数
 * @param numbers - 数字数组
 * @returns 中位数
 * 
 * @example
 * ```typescript
 * median([1, 2, 3, 4, 5]) // => 3
 * median([1, 2, 3, 4]) // => 2.5
 * ```
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0
  
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

/**
 * 计算数组的标准差
 * @param numbers - 数字数组
 * @returns 标准差
 * 
 * @example
 * ```typescript
 * standardDeviation([1, 2, 3, 4, 5]) // => 约1.58
 * ```
 */
export function standardDeviation(numbers: number[]): number {
  if (numbers.length === 0) return 0
  
  const avg = average(numbers)
  const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2))
  const avgSquaredDiff = average(squaredDiffs)
  
  return Math.sqrt(avgSquaredDiff)
}

/**
 * 计算最大公约数
 * @param a - 第一个数
 * @param b - 第二个数
 * @returns 最大公约数
 * 
 * @example
 * ```typescript
 * gcd(12, 8) // => 4
 * gcd(17, 13) // => 1
 * ```
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  
  while (b !== 0) {
    const temp = b
    b = a % b
    a = temp
  }
  
  return a
}

/**
 * 计算最小公倍数
 * @param a - 第一个数
 * @param b - 第二个数
 * @returns 最小公倍数
 * 
 * @example
 * ```typescript
 * lcm(12, 8) // => 24
 * lcm(3, 5) // => 15
 * ```
 */
export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

/**
 * 判断是否为质数
 * @param num - 要判断的数
 * @returns 是否为质数
 * 
 * @example
 * ```typescript
 * isPrime(7) // => true
 * isPrime(8) // => false
 * isPrime(2) // => true
 * ```
 */
export function isPrime(num: number): boolean {
  if (num < 2) return false
  if (num === 2) return true
  if (num % 2 === 0) return false
  
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false
  }
  
  return true
}

/**
 * 计算阶乘
 * @param n - 要计算阶乘的数
 * @returns 阶乘结果
 * 
 * @example
 * ```typescript
 * factorial(5) // => 120
 * factorial(0) // => 1
 * ```
 */
export function factorial(n: number): number {
  if (n < 0) return 0
  if (n === 0 || n === 1) return 1
  
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  
  return result
}

/**
 * 计算斐波那契数列第n项
 * @param n - 项数
 * @returns 斐波那契数
 * 
 * @example
 * ```typescript
 * fibonacci(10) // => 55
 * fibonacci(0) // => 0
 * fibonacci(1) // => 1
 * ```
 */
export function fibonacci(n: number): number {
  if (n < 0) return 0
  if (n === 0) return 0
  if (n === 1) return 1
  
  let a = 0, b = 1
  for (let i = 2; i <= n; i++) {
    const temp = a + b
    a = b
    b = temp
  }
  
  return b
}
