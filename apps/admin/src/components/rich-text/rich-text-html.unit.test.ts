import { describe, expect, it } from 'vite-plus/test';
import {
  getRichTextToolbarExcludeKeys,
  normalizeRichTextHtml,
  sanitizeRichTextHtml,
  toSafeRichTextHtml
} from './rich-text-html';

describe('rich-text html utils', () => {
  it('应移除危险标签与事件属性', () => {
    const html = [
      '<p onclick="alert(1)">正文</p>',
      '<script>alert(2)</script>',
      '<img src="javascript:alert(3)" onerror="alert(4)" />',
      '<a href="javascript:alert(5)">链接</a>'
    ].join('');

    const sanitized = sanitizeRichTextHtml(html);

    expect(sanitized.includes('<script')).toBe(false);
    expect(sanitized.includes('onclick=')).toBe(false);
    expect(sanitized.includes('onerror=')).toBe(false);
    expect(sanitized.includes('javascript:')).toBe(false);
  });

  it('target=_blank 链接应补齐安全 rel', () => {
    const html = '<p><a href="https://one-base.test" target="_blank">跳转</a></p>';
    const sanitized = sanitizeRichTextHtml(html);

    expect(sanitized.includes('target="_blank"')).toBe(true);
    expect(sanitized.includes('rel="noopener noreferrer"')).toBe(true);
  });

  it('空正文应归一为空字符串', () => {
    expect(normalizeRichTextHtml('<p><br></p>')).toBe('');
    expect(toSafeRichTextHtml('<p>&nbsp;&nbsp;</p>')).toBe('');
  });

  it('应返回指定 profile 的工具栏排除项', () => {
    expect(getRichTextToolbarExcludeKeys('full')).toEqual(['fullScreen']);
    expect(getRichTextToolbarExcludeKeys('simple')).toContain('group-video');
  });
});
