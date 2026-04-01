import { describe, expect, it, vi } from 'vite-plus/test';
import { createCachedAsyncLoader } from '@/modules/adminManagement/shared/cachedAsyncLoader';

describe('UserManagement/shared/cachedAsyncLoader', () => {
  it('应缓存首次加载结果', async () => {
    const fetcher = vi.fn(async () => ({ ok: true }));
    const loader = createCachedAsyncLoader(fetcher);

    const first = await loader.load();
    const second = await loader.load();

    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('并发加载应复用同一请求', async () => {
    const fetcher = vi.fn(
      async () =>
        await new Promise<number>((resolve) => {
          setTimeout(() => resolve(42), 10);
        })
    );
    const loader = createCachedAsyncLoader(fetcher);

    const task1 = loader.load();
    const task2 = loader.load();

    expect(fetcher).toHaveBeenCalledTimes(1);
    await expect(task1).resolves.toBe(42);
    await expect(task2).resolves.toBe(42);
  });

  it('force=true 时应强制刷新缓存', async () => {
    let count = 0;
    const fetcher = vi.fn(async () => {
      count += 1;
      return count;
    });
    const loader = createCachedAsyncLoader(fetcher);

    await expect(loader.load()).resolves.toBe(1);
    await expect(loader.load()).resolves.toBe(1);
    await expect(loader.load({ force: true })).resolves.toBe(2);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
