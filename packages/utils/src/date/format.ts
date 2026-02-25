import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 加载插件
dayjs.extend(relativeTime)
// 设置语言
dayjs.locale('zh-cn')

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式
 */
export function formatDate(date: string | number | Date, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

/**
 * 格式化时间
 * @param date 日期
 * @param format 格式
 */
export function formatTime(date: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(format)
}

/**
 * 获取相对时间
 * @param date 日期
 */
export function fromNow(date: string | number | Date): string {
  const now = dayjs()
  const target = dayjs(date)
  const diff = target.diff(now, 'day', true)

  if (Math.abs(diff) < 1) {
    const hours = target.diff(now, 'hour', true)
    if (Math.abs(hours) < 1) {
      const minutes = target.diff(now, 'minute')
      return `${Math.abs(minutes)}分钟${minutes >= 0 ? '后' : '前'}`
    }
    return `${Math.floor(Math.abs(hours))}小时${hours >= 0 ? '后' : '前'}`
  }

  if (Math.abs(diff) < 30) {
    return `${Math.floor(Math.abs(diff))}天${diff >= 0 ? '后' : '前'}`
  }

  const months = target.diff(now, 'month', true)
  if (Math.abs(months) < 12) {
    return `${Math.floor(Math.abs(months))}个月${months >= 0 ? '后' : '前'}`
  }

  const years = target.diff(now, 'year', true)
  return `${Math.floor(Math.abs(years))}年${years >= 0 ? '后' : '前'}`
}

/**
 * 计算两个日期之间的差值
 * @param date1 日期1
 * @param date2 日期2
 * @param unit 单位
 */
export function diff(
  date1: string | number | Date,
  date2: string | number | Date,
  unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'day',
): number {
  return dayjs(date1).diff(date2, unit)
}

/**
 * 判断是否为今天
 * @param date 日期
 */
export function isToday(date: string | number | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 判断是否为昨天
 * @param date 日期
 */
export function isYesterday(date: string | number | Date): boolean {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}

/**
 * 判断是否为明天
 * @param date 日期
 */
export function isTomorrow(date: string | number | Date): boolean {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day')
}

/**
 * 获取日期范围
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export function getDateRange(startDate: string | Date, endDate: string | Date): Date[] {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const dates: Date[] = []

  let current = start
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dates.push(current.toDate())
    current = current.add(1, 'day')
  }

  return dates
}

/**
 * 获取月份的天数
 * @param year 年份
 * @param month 月份（1-12）
 */
export function getDaysInMonth(year: number, month: number): number {
  return dayjs(`${year}-${month}`).daysInMonth()
}

/**
 * 判断是否为闰年
 * @param year 年份
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * 获取星期几
 * @param date 日期
 * @param locale 语言环境
 */
export function getWeekday(date: string | number | Date, locale: 'zh' | 'en' = 'zh'): string {
  const d = dayjs(date)
  const weekdays = {
    zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  }

  return weekdays[locale][d.day()]
}

/**
 * 添加时间
 * @param date 日期
 * @param amount 数量
 * @param unit 单位
 */
export function addTime(
  date: string | number | Date,
  amount: number,
  unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
): Date {
  return dayjs(date).add(amount, unit).toDate()
}

/**
 * 减少时间
 * @param date 日期
 * @param amount 数量
 * @param unit 单位
 */
export function subtractTime(
  date: string | number | Date,
  amount: number,
  unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
): Date {
  return dayjs(date).subtract(amount, unit).toDate()
}

/**
 * 获取月份的第一天
 * @param date 日期
 */
export function getFirstDayOfMonth(date: string | number | Date): Date {
  return dayjs(date).startOf('month').toDate()
}

/**
 * 获取月份的最后一天
 * @param date 日期
 */
export function getLastDayOfMonth(date: string | number | Date): Date {
  return dayjs(date).endOf('month').toDate()
}

/**
 * 获取年份的第一天
 * @param date 日期
 */
export function getFirstDayOfYear(date: string | number | Date): Date {
  return dayjs(date).startOf('year').toDate()
}

/**
 * 获取年份的最后一天
 * @param date 日期
 */
export function getLastDayOfYear(date: string | number | Date): Date {
  return dayjs(date).endOf('year').toDate()
}

/**
 * 获取周的第一天
 * @param date 日期
 */
export function getFirstDayOfWeek(date: string | number | Date): Date {
  return dayjs(date).startOf('week').toDate()
}

/**
 * 获取周的最后一天
 * @param date 日期
 */
export function getLastDayOfWeek(date: string | number | Date): Date {
  return dayjs(date).endOf('week').toDate()
}
