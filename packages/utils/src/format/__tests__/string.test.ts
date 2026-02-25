import { describe, it, expect } from 'vitest'
import {
  formatPhone,
  formatIdCard,
  formatBankCard,
  formatPhoneWithSeparator,
  formatIdCardWithSeparator,
  formatBankCardWithSeparator,
  hideSensitive,
  capitalize,
  toCamelCase,
  toPascalCase,
  toKebabCase,
  toSnakeCase,
  truncate,
} from '../string'

describe('formatPhone', () => {
  it('should mask middle 4 digits of phone number', () => {
    expect(formatPhone('13812345678')).toBe('138****5678')
    expect(formatPhone('15912345678')).toBe('159****5678')
  })

  it('should handle invalid input', () => {
    expect(formatPhone('1234')).toBe('1234')
    expect(formatPhone('')).toBe('')
  })
})

describe('formatIdCard', () => {
  it('should mask middle 8 digits of ID card', () => {
    expect(formatIdCard('110101199001011234')).toBe('110101********1234')
    expect(formatIdCard('310101199001011234')).toBe('310101********1234')
  })

  it('should handle invalid input', () => {
    expect(formatIdCard('1234')).toBe('1234')
    expect(formatIdCard('')).toBe('')
  })
})

describe('formatBankCard', () => {
  it('should mask middle digits of bank card', () => {
    expect(formatBankCard('6222021234567890123')).toBe('6222 **** **** 0123')
    expect(formatBankCard('6222021234567890')).toBe('6222 **** **** 7890')
  })

  it('should handle invalid input', () => {
    expect(formatBankCard('1234')).toBe('1234')
    expect(formatBankCard('')).toBe('')
  })
})

describe('formatPhoneWithSeparator', () => {
  it('should format phone with default space separator', () => {
    expect(formatPhoneWithSeparator('13812345678')).toBe('138 1234 5678')
  })

  it('should format phone with custom separator', () => {
    expect(formatPhoneWithSeparator('13812345678', '-')).toBe('138-1234-5678')
    expect(formatPhoneWithSeparator('13812345678', '.')).toBe('138.1234.5678')
  })

  it('should handle invalid input', () => {
    expect(formatPhoneWithSeparator('1234')).toBe('1234')
    expect(formatPhoneWithSeparator('')).toBe('')
  })

  it('should clean non-digit characters', () => {
    expect(formatPhoneWithSeparator('138-1234-5678')).toBe('138 1234 5678')
  })
})

describe('formatIdCardWithSeparator', () => {
  it('should format 18-digit ID card with default space separator', () => {
    expect(formatIdCardWithSeparator('110101199001011234')).toBe('110101 19900101 1234')
  })

  it('should format 15-digit ID card', () => {
    expect(formatIdCardWithSeparator('110101900101123')).toBe('110101 900101 123')
  })

  it('should format with custom separator', () => {
    expect(formatIdCardWithSeparator('110101199001011234', '-')).toBe('110101-19900101-1234')
  })

  it('should handle invalid input', () => {
    expect(formatIdCardWithSeparator('1234')).toBe('1234')
    expect(formatIdCardWithSeparator('')).toBe('')
  })
})

describe('formatBankCardWithSeparator', () => {
  it('should format bank card with default space separator', () => {
    expect(formatBankCardWithSeparator('6222600260001072444')).toBe('6222 6002 6000 1072 444')
  })

  it('should format with custom separator', () => {
    expect(formatBankCardWithSeparator('6222600260001072444', '-')).toBe('6222-6002-6000-1072-444')
  })

  it('should handle spaces in input', () => {
    expect(formatBankCardWithSeparator('6222 6002 6000 1072 444')).toBe('6222 6002 6000 1072 444')
  })
})

