import { describe, expect, it } from 'vite-plus/test';

import apiSource from './api.ts?raw';

describe('adminManagement/org api source', () => {
  it('组织树接口应补齐 hasChildren 回退标记，保证懒加载树表可展开', () => {
    expect(apiSource).toContain('function normalizeOrgTreeRows');
    expect(apiSource).toContain(
      "hasChildren: typeof row.hasChildren === 'boolean' ? row.hasChildren : true"
    );
    expect(apiSource).toContain('data: normalizeOrgTreeRows');
  });
});
