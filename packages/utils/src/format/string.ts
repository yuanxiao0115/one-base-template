/**
 * 格式化手机号（隐藏中间4位）
 * @param phone 手机号
 */
export function formatPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化手机号（添加分隔符）
 * @param phone - 手机号
 * @param separator - 分隔符
 * @returns 格式化后的手机号
 *
 * @example
 * ```typescript
 * formatPhoneWithSeparator('13812345678') // => '138 1234 5678'
 * formatPhoneWithSeparator('13812345678', '-') // => '138-1234-5678'
 * ```
 */
export function formatPhoneWithSeparator(phone: string, separator: string = ' '): string {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, `$1${separator}$2${separator}$3`)
  }

  return phone
}

/**
 * 格式化身份证号（隐藏中间8位）
 * @param idCard 身份证号
 */
export function formatIdCard(idCard: string): string {
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

/**
 * 格式化身份证号（添加分隔符）
 * @param idCard - 身份证号
 * @param separator - 分隔符
 * @returns 格式化后的身份证号
 *
 * @example
 * ```typescript
 * formatIdCardWithSeparator('110101199001011234') // => '110101 19900101 1234'
 * formatIdCardWithSeparator('110101199001011234', '-') // => '110101-19900101-1234'
 * ```
 */
export function formatIdCardWithSeparator(idCard: string, separator: string = ' '): string {
  const cleaned = idCard.replace(/\s/g, '')

  if (cleaned.length === 18) {
    return cleaned.replace(/(\d{6})(\d{8})(\d{4})/, `$1${separator}$2${separator}$3`)
  } else if (cleaned.length === 15) {
    return cleaned.replace(/(\d{6})(\d{6})(\d{3})/, `$1${separator}$2${separator}$3`)
  }

  return idCard
}

/**
 * 格式化银行卡号（隐藏中间数字）
 * @param cardNo 银行卡号
 */
export function formatBankCard(cardNo: string): string {
  return cardNo.replace(/(\d{4})\d+(\d{4})$/, '$1 **** **** $2')
}

/**
 * 格式化银行卡号（添加分隔符）
 * @param cardNumber - 银行卡号
 * @param separator - 分隔符
 * @returns 格式化后的银行卡号
 *
 * @example
 * ```typescript
 * formatBankCardWithSeparator('6222600260001072444') // => '6222 6002 6000 1072 444'
 * formatBankCardWithSeparator('6222600260001072444', '-') // => '6222-6002-6000-1072-444'
 * ```
 */
export function formatBankCardWithSeparator(cardNumber: string, separator: string = ' '): string {
  const cleaned = cardNumber.replace(/\s/g, '')
  return cleaned.replace(/(\d{4})/g, `$1${separator}`).trim()
}

/**
 * 隐藏敏感信息
 * @param str - 原始字符串
 * @param start - 开始保留的字符数
 * @param end - 结束保留的字符数
 * @param mask - 遮罩字符
 * @returns 隐藏后的字符串
 *
 * @example
 * ```typescript
 * hideSensitive('13812345678', 3, 4) // => '138****5678'
 * hideSensitive('张三', 1, 0) // => '张*'
 * ```
 */
export function hideSensitive(
  str: string,
  start: number = 3,
  end: number = 4,
  mask: string = '*',
): string {
  if (!str || str.length <= start + end) {
    return str
  }

  const startStr = str.slice(0, start)
  const endStr = end > 0 ? str.slice(-end) : ''
  const maskStr = mask.repeat(str.length - start - end)

  return startStr + maskStr + endStr
}

/**
 * 首字母大写
 * @param str - 字符串
 * @returns 首字母大写的字符串
 *
 * @example
 * ```typescript
 * capitalize('hello world') // => 'Hello world'
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 驼峰命名转换
 * @param str - 字符串
 * @param separator - 分隔符
 * @returns 驼峰命名的字符串
 *
 * @example
 * ```typescript
 * toCamelCase('hello-world') // => 'helloWorld'
 * toCamelCase('hello_world', '_') // => 'helloWorld'
 * ```
 */
export function toCamelCase(str: string, separator: string = '-'): string {
  return str
    .split(separator)
    .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
    .join('')
}

/**
 * 帕斯卡命名转换
 * @param str - 字符串
 * @param separator - 分隔符
 * @returns 帕斯卡命名的字符串
 *
 * @example
 * ```typescript
 * toPascalCase('hello-world') // => 'HelloWorld'
 * ```
 */
export function toPascalCase(str: string, separator: string = '-'): string {
  return str
    .split(separator)
    .map((word) => capitalize(word))
    .join('')
}

/**
 * 短横线命名转换
 * @param str - 字符串
 * @returns 短横线命名的字符串
 *
 * @example
 * ```typescript
 * toKebabCase('helloWorld') // => 'hello-world'
 * toKebabCase('HelloWorld') // => 'hello-world'
 * ```
 */
export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 下划线命名转换
 * @param str - 字符串
 * @returns 下划线命名的字符串
 *
 * @example
 * ```typescript
 * toSnakeCase('helloWorld') // => 'hello_world'
 * toSnakeCase('HelloWorld') // => 'hello_world'
 * ```
 */
export function toSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

/**
 * 截断文本
 * @param text - 文本
 * @param length - 最大长度
 * @param suffix - 后缀
 * @returns 截断后的文本
 *
 * @example
 * ```typescript
 * truncate('这是一段很长的文本', 10) // => '这是一段很长的文...'
 * truncate('这是一段很长的文本', 10, '***') // => '这是一段很长的文***'
 * ```
 */
export function truncate(text: string, length: number, suffix: string = '...'): string {
  if (text.length <= length) return text
  return text.slice(0, length) + suffix
}
