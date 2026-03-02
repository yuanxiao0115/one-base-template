import { describe, expect, it } from 'vitest'
import { toBooleanValue, toNullableNumber } from '../../../../apps/admin/src/shared/api/normalize'

describe('admin shared normalize 兼容性', () => {
  it('toNullableNumber 遇到非法非空字符串时返回 null', () => {
    expect(toNullableNumber('abc')).toBeNull()
  })

  it('toBooleanValue 应正确解析字符串 0/1', () => {
    expect(toBooleanValue('0', true)).toBe(false)
    expect(toBooleanValue('1', false)).toBe(true)
  })
})
