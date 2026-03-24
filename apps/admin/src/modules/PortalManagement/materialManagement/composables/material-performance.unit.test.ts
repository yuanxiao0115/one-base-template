import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { createDebouncedTask } from './debounced-task';
import { createLatestRequestGuard } from './latest-request';
import { createMemoryCache } from './material-cache';

describe('PortalManagement/materialManagement/composables', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('memory cache 应支持 TTL 过期与前缀清理', () => {
    let now = 0;
    const cache = createMemoryCache<string>({
      ttlMs: 100,
      now: () => now
    });

    cache.set('image:1', 'A');
    cache.set('image:2', 'B');
    cache.set('icon:1', 'C');

    expect(cache.get('image:1')).toBe('A');

    now = 120;
    expect(cache.get('image:1')).toBeNull();

    now = 0;
    cache.clear('image:');
    expect(cache.get('image:2')).toBeNull();
    expect(cache.get('icon:1')).toBe('C');
  });

  it('latest request guard 应只认最新 token 且可手动失效', () => {
    const guard = createLatestRequestGuard();

    const token1 = guard.next();
    const token2 = guard.next();

    expect(guard.isLatest(token1)).toBe(false);
    expect(guard.isLatest(token2)).toBe(true);

    guard.invalidate();
    expect(guard.isLatest(token2)).toBe(false);
  });

  it('debounced task 应合并短时间重复触发并支持取消', () => {
    const task = vi.fn();
    const debouncedTask = createDebouncedTask(task, 300);

    debouncedTask.run();
    debouncedTask.run();
    debouncedTask.run();

    vi.advanceTimersByTime(299);
    expect(task).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(1);
    expect(task).toHaveBeenCalledTimes(1);

    debouncedTask.run();
    debouncedTask.cancel();
    vi.runAllTimers();

    expect(task).toHaveBeenCalledTimes(1);
  });
});
