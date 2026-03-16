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

  it('应支持重置当前请求 token', () => {
    const guard = createLatestRequestGuard();

    const token1 = guard.next();
    guard.reset();

    expect(guard.isLatest(token1)).toBe(false);
    expect(guard.current()).toBe(0);
  });
});
