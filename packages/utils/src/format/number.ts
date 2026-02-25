/**
 * 格式化金额
 * @param amount 金额
 * @param decimals 小数位数
 */
export function formatAmount(amount: number | string, decimals = 2): string {
  const num = Number(amount)
  if (isNaN(num)) return '0'
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化数字，添加千分位分隔符
 * @param num - 数字
 * @param decimals - 小数位数
 * @param separator - 千分位分隔符
 * @returns 格式化后的数字字符串
 *
 * @example
 * ```typescript
 * formatNumber(1234567.89) // => '1,234,567.89'
 * formatNumber(1234567.89, 2) // => '1,234,567.89'
 * formatNumber(1234567.89, 0) // => '1,234,568'
 * ```
 */
export function formatNumber(
  num: number | string,
  decimals?: number,
  separator: string = ','
): string {
  const number = Number(num)
  if (isNaN(number)) return '0'

  const result = decimals !== undefined ? number.toFixed(decimals) : number.toString()

  // 添加千分位分隔符
  const parts = result.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)

  return parts.join('.')
}

/**
 * 格式化货币
 * @param amount - 金额
 * @param currency - 货币符号
 * @param decimals - 小数位数
 * @returns 格式化后的货币字符串
 *
 * @example
 * ```typescript
 * formatCurrency(1234.56) // => '¥1,234.56'
 * formatCurrency(1234.56, '$') // => '$1,234.56'
 * formatCurrency(1234.56, '¥', 0) // => '¥1,235'
 * ```
 */
export function formatCurrency(
  amount: number | string,
  currency: string = '¥',
  decimals: number = 2
): string {
  const formattedNumber = formatNumber(amount, decimals)
  return `${currency}${formattedNumber}`
}

/**
 * 格式化百分比
 * @param value - 数值（0-1之间或0-100之间）
 * @param decimals - 小数位数
 * @param isDecimal - 是否为小数形式（0-1之间）
 * @returns 格式化后的百分比字符串
 *
 * @example
 * ```typescript
 * formatPercentage(0.1234) // => '12.34%'
 * formatPercentage(12.34, 1, false) // => '12.3%'
 * ```
 */
export function formatPercentage(
  value: number | string,
  decimals: number = 2,
  isDecimal: boolean = true
): string {
  const num = Number(value)
  if (isNaN(num)) return '0%'

  const percentage = isDecimal ? num * 100 : num
  return `${percentage.toFixed(decimals)}%`
}

/**
 * 格式化文件大小
 * @param size 文件大小（字节）
 * @param decimals 小数位数
 */
export function formatFileSize(size: number, decimals: number = 2): string {
  if (size === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(size) / Math.log(k))

  return parseFloat((size / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 数字转中文
 * @param num - 数字
 * @returns 中文数字
 *
 * @example
 * ```typescript
 * numberToChinese(123) // => '一百二十三'
 * numberToChinese(1000) // => '一千'
 * ```
 */
export function numberToChinese(num: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['', '十', '百', '千', '万', '十万', '百万', '千万', '亿']

  if (num === 0) return '零'
  if (num < 0) return '负' + numberToChinese(-num)

  let result = ''
  let unitIndex = 0

  while (num > 0) {
    const digit = num % 10
    if (digit !== 0) {
      result = digits[digit] + units[unitIndex] + result
    } else if (result && !result.startsWith('零')) {
      result = '零' + result
    }
    num = Math.floor(num / 10)
    unitIndex++
  }

  return result
}

/**
 * 格式化倒计时
 * @param seconds - 秒数
 * @returns 格式化的时间字符串
 *
 * @example
 * ```typescript
 * formatCountdown(3661) // => '01:01:01'
 * formatCountdown(61) // => '01:01'
 * ```
 */
export function formatCountdown(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
