import { describe, expect, it, vi } from 'vite-plus/test';

import type { PermissionMemberSourceApi } from './permission-member-source';
import { createPermissionMemberSource } from './permission-member-source';

function createMemberSourceApi(
  overrides?: Partial<PermissionMemberSourceApi>
): PermissionMemberSourceApi {
  return {
    getOrgContactsLazy: vi.fn(async () => ({ data: [] })),
    searchContactUsers: vi.fn(async () => ({ data: [] })),
    ...overrides
  };
}

describe('permission-member-source', () => {
  it('根节点并发请求应按解析后的 parentId 去重', async () => {
    const api = createMemberSourceApi({
      getOrgContactsLazy: vi.fn(async () => ({
        data: [{ id: 'org-1', nodeType: 'org', orgName: '部门1', parentId: '0', companyId: '1' }]
      }))
    });
    const source = createPermissionMemberSource({
      api,
      resolveRootParentId: () => 'company-1'
    });

    await Promise.all([
      source.fetchNodes({ parentId: '0', mode: 'person' }),
      source.fetchNodes({ mode: 'person' })
    ]);

    expect(api.getOrgContactsLazy).toHaveBeenCalledTimes(1);
    expect(api.getOrgContactsLazy).toHaveBeenCalledWith({ parentId: 'company-1' });
  });

  it('同一 parentId 结果应跨实例复用', async () => {
    const api = createMemberSourceApi({
      getOrgContactsLazy: vi.fn(async () => ({
        data: [{ id: 'org-2', nodeType: 'org', orgName: '部门2', parentId: '0', companyId: '1' }]
      }))
    });

    const sourceA = createPermissionMemberSource({
      api,
      resolveRootParentId: () => 'company-1'
    });
    const sourceB = createPermissionMemberSource({
      api,
      resolveRootParentId: () => 'company-1'
    });

    await sourceA.fetchNodes({ parentId: 'dept-2', mode: 'person' });
    await sourceB.fetchNodes({ parentId: 'dept-2', mode: 'person' });

    expect(api.getOrgContactsLazy).toHaveBeenCalledTimes(1);
  });

  it('同一关键字搜索应跨实例去重并复用', async () => {
    const api = createMemberSourceApi({
      searchContactUsers: vi.fn(async () => ({
        data: [{ id: 'u-1', userId: 'u-1', nickName: '张三', parentId: '0', companyId: '1' }]
      }))
    });

    const sourceA = createPermissionMemberSource({
      api,
      resolveRootParentId: () => 'company-1'
    });
    const sourceB = createPermissionMemberSource({
      api,
      resolveRootParentId: () => 'company-1'
    });

    await Promise.all([
      sourceA.searchNodes({ keyword: 'zhangsan', mode: 'person' }),
      sourceB.searchNodes({ keyword: 'zhangsan', mode: 'person' })
    ]);

    expect(api.searchContactUsers).toHaveBeenCalledTimes(1);
    expect(api.searchContactUsers).toHaveBeenCalledWith({ search: 'zhangsan' });
  });
});
