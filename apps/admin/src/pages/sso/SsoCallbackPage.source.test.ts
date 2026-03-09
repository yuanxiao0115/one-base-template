import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('SsoCallbackPage source', () => {
  it('SSO 成功后应通过 redirect 归一化辅助函数跳转，兼容子路径部署', () => {
    const source = readFileSync(new URL('./SsoCallbackPage.vue', import.meta.url), 'utf8');

    expect(source).toContain('from "@/router/redirect"');
    expect(source).toContain('resolveAppRedirectTarget(');
  });
});
