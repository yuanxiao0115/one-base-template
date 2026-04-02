import { describe, expect, it } from 'vite-plus/test';
import { isHttpUrl, resolveExternalTargetUrl, resolveSafeHttpUrl } from './url';

describe('core/utils/url', () => {
  it('isHttpUrl: 仅允许 http(s) 协议', () => {
    expect(isHttpUrl('https://one-base-template.dev')).toBe(true);
    expect(isHttpUrl('  http://one-base-template.dev  ')).toBe(true);
    expect(isHttpUrl('//one-base-template.dev')).toBe(false);
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
  });

  it('resolveSafeHttpUrl: 非法链接应回退', () => {
    expect(resolveSafeHttpUrl('https://one-base-template.dev')).toBe(
      'https://one-base-template.dev'
    );
    expect(resolveSafeHttpUrl('javascript:alert(1)', '/fallback')).toBe('/fallback');
    expect(resolveSafeHttpUrl(undefined, '/fallback')).toBe('/fallback');
  });

  it('resolveExternalTargetUrl: 优先 redirect，否则回退 path', () => {
    expect(
      resolveExternalTargetUrl({
        redirect: 'https://target.example/path',
        path: 'https://path.example/fallback'
      })
    ).toBe('https://target.example/path');

    expect(
      resolveExternalTargetUrl({
        redirect: 'javascript:alert(1)',
        path: 'https://path.example/fallback'
      })
    ).toBe('https://path.example/fallback');

    expect(
      resolveExternalTargetUrl({
        redirect: '',
        path: 'javascript:alert(2)',
        fallback: 'https://fallback.example'
      })
    ).toBe('https://fallback.example');
  });
});
