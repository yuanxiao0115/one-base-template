/**
 * 验证工具函数
 * @description 提供各种数据验证功能
 */

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 是否为有效邮箱
 *
 * @example
 * ```typescript
 * isEmail('test@example.com') // => true
 * isEmail('invalid-email') // => false
 * ```
 */
export function isEmail(email: string): boolean {
  // 使用更严格的邮箱验证规则
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式（中国大陆）
 * @param phone - 手机号
 * @returns 是否为有效手机号
 *
 * @example
 * ```typescript
 * isPhone('13812345678') // => true
 * isPhone('12345678901') // => false
 * ```
 */
export function isPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证身份证号格式（中国大陆）
 * @param idCard - 身份证号
 * @returns 是否为有效身份证号
 *
 * @example
 * ```typescript
 * isIdCard('110101199003077777') // => true
 * isIdCard('123456789012345678') // => false
 * ```
 */
export function isIdCard(idCard: string): boolean {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(idCard)
}

/**
 * 验证URL格式
 * @param url - URL地址
 * @returns 是否为有效URL
 *
 * @example
 * ```typescript
 * isUrl('https://example.com') // => true
 * isUrl('not-a-url') // => false
 * ```
 */
export function isUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证IP地址格式
 * @param ip - IP地址
 * @returns 是否为有效IP地址
 *
 * @example
 * ```typescript
 * isIP('192.168.1.1') // => true
 * isIP('256.256.256.256') // => false
 * ```
 */
export function isIP(ip: string): boolean {
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipRegex.test(ip)
}

/**
 * 验证密码强度
 * @param password - 密码
 * @param options - 验证选项
 * @returns 验证结果
 *
 * @example
 * ```typescript
 * validatePassword('Abc123!@#')
 * // => { isValid: true, strength: 'strong', score: 4 }
 *
 * validatePassword('123456')
 * // => { isValid: false, strength: 'weak', score: 1, errors: [...] }
 * ```
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
  } = {},
): {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  score: number
  errors: string[]
} {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options

  const errors: string[] = []
  let score = 0

  // 长度检查
  if (password.length < minLength) {
    errors.push(`密码长度至少${minLength}位`)
  } else {
    score++
  }

  // 大写字母检查
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母')
  } else if (/[A-Z]/.test(password)) {
    score++
  }

  // 小写字母检查
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母')
  } else if (/[a-z]/.test(password)) {
    score++
  }

  // 数字检查
  if (requireNumbers && !/\d/.test(password)) {
    errors.push('密码必须包含数字')
  } else if (/\d/.test(password)) {
    score++
  }

  // 特殊字符检查
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含特殊字符')
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++
  }

  // 强度评估
  let strength: 'weak' | 'medium' | 'strong'
  if (score <= 2) {
    strength = 'weak'
  } else if (score <= 3) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }

  return {
    isValid: errors.length === 0,
    strength,
    score,
    errors,
  }
}

/**
 * 验证银行卡号
 * @param cardNumber - 银行卡号
 * @returns 是否为有效银行卡号
 *
 * @example
 * ```typescript
 * isBankCard('6222600260001072444') // => true
 * isBankCard('123456789') // => false
 * ```
 */
export function isBankCard(cardNumber: string): boolean {
  // 移除空格和连字符
  const cleanNumber = cardNumber.replace(/[\s-]/g, '')

  // 长度检查（一般为16-19位）
  if (!/^\d{16,19}$/.test(cleanNumber)) {
    return false
  }

  // Luhn算法验证
  let sum = 0
  let isEven = false

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * 验证中文姓名
 * @param name - 姓名
 * @returns 是否为有效中文姓名
 *
 * @example
 * ```typescript
 * isChineseName('张三') // => true
 * isChineseName('John') // => false
 * ```
 */
export function isChineseName(name: string): boolean {
  const chineseNameRegex = /^[\u4e00-\u9fa5]{2,4}$/
  return chineseNameRegex.test(name)
}

/**
 * 验证车牌号
 * @param plateNumber - 车牌号
 * @returns 是否为有效车牌号
 *
 * @example
 * ```typescript
 * isPlateNumber('京A12345') // => true
 * isPlateNumber('ABC123') // => false
 * ```
 */
export function isPlateNumber(plateNumber: string): boolean {
  // 普通车牌号
  const normalPlate =
    /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{4}[A-Z0-9挂学警港澳]$/
  // 新能源车牌号
  const newEnergyPlate =
    /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5}$/

  return normalPlate.test(plateNumber) || newEnergyPlate.test(plateNumber)
}

/**
 * 验证QQ号
 * @param qq - QQ号
 * @returns 是否为有效QQ号
 *
 * @example
 * ```typescript
 * isQQ('123456789') // => true
 * isQQ('12345') // => false
 * ```
 */
export function isQQ(qq: string): boolean {
  const qqRegex = /^[1-9][0-9]{4,10}$/
  return qqRegex.test(qq)
}

/**
 * 验证微信号
 * @param wechat - 微信号
 * @returns 是否为有效微信号
 *
 * @example
 * ```typescript
 * isWechat('wechat_123') // => true
 * isWechat('wx') // => false
 * ```
 */
export function isWechat(wechat: string): boolean {
  const wechatRegex = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/
  return wechatRegex.test(wechat)
}

/**
 * 验证数字范围
 * @param value - 数值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 是否在范围内
 *
 * @example
 * ```typescript
 * isInRange(5, 1, 10) // => true
 * isInRange(15, 1, 10) // => false
 * ```
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * 验证字符串长度范围
 * @param str - 字符串
 * @param min - 最小长度
 * @param max - 最大长度
 * @returns 是否在长度范围内
 *
 * @example
 * ```typescript
 * isLengthInRange('hello', 3, 10) // => true
 * isLengthInRange('hi', 3, 10) // => false
 * ```
 */
export function isLengthInRange(str: string, min: number, max: number): boolean {
  return str.length >= min && str.length <= max
}

/**
 * 验证是否为空值
 * @param value - 要验证的值
 * @returns 是否为空
 *
 * @example
 * ```typescript
 * isEmpty('') // => true
 * isEmpty(null) // => true
 * isEmpty(undefined) // => true
 * isEmpty([]) // => true
 * isEmpty({}) // => true
 * isEmpty('hello') // => false
 * ```
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 验证是否为数字
 * @param value - 要验证的值
 * @returns 是否为数字
 *
 * @example
 * ```typescript
 * isNumber('123') // => true
 * isNumber('123.45') // => true
 * isNumber('abc') // => false
 * ```
 */
export function isNumber(value: any): boolean {
  return !isNaN(Number(value)) && isFinite(Number(value))
}

/**
 * 验证是否为整数
 * @param value - 要验证的值
 * @returns 是否为整数
 *
 * @example
 * ```typescript
 * isInteger('123') // => true
 * isInteger('123.45') // => false
 * ```
 */
export function isInteger(value: any): boolean {
  return isNumber(value) && Number.isInteger(Number(value))
}

/**
 * 验证是否为正数
 * @param value - 要验证的值
 * @returns 是否为正数
 *
 * @example
 * ```typescript
 * isPositive('123') // => true
 * isPositive('-123') // => false
 * ```
 */
export function isPositive(value: any): boolean {
  return isNumber(value) && Number(value) > 0
}

// ============ 从validate模块合并的验证规则 ============

/**
 * 验证规则类型
 */
export interface ValidationRule {
  required?: boolean
  message?: string
  validator?: (value: any, formData?: any) => boolean | string
  trigger?: 'blur' | 'change'
}

/**
 * 必填验证
 * @param message - 错误信息
 * @returns 验证规则
 */
export function required(message: string = '此字段为必填项'): ValidationRule {
  return {
    required: true,
    message,
    trigger: 'blur',
  }
}

/**
 * 邮箱验证规则
 * @param message - 错误信息
 * @returns 验证规则
 */
export function emailRule(message: string = '请输入正确的邮箱地址'): ValidationRule {
  return {
    validator: (value: string) => {
      if (!value) return true
      return isEmail(value) || message
    },
    trigger: 'blur',
  }
}

/**
 * 手机号验证规则
 * @param message - 错误信息
 * @returns 验证规则
 */
export function phoneRule(message: string = '请输入正确的手机号'): ValidationRule {
  return {
    validator: (value: string) => {
      if (!value) return true
      return isPhone(value) || message
    },
    trigger: 'blur',
  }
}

/**
 * 身份证验证规则
 * @param message - 错误信息
 * @returns 验证规则
 */
export function idCardRule(message: string = '请输入正确的身份证号'): ValidationRule {
  return {
    validator: (value: string) => {
      if (!value) return true
      return isIdCard(value) || message
    },
    trigger: 'blur',
  }
}

/**
 * URL验证规则
 * @param message - 错误信息
 * @returns 验证规则
 */
export function urlRule(message: string = '请输入正确的URL地址'): ValidationRule {
  return {
    validator: (value: string) => {
      if (!value) return true
      return isUrl(value) || message
    },
    trigger: 'blur',
  }
}

/**
 * 长度验证规则
 * @param min - 最小长度
 * @param max - 最大长度
 * @param message - 错误信息
 * @returns 验证规则
 */
export function lengthRule(min: number, max: number, message?: string): ValidationRule {
  const defaultMessage = `长度应在 ${min} 到 ${max} 个字符之间`

  return {
    validator: (value: string) => {
      if (!value) return true
      return isLengthInRange(value, min, max) || message || defaultMessage
    },
    trigger: 'blur',
  }
}

/**
 * 数字范围验证规则
 * @param min - 最小值
 * @param max - 最大值
 * @param message - 错误信息
 * @returns 验证规则
 */
export function rangeRule(min: number, max: number, message?: string): ValidationRule {
  const defaultMessage = `数值应在 ${min} 到 ${max} 之间`

  return {
    validator: (value: number) => {
      if (value === null || value === undefined) return true
      return isInRange(Number(value), min, max) || message || defaultMessage
    },
    trigger: 'blur',
  }
}

/**
 * 密码强度验证规则
 * @param options - 验证选项
 * @returns 验证规则
 */
export function passwordRule(options?: {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSpecialChars?: boolean
}): ValidationRule {
  return {
    validator: (value: string) => {
      if (!value) return true
      const result = validatePassword(value, options)
      return result.isValid || result.errors.join(', ')
    },
    trigger: 'blur',
  }
}

/**
 * 自定义正则验证规则
 * @param pattern - 正则表达式
 * @param message - 错误信息
 * @returns 验证规则
 */
export function patternRule(pattern: RegExp, message: string): ValidationRule {
  return {
    validator: (value: string) => {
      if (!value) return true
      return pattern.test(value) || message
    },
    trigger: 'blur',
  }
}

/**
 * 确认密码验证规则
 * @param passwordField - 密码字段名
 * @param message - 错误信息
 * @returns 验证规则
 */
export function confirmPasswordRule(
  passwordField: string,
  message: string = '两次输入的密码不一致',
): ValidationRule {
  return {
    validator: (value: string, formData: any) => {
      if (!value) return true
      return value === formData[passwordField] || message
    },
    trigger: 'blur',
  }
}

/**
 * 生成随机密码（从admin迁移）
 * @param length - 密码长度，默认12位
 * @param options - 密码选项
 * @returns 随机密码
 *
 * @example
 * ```typescript
 * generateRandomPassword() // => 'Abc123!@#def'
 * generateRandomPassword(8, { includeSymbols: false }) // => 'Abc12345'
 * ```
 */
export function generateRandomPassword(
  length: number = 12,
  options: {
    includeUppercase?: boolean
    includeLowercase?: boolean
    includeNumbers?: boolean
    includeSymbols?: boolean
    excludeSimilar?: boolean
  } = {},
): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = false,
  } = options

  let charset = ''

  if (includeUppercase) {
    charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  }

  if (includeLowercase) {
    charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
  }

  if (includeNumbers) {
    charset += excludeSimilar ? '23456789' : '0123456789'
  }

  if (includeSymbols) {
    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  }

  if (!charset) {
    throw new Error('至少需要选择一种字符类型')
  }

  let password = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  return password
}

