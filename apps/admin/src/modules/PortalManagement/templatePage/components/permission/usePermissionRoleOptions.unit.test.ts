import { describe, expect, it, vi } from 'vite-plus/test';

import type { PermissionRoleSourceApi } from './permission-role-source';
import { usePermissionRoleOptions } from './usePermissionRoleOptions';

function createRoleSourceApi(
  overrides?: Partial<PermissionRoleSourceApi>
): PermissionRoleSourceApi {
  return {
    listRoles: vi.fn(async () => ({ data: [] })),
    pageRoles: vi.fn(async () => ({ data: { records: [] } })),
    ...overrides
  };
}

describe('usePermissionRoleOptions', () => {
  it('同一 API 的并发加载应只请求一次', async () => {
    const api = createRoleSourceApi({
      listRoles: vi.fn(async () => ({
        data: [{ id: 'r1', name: '角色1' }]
      }))
    });

    const stateA = usePermissionRoleOptions(api);
    const stateB = usePermissionRoleOptions(api);

    await Promise.all([stateA.ensureRoleOptions(), stateB.ensureRoleOptions()]);

    expect(api.listRoles).toHaveBeenCalledTimes(1);
    expect(stateA.roleOptions.value).toEqual([{ id: 'r1', name: '角色1' }]);
    expect(stateB.roleOptions.value).toEqual([{ id: 'r1', name: '角色1' }]);
  });

  it('已加载结果应跨实例复用，避免重复降级请求', async () => {
    const api = createRoleSourceApi({
      listRoles: vi.fn(async () => ({ data: [] })),
      pageRoles: vi.fn(async () => ({
        data: {
          records: [{ id: 'r2', roleName: '角色2' }]
        }
      }))
    });

    const stateA = usePermissionRoleOptions(api);
    await stateA.ensureRoleOptions();

    const stateB = usePermissionRoleOptions(api);
    await stateB.ensureRoleOptions();

    expect(api.listRoles).toHaveBeenCalledTimes(1);
    expect(api.pageRoles).toHaveBeenCalledTimes(1);
    expect(stateB.roleOptions.value).toEqual([{ id: 'r2', name: '角色2' }]);
  });

  it('首次失败后应允许再次重试加载', async () => {
    const api = createRoleSourceApi({
      listRoles: vi.fn(async () => {
        throw new Error('list failed');
      }),
      pageRoles: vi
        .fn()
        .mockRejectedValueOnce(new Error('page failed'))
        .mockResolvedValueOnce({
          data: {
            records: [{ id: 'r3', roleName: '角色3' }]
          }
        })
    });

    const state = usePermissionRoleOptions(api);

    await expect(state.ensureRoleOptions()).rejects.toThrow('page failed');
    expect(state.roleLoading.value).toBe(false);

    await expect(state.ensureRoleOptions()).resolves.toBeUndefined();
    expect(api.pageRoles).toHaveBeenCalledTimes(2);
    expect(state.roleOptions.value).toEqual([{ id: 'r3', name: '角色3' }]);
  });
});