describe('hideSensitive', () => {
  it('should hide sensitive info with default parameters', () => {
    expect(hideSensitive('13812345678')).toBe('138****5678')
  })

  it('should support custom start and end positions', () => {
    expect(hideSensitive('张三丰', 1, 0)).toBe('张**')
    expect(hideSensitive('李小明', 1, 1)).toBe('李*明')
  })

  it('should support custom mask character', () => {
    expect(hideSensitive('13812345678', 3, 4, '#')).toBe('138####5678')
  })

  it('should handle short strings', () => {
    expect(hideSensitive('123', 3, 4)).toBe('123')
    expect(hideSensitive('', 3, 4)).toBe('')
  })
})

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello world')).toBe('Hello world')
    expect(capitalize('HELLO WORLD')).toBe('Hello world')
    expect(capitalize('hELLO wORLD')).toBe('Hello world')
  })

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A')
    expect(capitalize('A')).toBe('A')
  })
})

describe('toCamelCase', () => {
  it('should convert kebab-case to camelCase', () => {
    expect(toCamelCase('hello-world')).toBe('helloWorld')
    expect(toCamelCase('my-awesome-function')).toBe('myAwesomeFunction')
  })

  it('should handle custom separator', () => {
    expect(toCamelCase('hello_world', '_')).toBe('helloWorld')
    expect(toCamelCase('hello.world', '.')).toBe('helloWorld')
  })

  it('should handle single word', () => {
    expect(toCamelCase('hello')).toBe('hello')
  })

  it('should handle empty string', () => {
    expect(toCamelCase('')).toBe('')
  })
})

describe('toPascalCase', () => {
  it('should convert kebab-case to PascalCase', () => {
    expect(toPascalCase('hello-world')).toBe('HelloWorld')
    expect(toPascalCase('my-awesome-function')).toBe('MyAwesomeFunction')
  })

  it('should handle custom separator', () => {
    expect(toPascalCase('hello_world', '_')).toBe('HelloWorld')
    expect(toPascalCase('hello.world', '.')).toBe('HelloWorld')
  })

  it('should handle single word', () => {
    expect(toPascalCase('hello')).toBe('Hello')
  })
})

describe('toKebabCase', () => {
  it('should convert camelCase to kebab-case', () => {
    expect(toKebabCase('helloWorld')).toBe('hello-world')
    expect(toKebabCase('myAwesomeFunction')).toBe('my-awesome-function')
  })

  it('should convert PascalCase to kebab-case', () => {
    expect(toKebabCase('HelloWorld')).toBe('hello-world')
    expect(toKebabCase('MyAwesomeFunction')).toBe('my-awesome-function')
  })

  it('should handle single word', () => {
    expect(toKebabCase('hello')).toBe('hello')
    expect(toKebabCase('Hello')).toBe('hello')
  })
})

describe('toSnakeCase', () => {
  it('should convert camelCase to snake_case', () => {
    expect(toSnakeCase('helloWorld')).toBe('hello_world')
    expect(toSnakeCase('myAwesomeFunction')).toBe('my_awesome_function')
  })

  it('should convert PascalCase to snake_case', () => {
    expect(toSnakeCase('HelloWorld')).toBe('hello_world')
    expect(toSnakeCase('MyAwesomeFunction')).toBe('my_awesome_function')
  })

  it('should handle single word', () => {
    expect(toSnakeCase('hello')).toBe('hello')
    expect(toSnakeCase('Hello')).toBe('hello')
  })
})

describe('truncate', () => {
  it('should truncate text with default suffix', () => {
    expect(truncate('这是一段很长的文本', 8)).toBe('这是一段很长的文...')
    expect(truncate('Hello World', 5)).toBe('Hello...')
  })

  it('should support custom suffix', () => {
    expect(truncate('这是一段很长的文本', 8, '***')).toBe('这是一段很长的文***')
    expect(truncate('Hello World', 5, '---')).toBe('Hello---')
  })

  it('should not truncate short text', () => {
    expect(truncate('短文本', 10)).toBe('短文本')
    expect(truncate('Hello', 10)).toBe('Hello')
  })

  it('should handle empty string', () => {
    expect(truncate('', 10)).toBe('')
  })
})
