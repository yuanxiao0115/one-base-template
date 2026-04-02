import { describe, expect, it } from 'vite-plus/test';

import { createLatestRequestGuard } from './latestRequest';

describe('LogManagement/shared/latestRequest', () => {
  it('应只允许最新请求 token 生效', () => {
    const guard = createLatestRequestGuard();

    const token1 = guard.next();
    const token2 = guard.next();

    expect(guard.isLatest(token1)).toBe(false);
    expect(guard.isLatest(token2)).toBe(true);
  });

  it('失效后旧 token 不应再生效', () => {
    const guard = createLatestRequestGuard();

    const token1 = guard.next();
    guard.invalidate();
    const token2 = guard.next();

    expect(guard.isLatest(token1)).toBe(false);
    expect(guard.isLatest(token2)).toBe(true);
    expect(token2).toBeGreaterThan(token1);
  });
});
