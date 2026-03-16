import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vite-plus/test';

describe('ui auth entry source', () => {
  it('根入口不应再直接静态导出登录 SFC，避免打断轻量 auth 分块', () => {
    const source = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');

    expect(source).toContain("from './lite-auth'");
    expect(source).not.toContain("from './components/auth/LoginBox.vue'");
    expect(source).not.toContain("from './components/auth/LoginBoxV2.vue'");
  });

  it('lite auth 入口只对 V2 保持异步壳，基础 LoginBox 留在同一 auth chunk', () => {
    const source = readFileSync(new URL('./lite/auth.ts', import.meta.url), 'utf8');

    expect(source).toContain("from '../components/auth/LoginBox.vue'");
    expect(source).not.toContain(
      "defineAsyncComponent(() => import('../components/auth/LoginBox.vue'))"
    );
    expect(source).toContain(
      "defineAsyncComponent(() => import('../components/auth/LoginBoxV2.vue'))"
    );
  });
});
