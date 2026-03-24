import { describe, expect, it, vi } from 'vite-plus/test';
import { createDictService } from './dict-resource-service';
import type { DictServiceItem } from './types';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();

  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    }
  };
}

describe('services/dict/dict-resource-service', () => {
  it('应返回 list 与 map，并在 TTL 内命中缓存', async () => {
    const fetchItems = vi.fn(
      async () =>
        [
          { itemName: '启用', itemValue: 1 },
          { itemName: '停用', itemValue: 0 }
        ] satisfies DictServiceItem[]
    );

    const service = createDictService({
      fetchItems,
      getStorageNamespace: () => 'admin',
      sessionStorage: createMemoryStorage(),
      defaultTtlMs: 60_000,
      now: () => 1
    });

    const first = await service.loadDictResource('user_status');
    const second = await service.loadDictResource('user_status');

    expect(fetchItems).toHaveBeenCalledTimes(1);
    expect(first.list).toEqual([
      { label: '启用', value: '1' },
      { label: '停用', value: '0' }
    ]);
    expect(first.map).toEqual({
      '1': '启用',
      '0': '停用'
    });
    expect(second).toEqual(first);
  });

  it('新实例应可命中 sessionStorage 缓存', async () => {
    const storage = createMemoryStorage();
    const fetchItems = vi.fn(
      async () => [{ itemName: '男', itemValue: 'M' }] satisfies DictServiceItem[]
    );

    const service1 = createDictService({
      fetchItems,
      getStorageNamespace: () => 'admin',
      sessionStorage: storage,
      defaultTtlMs: 60_000,
      now: () => 10
    });

    await service1.loadDictResource('gender');
    expect(fetchItems).toHaveBeenCalledTimes(1);

    const service2 = createDictService({
      fetchItems,
      getStorageNamespace: () => 'admin',
      sessionStorage: storage,
      defaultTtlMs: 60_000,
      now: () => 20
    });

    const cached = await service2.loadDictResource('gender');
    expect(fetchItems).toHaveBeenCalledTimes(1);
    expect(cached.map).toEqual({ M: '男' });
  });

  it('TTL 过期后应重新请求', async () => {
    let currentNow = 0;
    const fetchItems = vi
      .fn<() => Promise<DictServiceItem[]>>()
      .mockResolvedValueOnce([{ itemName: 'A', itemValue: 'a' }])
      .mockResolvedValueOnce([{ itemName: 'B', itemValue: 'b' }]);

    const service = createDictService({
      fetchItems,
      getStorageNamespace: () => 'admin',
      sessionStorage: createMemoryStorage(),
      defaultTtlMs: 100,
      now: () => currentNow
    });

    const first = await service.loadDictResource('letters');
    currentNow = 200;
    const second = await service.loadDictResource('letters');

    expect(fetchItems).toHaveBeenCalledTimes(2);
    expect(first.map).toEqual({ a: 'A' });
    expect(second.map).toEqual({ b: 'B' });
  });

  it('force=true 应强制刷新', async () => {
    const fetchItems = vi
      .fn<() => Promise<DictServiceItem[]>>()
      .mockResolvedValueOnce([{ itemName: '开', itemValue: 1 }])
      .mockResolvedValueOnce([{ itemName: '关', itemValue: 0 }]);

    const service = createDictService({
      fetchItems,
      getStorageNamespace: () => 'admin',
      sessionStorage: createMemoryStorage(),
      defaultTtlMs: 60_000,
      now: () => 1
    });

    await service.loadDictResource('switch');
    const refreshed = await service.loadDictResource('switch', { force: true });

    expect(fetchItems).toHaveBeenCalledTimes(2);
    expect(refreshed.map).toEqual({ '0': '关' });
  });

  it('并发加载同一字典应复用在途请求', async () => {
    const fetchItems = vi.fn(
      async () =>
        await new Promise<DictServiceItem[]>((resolve) => {
          setTimeout(() => {
            resolve([{ itemName: '是', itemValue: true }]);
          }, 10);
        })
    );

    const service = createDictService({
      fetchItems,
      getStorageNamespace: () => 'admin',
      sessionStorage: createMemoryStorage(),
      defaultTtlMs: 60_000,
      now: () => 1
    });

    const task1 = service.loadDictResource('boolean');
    const task2 = service.loadDictResource('boolean');

    const [result1, result2] = await Promise.all([task1, task2]);

    expect(fetchItems).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(result2);
    expect(result1.map).toEqual({ true: '是' });
  });

  it('clearDictCache 支持按字典与全量清理', async () => {
    const storage = createMemoryStorage();
    const fetchItems = vi
      .fn<() => Promise<DictServiceItem[]>>()
      .mockResolvedValue([{ itemName: '值', itemValue: 'v' }]);

    const service = createDictService({
      fetchItems,
      getStorageNamespace: () => 'admin',
      sessionStorage: storage,
      defaultTtlMs: 60_000,
      now: () => 1
    });

    await service.loadDictResource('dictA');
    await service.loadDictResource('dictB');
    expect(fetchItems).toHaveBeenCalledTimes(2);

    service.clearDictCache('dictA');
    await service.loadDictResource('dictA');
    await service.loadDictResource('dictB');
    expect(fetchItems).toHaveBeenCalledTimes(3);

    service.clearDictCache();
    await service.loadDictResource('dictB');
    expect(fetchItems).toHaveBeenCalledTimes(4);
  });

  it('空 dictCode 应抛错', async () => {
    const service = createDictService({
      fetchItems: async () => [],
      getStorageNamespace: () => 'admin',
      sessionStorage: createMemoryStorage(),
      defaultTtlMs: 60_000,
      now: () => 1
    });

    await expect(service.loadDictResource('   ')).rejects.toThrow('dictCode 不能为空');
  });
});
