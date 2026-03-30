import { describe, expect, it } from 'vite-plus/test';
import { resolveOrgManagerDelta } from './managerDelta';

describe('UserManagement/org/managerDelta', () => {
  it('无变更时应返回空差量', () => {
    const delta = resolveOrgManagerDelta(
      [{ userId: 'u1' }, { userId: 'u2' }],
      [
        { id: 'm1', userId: 'u1' },
        { id: 'm2', userId: 'u2' }
      ]
    );

    expect(delta).toEqual({
      addUserIds: [],
      removeIds: []
    });
  });

  it('应正确识别新增和删除项', () => {
    const delta = resolveOrgManagerDelta(
      [{ userId: 'u2' }, { userId: 'u3' }],
      [
        { id: 'm1', userId: 'u1' },
        { id: 'm2', userId: 'u2' }
      ]
    );

    expect(delta).toEqual({
      addUserIds: ['u3'],
      removeIds: ['m1']
    });
  });

  it('应去重并忽略空值', () => {
    const delta = resolveOrgManagerDelta(
      [{ userId: 'u1' }, { userId: 'u1' }, { userId: '' }],
      [
        { id: 'm1', userId: 'u2' },
        { id: '', userId: 'u3' }
      ]
    );

    expect(delta).toEqual({
      addUserIds: ['u1'],
      removeIds: ['m1']
    });
  });
});
