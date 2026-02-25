import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import {
  formatDate,
  formatTime,
  fromNow,
  diff,
  isToday,
  isYesterday,
  isTomorrow,
  getDateRange,
  getDaysInMonth,
  isLeapYear,
  getWeekday,
  addTime,
  subtractTime,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getFirstDayOfYear,
  getLastDayOfYear,
  getFirstDayOfWeek,
  getLastDayOfWeek,
} from '../index'

describe('date', () => {
  const originalTZ = process.env.TZ

  beforeAll(() => {
    // 固定测试时间为 2024-01-05 12:00:00
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-05T12:00:00.000Z'))
    // 使用 UTC+8 时区
    process.env.TZ = 'Asia/Shanghai'
  })

  afterAll(() => {
    // 测试结束后恢复系统时间
    vi.useRealTimers()
    // 恢复默认时区
    process.env.TZ = originalTZ
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-05')
      expect(formatDate(date)).toBe('2024-01-05')
    })

    it('should handle string input', () => {
      expect(formatDate('2024-01-05')).toBe('2024-01-05')
    })

    it('should handle custom format', () => {
      const date = new Date('2024-01-05')
      expect(formatDate(date, 'YYYY年MM月DD日')).toBe('2024年01月05日')
    })
  })

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date = new Date('2024-01-05T12:00:00')
      expect(formatTime(date)).toBe('2024-01-05 12:00:00')
    })

    it('should handle string input', () => {
      expect(formatTime('2024-01-05 12:00:00')).toBe('2024-01-05 12:00:00')
    })

    it('should handle custom format', () => {
      const date = new Date('2024-01-05T12:00:00')
      expect(formatTime(date, 'YYYY年MM月DD日 HH时mm分ss秒')).toBe('2024年01月05日 12时00分00秒')
    })
  })

  describe('fromNow', () => {
    it('should handle minutes', () => {
      expect(fromNow('2024-01-05T12:30:00.000Z')).toBe('30分钟后')
      expect(fromNow('2024-01-05T11:30:00.000Z')).toBe('30分钟前')
    })

    it('should handle hours', () => {
      expect(fromNow('2024-01-05T14:00:00.000Z')).toBe('2小时后')
      expect(fromNow('2024-01-05T10:00:00.000Z')).toBe('2小时前')
    })

    it('should handle days', () => {
      expect(fromNow('2024-01-06T12:00:00.000Z')).toBe('1天后')
      expect(fromNow('2024-01-04T12:00:00.000Z')).toBe('1天前')
      expect(fromNow('2024-01-25T12:00:00.000Z')).toBe('20天后')
      expect(fromNow('2023-12-15T12:00:00.000Z')).toBe('21天前')
    })

    it('should handle months', () => {
      expect(fromNow('2024-02-05T12:00:00.000Z')).toBe('1个月后')
      expect(fromNow('2023-12-05T12:00:00.000Z')).toBe('1个月前')
      expect(fromNow('2024-06-05T12:00:00.000Z')).toBe('5个月后')
      expect(fromNow('2023-08-05T12:00:00.000Z')).toBe('5个月前')
    })

    it('should handle years', () => {
      expect(fromNow('2025-01-05T12:00:00.000Z')).toBe('1年后')
      expect(fromNow('2023-01-05T12:00:00.000Z')).toBe('1年前')
      expect(fromNow('2026-01-05T12:00:00.000Z')).toBe('2年后')
      expect(fromNow('2022-01-05T12:00:00.000Z')).toBe('2年前')
    })
  })

  describe('diff', () => {
    it('should calculate difference in days', () => {
      expect(diff('2024-01-05', '2024-01-01', 'day')).toBe(4)
    })

    it('should calculate difference in hours', () => {
      expect(diff('2024-01-05 12:00:00', '2024-01-05 10:00:00', 'hour')).toBe(2)
    })

    it('should calculate difference in minutes', () => {
      expect(diff('2024-01-05 12:30:00', '2024-01-05 12:00:00', 'minute')).toBe(30)
    })

    it('should handle negative differences', () => {
      expect(diff('2024-01-01', '2024-01-05', 'day')).toBe(-4)
    })

    it('should handle year differences', () => {
      expect(diff('2025-01-05', '2024-01-05', 'year')).toBe(1)
      expect(diff('2024-01-05', '2025-01-05', 'year')).toBe(-1)
    })

    it('should handle month differences', () => {
      expect(diff('2024-02-05', '2024-01-05', 'month')).toBe(1)
      expect(diff('2024-01-05', '2024-02-05', 'month')).toBe(-1)
    })

    it('should handle second differences', () => {
      expect(diff('2024-01-05 12:00:30', '2024-01-05 12:00:00', 'second')).toBe(30)
      expect(diff('2024-01-05 12:00:00', '2024-01-05 12:00:30', 'second')).toBe(-30)
    })
  })

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday('2024-01-05')).toBe(true)
      expect(isToday(new Date('2024-01-05T12:00:00.000Z'))).toBe(true)
    })

    it('should return false for other days', () => {
      expect(isToday('2024-01-04')).toBe(false)
      expect(isToday('2024-01-06')).toBe(false)
    })
  })

  describe('isYesterday', () => {
    it('should return true for yesterday', () => {
      expect(isYesterday('2024-01-04')).toBe(true)
      expect(isYesterday(new Date('2024-01-04T12:00:00.000Z'))).toBe(true)
    })

    it('should return false for other days', () => {
      expect(isYesterday('2024-01-05')).toBe(false)
      expect(isYesterday('2024-01-03')).toBe(false)
    })
  })

  describe('isTomorrow', () => {
    it('should return true for tomorrow', () => {
      expect(isTomorrow('2024-01-06')).toBe(true)
      expect(isTomorrow(new Date('2024-01-06T12:00:00.000Z'))).toBe(true)
    })

    it('should return false for other days', () => {
      expect(isTomorrow('2024-01-05')).toBe(false)
      expect(isTomorrow('2024-01-07')).toBe(false)
    })
  })

  describe('getDateRange', () => {
    it('should return date range', () => {
      const range = getDateRange('2024-01-01', '2024-01-03')
      expect(range).toHaveLength(3)
      expect(range[0].toDateString()).toBe(new Date('2024-01-01').toDateString())
      expect(range[1].toDateString()).toBe(new Date('2024-01-02').toDateString())
      expect(range[2].toDateString()).toBe(new Date('2024-01-03').toDateString())
    })

    it('should handle single day range', () => {
      const range = getDateRange('2024-01-01', '2024-01-01')
      expect(range).toHaveLength(1)
      expect(range[0].toDateString()).toBe(new Date('2024-01-01').toDateString())
    })
  })

  describe('getDaysInMonth', () => {
    it('should return correct days for regular months', () => {
      expect(getDaysInMonth(2024, 1)).toBe(31) // January
      expect(getDaysInMonth(2024, 4)).toBe(30) // April
    })

    it('should handle February in leap year', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29) // 2024 is leap year
    })

    it('should handle February in non-leap year', () => {
      expect(getDaysInMonth(2023, 2)).toBe(28) // 2023 is not leap year
    })
  })

  describe('isLeapYear', () => {
    it('should return true for leap years', () => {
      expect(isLeapYear(2024)).toBe(true)
      expect(isLeapYear(2000)).toBe(true)
      expect(isLeapYear(1600)).toBe(true)
    })

    it('should return false for non-leap years', () => {
      expect(isLeapYear(2023)).toBe(false)
      expect(isLeapYear(1900)).toBe(false)
      expect(isLeapYear(2100)).toBe(false)
    })
  })

  describe('getWeekday', () => {
    it('should return Chinese weekday by default', () => {
      expect(getWeekday('2024-01-05')).toBe('星期五') // Friday
      expect(getWeekday('2024-01-06')).toBe('星期六') // Saturday
      expect(getWeekday('2024-01-07')).toBe('星期日') // Sunday
    })

    it('should return English weekday when specified', () => {
      expect(getWeekday('2024-01-05', 'en')).toBe('Friday')
      expect(getWeekday('2024-01-06', 'en')).toBe('Saturday')
      expect(getWeekday('2024-01-07', 'en')).toBe('Sunday')
    })
  })

  describe('addTime', () => {
    it('should add days', () => {
      const result = addTime('2024-01-05', 3, 'day')
      expect(result.toDateString()).toBe(new Date('2024-01-08').toDateString())
    })

    it('should add hours', () => {
      const result = addTime('2024-01-05T12:00:00', 2, 'hour')
      expect(result.getHours()).toBe(14)
      expect(result.toDateString()).toBe(new Date('2024-01-05').toDateString())
    })

    it('should add months', () => {
      const result = addTime('2024-01-05', 1, 'month')
      expect(result.toDateString()).toBe(new Date('2024-02-05').toDateString())
    })

    it('should add years', () => {
      const result = addTime('2024-01-05', 1, 'year')
      expect(result.toDateString()).toBe(new Date('2025-01-05').toDateString())
    })
  })

  describe('subtractTime', () => {
    it('should subtract days', () => {
      const result = subtractTime('2024-01-05', 3, 'day')
      expect(result.toDateString()).toBe(new Date('2024-01-02').toDateString())
    })

    it('should subtract hours', () => {
      const result = subtractTime('2024-01-05T12:00:00', 2, 'hour')
      expect(result.getHours()).toBe(10)
      expect(result.toDateString()).toBe(new Date('2024-01-05').toDateString())
    })

    it('should subtract months', () => {
      const result = subtractTime('2024-01-05', 1, 'month')
      expect(result.toDateString()).toBe(new Date('2023-12-05').toDateString())
    })

    it('should subtract years', () => {
      const result = subtractTime('2024-01-05', 1, 'year')
      expect(result.toDateString()).toBe(new Date('2023-01-05').toDateString())
    })
  })

  describe('getFirstDayOfMonth', () => {
    it('should return first day of month', () => {
      const result = getFirstDayOfMonth('2024-01-15')
      expect(result.toDateString()).toBe(new Date('2024-01-01').toDateString())
    })
  })

  describe('getLastDayOfMonth', () => {
    it('should return last day of month', () => {
      const result = getLastDayOfMonth('2024-01-15')
      expect(result.getDate()).toBe(31)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getFullYear()).toBe(2024)
    })
  })

  describe('getFirstDayOfYear', () => {
    it('should return first day of year', () => {
      const result = getFirstDayOfYear('2024-06-15')
      expect(result.toDateString()).toBe(new Date('2024-01-01').toDateString())
    })
  })

  describe('getLastDayOfYear', () => {
    it('should return last day of year', () => {
      const result = getLastDayOfYear('2024-06-15')
      expect(result.getDate()).toBe(31)
      expect(result.getMonth()).toBe(11) // December
      expect(result.getFullYear()).toBe(2024)
    })
  })

  describe('getFirstDayOfWeek', () => {
    it('should return first day of week', () => {
      const result = getFirstDayOfWeek('2024-01-05') // Friday
      // dayjs默认以周一为一周的开始，所以2024-01-05（周五）的周一是2024-01-01
      expect(result.toDateString()).toBe(new Date('2024-01-01').toDateString()) // Monday
    })
  })

  describe('getLastDayOfWeek', () => {
    it('should return last day of week', () => {
      const result = getLastDayOfWeek('2024-01-05') // Friday
      // dayjs默认以周日为一周的结束，所以2024-01-05（周五）的周日是2024-01-07
      expect(result.getDate()).toBe(7)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getFullYear()).toBe(2024)
    })
  })
})