/**
 * 检查密码强度
 * @param password - 密码
 * @returns 密码强度信息
 *
 * @example
 * ```typescript
 * checkPasswordStrength('123456') // => { score: 1, level: 'weak' }
 * checkPasswordStrength('Abc123!@#') // => { score: 4, level: 'strong' }
 * ```
 */
export function checkPasswordStrength(password: string): {
  score: number
  level: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  if (!password) {
    return { score: 0, level: 'very-weak', feedback: ['密码不能为空'] }
  }

  // 长度检查
  if (password.length >= 8) score += 1
  else feedback.push('密码长度至少8位')

  if (password.length >= 12) score += 1
  else if (password.length >= 8) feedback.push('建议密码长度12位以上')

  // 字符类型检查
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('建议包含小写字母')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('建议包含大写字母')

  if (/[0-9]/.test(password)) score += 1
  else feedback.push('建议包含数字')

  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push('建议包含特殊字符')

  // 复杂度检查
  if (!/(.)\1{2,}/.test(password)) score += 1
  else feedback.push('避免连续重复字符')

  const levels: Array<'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'> = [
    'very-weak',
    'weak',
    'medium',
    'strong',
    'very-strong',
  ]

  const levelIndex = Math.min(Math.floor(score / 1.5), levels.length - 1)

  return {
    score,
    level: levels[levelIndex],
    feedback,
  }
}

