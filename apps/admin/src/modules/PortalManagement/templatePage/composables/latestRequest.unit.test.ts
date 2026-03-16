import { describe, expect, it } from 'vite-plus/test';

import { createLatestRequestGuard } from './latestRequest';

describe('PortalManagement/templatePage/latestRequest', () => {
  it('应只认可最后一次请求 token', () => {
    const guard = createLatestRequestGuard();

    const token1 = guard.next();
    const token2 = guard.next();

    expect(guard.isLatest(token1)).toBe(false);
    expect(guard.isLatest(token2)).toBe(true);
  });

  it('应支持失效当前请求 token', () => {
    const guard = createLatestRequestGuard();

    const token1 = guard.next();
    guard.invalidate();
    const token2 = guard.next();

    expect(guard.isLatest(token1)).toBe(false);
    expect(guard.isLatest(token2)).toBe(true);
    expect(token2).toBeGreaterThan(token1);
  });
});
