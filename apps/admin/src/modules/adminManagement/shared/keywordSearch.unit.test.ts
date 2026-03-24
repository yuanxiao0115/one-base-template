import { describe, expect, it } from 'vite-plus/test';
import {
  canTriggerKeywordSearch,
  DEFAULT_MIN_KEYWORD_LENGTH,
  normalizeKeyword
} from './keywordSearch';

describe('UserManagement/shared/keywordSearch', () => {
  it('normalizeKeyword 应移除首尾空格并兼容数字', () => {
    expect(normalizeKeyword('  test  ')).toBe('test');
    expect(normalizeKeyword(123)).toBe('123');
    expect(normalizeKeyword(null)).toBe('');
  });

  it('canTriggerKeywordSearch 应按默认最小长度判断', () => {
    expect(DEFAULT_MIN_KEYWORD_LENGTH).toBe(2);
    expect(canTriggerKeywordSearch('a')).toBe(false);
    expect(canTriggerKeywordSearch('ab')).toBe(true);
  });

  it('canTriggerKeywordSearch 应支持自定义长度', () => {
    expect(canTriggerKeywordSearch('abc', 3)).toBe(true);
    expect(canTriggerKeywordSearch('ab', 3)).toBe(false);
    expect(canTriggerKeywordSearch(' ', 0)).toBe(true);
  });
});