/**
 * 生成验证码
 * @param length - 验证码长度
 * @param type - 验证码类型
 * @returns 验证码
 *
 * @example
 * ```typescript
 * generateVerificationCode(6, 'number') // => '123456'
 * generateVerificationCode(4, 'letter') // => 'ABCD'
 * generateVerificationCode(6, 'mixed') // => 'A1B2C3'
 * ```
 */
export function generateVerificationCode(
  length: number = 6,
  type: 'number' | 'letter' | 'mixed' = 'number',
): string {
  let charset = ''

  switch (type) {
    case 'number':
      charset = '0123456789'
      break
    case 'letter':
      charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      break
    case 'mixed':
      charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      break
  }

  let code = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    code += charset[randomIndex]
  }

  return code
}

/**
 * 验证验证码
 * @param inputCode - 输入的验证码
 * @param correctCode - 正确的验证码
 * @param ignoreCase - 是否忽略大小写
 * @returns 是否验证通过
 *
 * @example
 * ```typescript
 * verifyCode('1234', '1234') // => true
 * verifyCode('abcd', 'ABCD', true) // => true
 * verifyCode('abcd', 'ABCD', false) // => false
 * ```
 */
export function verifyCode(
  inputCode: string,
  correctCode: string,
  ignoreCase: boolean = true,
): boolean {
  if (!inputCode || !correctCode) return false

  if (ignoreCase) {
    return inputCode.toLowerCase() === correctCode.toLowerCase()
  }

  return inputCode === correctCode
}
