import { describe, expect, it } from 'vite-plus/test';
import { sanitizeHtmlContent } from './html';

describe('core/utils/html', () => {
  it('应移除 script、事件属性与 javascript 协议', () => {
    const html = [
      '<p onclick="alert(1)">正文</p>',
      '<script>alert(2)</script>',
      '<img src="javascript:alert(3)" onerror="alert(4)" />',
      '<a href="javascript:alert(5)">链接</a>'
    ].join('');

    const sanitized = sanitizeHtmlContent(html);

    expect(sanitized.includes('<script')).toBe(false);
    expect(sanitized.includes('onclick=')).toBe(false);
    expect(sanitized.includes('onerror=')).toBe(false);
    expect(sanitized.includes('javascript:')).toBe(false);
  });

  it('target=_blank 链接应补齐安全 rel', () => {
    const html = '<p><a href="https://one-base.test" target="_blank">跳转</a></p>';
    const sanitized = sanitizeHtmlContent(html);

    expect(sanitized.includes('target="_blank"')).toBe(true);
    expect(sanitized.includes('rel="noopener noreferrer"')).toBe(true);
  });
});
