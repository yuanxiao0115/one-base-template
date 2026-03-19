import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

vi.mock('@iconify/vue/dist/offline', () => ({
  addCollection: vi.fn()
}));

vi.mock('@iconify-json/ep/icons.json', () => ({
  default: {
    prefix: 'ep',
    icons: {
      homeFilled: { body: '<path />' },
      setting: { body: '<path />' }
    }
  }
}));

vi.mock('@iconify-json/ri/icons.json', () => ({
  default: {
    prefix: 'ri',
    icons: {
      homeLine: { body: '<path />' },
      alarmLine: { body: '<path />' }
    }
  }
}));

describe('menu-iconify', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('按前缀懒注册并缓存 iconify 集合', async () => {
    const { addCollection } = await import('@iconify/vue/dist/offline');
    const mod = await import('./menu-iconify');

    await mod.ensureMenuIconifyCollectionsRegistered('ep');
    await mod.ensureMenuIconifyCollectionsRegistered('ep');

    expect(addCollection).toHaveBeenCalledTimes(1);
    expect(addCollection).toHaveBeenLastCalledWith(
      expect.objectContaining({
        prefix: 'ep'
      })
    );
  });

  it('读取图标名时只加载当前前缀集合', async () => {
    const { addCollection } = await import('@iconify/vue/dist/offline');
    const mod = await import('./menu-iconify');

    const names = await mod.getMenuIconifyNames('ri');

    expect(names).toEqual(['homeLine', 'alarmLine']);
    expect(addCollection).toHaveBeenCalledTimes(1);
    expect(addCollection).toHaveBeenLastCalledWith(
      expect.objectContaining({
        prefix: 'ri'
      })
    );
    expect(mod.isMenuIconifyValue('ri:home-line')).toBe(true);
    expect(mod.isMenuIconifyValue('plain-icon')).toBe(false);
  });

  it('未指定前缀时默认只加载 ep 集合', async () => {
    const { addCollection } = await import('@iconify/vue/dist/offline');
    const mod = await import('./menu-iconify');

    await mod.ensureMenuIconifyCollectionsRegistered();

    expect(addCollection).toHaveBeenCalledTimes(1);
    expect(addCollection).toHaveBeenLastCalledWith(
      expect.objectContaining({
        prefix: 'ep'
      })
    );
  });

  it('解析前缀时会忽略两侧空白字符', async () => {
    const mod = await import('./menu-iconify');

    expect(mod.getMenuIconifyPrefix(' ep:home-filled ')).toBe('ep');
  });
});
