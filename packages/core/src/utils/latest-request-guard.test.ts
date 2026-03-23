import { describe, expect, it } from 'vite-plus/test';

import { createLatestRequestGuard } from './latest-request-guard';

describe('core/utils/latest-request-guard', () => {
  it('初始化后首个 token 应从 1 开始', () => {
    const guard = createLatestRequestGuard();

    const token = guard.next();

    expect(token).toBe(1);
    expect(guard.isLatest(token)).toBe(true);
  });

  it('next 应按顺序递增 token', () => {
    const guard = createLatestRequestGuard();

    const token1 = guard.next();
    const token2 = guard.next();
    const token3 = guard.next();

    expect(token2).toBe(token1 + 1);
    expect(token3).toBe(token2 + 1);
  });

  it('invalidate 后旧 token 应失效', () => {
    const guard = createLatestRequestGuard();

    const token = guard.next();
    guard.invalidate();

    expect(guard.isLatest(token)).toBe(false);
  });

  it('isLatest 应只认最后一次 next 返回的 token', () => {
    const guard = createLatestRequestGuard();

    const token1 = guard.next();
    const token2 = guard.next();

    expect(guard.isLatest(token1)).toBe(false);
    expect(guard.isLatest(token2)).toBe(true);
  });
});
