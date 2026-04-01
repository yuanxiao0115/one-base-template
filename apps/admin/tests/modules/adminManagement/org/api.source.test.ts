import { describe, expect, it } from 'vite-plus/test';

import apiSource from '@/modules/adminManagement/org/api.ts?raw';

describe('adminManagement/org api source', () => {
  it('组织树接口层只保留请求透传，不在 api.ts 做归一化', () => {
    expect(apiSource).toContain(
      "obHttp().get<ApiResponse<OrgRecord[]>>('/cmict/admin/org/children'"
    );
    expect(apiSource).not.toContain('normalizeOrgTreeRows');
    expect(apiSource).not.toContain('data: normalize');
  });
});
