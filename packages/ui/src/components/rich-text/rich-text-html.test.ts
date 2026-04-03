import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const { sanitizeHtmlContentMock } = vi.hoisted(() => ({
  sanitizeHtmlContentMock: vi.fn<(html: unknown) => string>()
}));

vi.mock('@one-base-template/core', () => ({
  sanitizeHtmlContent: sanitizeHtmlContentMock
}));

import {
  getRichTextToolbarExcludeKeys,
  normalizeRichTextHtml,
  sanitizeRichTextHtml,
  toSafeRichTextHtml
} from './rich-text-html';

describe('rich-text-html', () => {
  beforeEach(() => {
    sanitizeHtmlContentMock.mockReset();
  });

  it('sanitizeRichTextHtml 应委托 core 的 sanitizeHtmlContent', () => {
    sanitizeHtmlContentMock.mockReturnValue('<p>safe</p>');

    const output = sanitizeRichTextHtml('<script>alert(1)</script><p>safe</p>');

    expect(output).toBe('<p>safe</p>');
    expect(sanitizeHtmlContentMock).toHaveBeenCalledTimes(1);
    expect(sanitizeHtmlContentMock).toHaveBeenCalledWith('<script>alert(1)</script><p>safe</p>');
  });

  it('normalizeRichTextHtml 应将仅空白占位的内容归一为空字符串', () => {
    expect(normalizeRichTextHtml('<p>&nbsp;</p>')).toBe('');
    expect(normalizeRichTextHtml('<p>   </p>')).toBe('');
    expect(normalizeRichTextHtml('<p><br></p>')).toBe('');
  });

  it('toSafeRichTextHtml 应先清洗再做空内容归一', () => {
    sanitizeHtmlContentMock.mockReturnValue('<p>&nbsp;</p>');
    expect(toSafeRichTextHtml('<script>alert(1)</script><p>&nbsp;</p>')).toBe('');

    sanitizeHtmlContentMock.mockReturnValue('<p>可见内容</p>');
    expect(toSafeRichTextHtml('<p>可见内容</p>')).toBe('<p>可见内容</p>');
  });

  it('getRichTextToolbarExcludeKeys 应按 profile 返回稳定配置', () => {
    expect(getRichTextToolbarExcludeKeys('full')).toEqual(['fullScreen']);
    expect(getRichTextToolbarExcludeKeys('simple')).toEqual([
      'fullScreen',
      'group-video',
      'insertTable',
      'codeBlock',
      'todo',
      'emotion'
    ]);
  });
});
