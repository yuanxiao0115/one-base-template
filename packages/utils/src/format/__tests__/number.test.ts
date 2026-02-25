import { describe, it, expect } from 'vitest'
import {
  formatAmount,
  formatFileSize,
  formatNumber,
  formatCurrency,
  formatPercentage,
  numberToChinese,
  formatCountdown,
} from '../number'

describe('formatAmount', () => {
  it('should format number with commas and 2 decimal places', () => {
    expect(formatAmount(1234.5678)).toBe('1,234.57')
    expect(formatAmount(1000000)).toBe('1,000,000.00')
    expect(formatAmount(0)).toBe('0.00')
  })

  it('should handle string input', () => {
    expect(formatAmount('1234.5678')).toBe('1,234.57')
    expect(formatAmount('1000000')).toBe('1,000,000.00')
  })

  it('should handle invalid input', () => {
    expect(formatAmount('abc')).toBe('0')
    expect(formatAmount(NaN)).toBe('0')
  })

  it('should support custom decimal places', () => {
    expect(formatAmount(1234.5678, 3)).toBe('1,234.568')
    expect(formatAmount(1000000, 0)).toBe('1,000,000')
  })
})

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes')
  })

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(2048)).toBe('2 KB')
  })

  it('should format megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB')
  })

  it('should format gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB')
  })

  it('should handle zero size', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
  })

  it('should support custom decimal places', () => {
    expect(formatFileSize(1536, 0)).toBe('2 KB')
    expect(formatFileSize(1536, 3)).toBe('1.5 KB')
  })
})

describe('formatNumber', () => {
  it('should format number with default comma separator', () => {
    expect(formatNumber(1234567.89)).toBe('1,234,567.89')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('should handle string input', () => {
    expect(formatNumber('1234567.89')).toBe('1,234,567.89')
  })

  it('should handle invalid input', () => {
    expect(formatNumber('abc')).toBe('0')
    expect(formatNumber(NaN)).toBe('0')
  })

  it('should support custom decimal places', () => {
    expect(formatNumber(1234567.89, 0)).toBe('1,234,568')
    expect(formatNumber(1234567.89, 3)).toBe('1,234,567.890')
  })

  it('should support custom separator', () => {
    expect(formatNumber(1234567.89, 2, ' ')).toBe('1 234 567.89')
    expect(formatNumber(1234567.89, 2, '.')).toBe('1.234.567.89')
  })
})

describe('formatCurrency', () => {
  it('should format currency with default yuan symbol', () => {
    expect(formatCurrency(1234.56)).toBe('¥1,234.56')
  })

  it('should support custom currency symbol', () => {
    expect(formatCurrency(1234.56, '$')).toBe('$1,234.56')
    expect(formatCurrency(1234.56, '€')).toBe('€1,234.56')
  })

  it('should support custom decimal places', () => {
    expect(formatCurrency(1234.56, '¥', 0)).toBe('¥1,235')
    expect(formatCurrency(1234.56, '$', 3)).toBe('$1,234.560')
  })

  it('should handle string input', () => {
    expect(formatCurrency('1234.56')).toBe('¥1,234.56')
  })
})

describe('formatPercentage', () => {
  it('should format decimal percentage', () => {
    expect(formatPercentage(0.1234)).toBe('12.34%')
    expect(formatPercentage(0.5)).toBe('50.00%')
    expect(formatPercentage(1)).toBe('100.00%')
  })

  it('should format non-decimal percentage', () => {
    expect(formatPercentage(12.34, 2, false)).toBe('12.34%')
    expect(formatPercentage(50, 1, false)).toBe('50.0%')
  })

  it('should support custom decimal places', () => {
    expect(formatPercentage(0.1234, 1)).toBe('12.3%')
    expect(formatPercentage(0.1234, 0)).toBe('12%')
  })

  it('should handle string input', () => {
    expect(formatPercentage('0.1234')).toBe('12.34%')
  })

  it('should handle invalid input', () => {
    expect(formatPercentage('abc')).toBe('0%')
    expect(formatPercentage(NaN)).toBe('0%')
  })
})

describe('numberToChinese', () => {
  it('should convert single digits', () => {
    expect(numberToChinese(0)).toBe('零')
    expect(numberToChinese(1)).toBe('一')
    expect(numberToChinese(5)).toBe('五')
    expect(numberToChinese(9)).toBe('九')
  })

  it('should convert tens', () => {
    expect(numberToChinese(10)).toBe('一十')
    expect(numberToChinese(20)).toBe('二十')
    expect(numberToChinese(99)).toBe('九十九')
  })

  it('should convert hundreds', () => {
    expect(numberToChinese(100)).toBe('一百')
    expect(numberToChinese(123)).toBe('一百二十三')
    expect(numberToChinese(500)).toBe('五百')
  })

  it('should convert thousands', () => {
    expect(numberToChinese(1000)).toBe('一千')
    expect(numberToChinese(1234)).toBe('一千二百三十四')
    expect(numberToChinese(5000)).toBe('五千')
  })

  it('should handle negative numbers', () => {
    expect(numberToChinese(-1)).toBe('负一')
    expect(numberToChinese(-123)).toBe('负一百二十三')
  })

  it('should handle numbers with zeros', () => {
    expect(numberToChinese(101)).toBe('一百零一')
    expect(numberToChinese(1001)).toBe('一千零一')
  })
})

describe('formatCountdown', () => {
  it('should format seconds only', () => {
    expect(formatCountdown(30)).toBe('00:30')
    expect(formatCountdown(59)).toBe('00:59')
  })

  it('should format minutes and seconds', () => {
    expect(formatCountdown(61)).toBe('01:01')
    expect(formatCountdown(125)).toBe('02:05')
    expect(formatCountdown(3599)).toBe('59:59')
  })

  it('should format hours, minutes and seconds', () => {
    expect(formatCountdown(3600)).toBe('01:00:00')
    expect(formatCountdown(3661)).toBe('01:01:01')
    expect(formatCountdown(7323)).toBe('02:02:03')
  })

  it('should handle zero', () => {
    expect(formatCountdown(0)).toBe('00:00')
  })
})
