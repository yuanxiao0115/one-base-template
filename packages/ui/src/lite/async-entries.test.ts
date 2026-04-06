import { describe, expect, it, vi } from 'vite-plus/test';

vi.mock('../components/auth/LoginBoxV2.vue', () => ({
  default: { name: 'MockLoginBoxV2View' }
}));

vi.mock('../components/container/PageContainer.vue', () => ({
  default: { name: 'MockPageContainerView' }
}));

describe('lite async entries', () => {
  it('LoginBoxV2 应暴露可执行的异步加载器', async () => {
    const { LoginBoxV2 } = await import('./auth');
    const loader = (LoginBoxV2 as unknown as { __asyncLoader?: () => Promise<unknown> })
      .__asyncLoader;

    expect(loader).toBeTypeOf('function');
    const mod = await loader?.();
    expect((mod as { default?: { name?: string } } | undefined)?.default?.name).toBe(
      'MockLoginBoxV2View'
    );
  });

  it('PageContainer 应暴露可执行的异步加载器', async () => {
    const { PageContainer } = await import('./container');
    const loader = (PageContainer as unknown as { __asyncLoader?: () => Promise<unknown> })
      .__asyncLoader;

    expect(loader).toBeTypeOf('function');
    const mod = await loader?.();
    expect((mod as { default?: { name?: string } } | undefined)?.default?.name).toBe(
      'MockPageContainerView'
    );
  });
});
