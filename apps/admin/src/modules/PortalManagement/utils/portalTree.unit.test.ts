import { describe, expect, it } from 'vite-plus/test';
import { isPortalTabEditable, normalizeIdLike } from './portalTree';

describe('PortalManagement/utils/portalTree', () => {
  it('仅 tabType=2 视为可编辑页面', () => {
    expect(isPortalTabEditable(2)).toBe(true);
    expect(isPortalTabEditable(1)).toBe(false);
    expect(isPortalTabEditable(3)).toBe(false);
    expect(isPortalTabEditable(undefined)).toBe(false);
  });

  it('normalizeIdLike 应处理 string/number', () => {
    expect(normalizeIdLike('a')).toBe('a');
    expect(normalizeIdLike(12)).toBe('12');
    expect(normalizeIdLike(null)).toBe('');
  });
});
