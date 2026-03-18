import { describe, expect, it } from 'vitest';

import {
  buildPagePermissionPayload,
  buildTemplateAuthorityPayload,
  normalizeAuthorityUsers,
  normalizeEditUsers,
  normalizePermissionGroup,
  normalizeRoleIds
} from './permission-payload';

describe('permission-payload', () => {
  it('应兼容 roleIds 与 roleList 混合结构', () => {
    expect(
      normalizeRoleIds({
        roleIds: [1, '2'],
        roleList: [{ id: '3' }, { roleId: 4 }, { roleId: '' }]
      })
    ).toEqual(['1', '2', '3', '4']);
  });

  it('应兼容页面权限用户列表与 userIds 回退', () => {
    expect(
      normalizePermissionGroup({
        roleIds: ['r1'],
        userList: [
          { id: 'u1', nickName: '用户1' },
          { userId: 'u2', name: '用户2' }
        ]
      })
    ).toEqual({
      roleIds: ['r1'],
      users: [
        { id: 'u1', nickName: '用户1' },
        { id: 'u2', nickName: '用户2' }
      ]
    });

    expect(
      normalizePermissionGroup({
        userIds: ['u3', 4]
      })
    ).toEqual({
      roleIds: [],
      users: [
        { id: 'u3', nickName: 'u3' },
        { id: '4', nickName: '4' }
      ]
    });
  });

  it('应根据授权类型生成页面权限提交 payload', () => {
    expect(
      buildPagePermissionPayload({
        authType: 'role',
        allowRoleIds: ['r1'],
        forbiddenRoleIds: ['r2'],
        configRoleIds: ['r3'],
        allowUsers: [],
        forbiddenUsers: [],
        configUsers: []
      })
    ).toEqual({
      authType: 'role',
      allowPerms: { roleIds: ['r1'], userIds: [] },
      forbiddenPerms: { roleIds: ['r2'], userIds: [] },
      configPerms: { roleIds: ['r3'], userIds: [] }
    });

    expect(
      buildPagePermissionPayload({
        authType: 'person',
        allowRoleIds: ['ignored'],
        forbiddenRoleIds: ['ignored'],
        configRoleIds: ['ignored'],
        allowUsers: [{ id: 'u1', nickName: '用户1' }],
        forbiddenUsers: [{ id: 'u2', nickName: '用户2' }],
        configUsers: [{ id: 'u3', nickName: '用户3' }]
      })
    ).toEqual({
      authType: 'person',
      allowPerms: { roleIds: [], userIds: ['u1'] },
      forbiddenPerms: { roleIds: [], userIds: ['u2'] },
      configPerms: { roleIds: [], userIds: ['u3'] }
    });
  });

  it('应兼容门户权限人员字段并生成提交 payload', () => {
    expect(
      normalizeAuthorityUsers([
        { typeId: 'u1', type: 1, typeName: '用户1' },
        { id: 'u2', nickName: '用户2' },
        { userId: 'u3', name: '用户3' }
      ])
    ).toEqual([
      { typeId: 'u1', type: 1, typeName: '用户1' },
      { typeId: 'u2', type: 0, typeName: '用户2' },
      { typeId: 'u3', type: 0, typeName: '用户3' }
    ]);

    expect(normalizeEditUsers([], ['u4'])).toEqual([{ typeId: 'u4', type: 0, typeName: 'u4' }]);

    expect(
      buildTemplateAuthorityPayload({
        authType: 'person',
        whiteUsers: [{ typeId: 'u1', type: 2, typeName: '用户1' }],
        blackUsers: [{ typeId: 'u2', type: 2, typeName: '用户2' }],
        editUsers: [{ typeId: 'u3', type: 2, typeName: '用户3' }],
        allowRoleIds: ['ignored'],
        forbiddenRoleIds: ['ignored'],
        configRoleIds: ['ignored']
      })
    ).toEqual({
      authType: 'person',
      whiteDTOS: [{ typeId: 'u1', type: 0, typeName: '用户1' }],
      blackDTOS: [{ typeId: 'u2', type: 0, typeName: '用户2' }],
      userIds: ['u3'],
      whiteList: [{ typeId: 'u1', type: 0, typeName: '用户1' }],
      blackList: [{ typeId: 'u2', type: 0, typeName: '用户2' }],
      editUsers: [{ typeId: 'u3', type: 0, typeName: '用户3' }],
      allowRole: { roleIds: [] },
      forbiddenRole: { roleIds: [] },
      configRole: { roleIds: [] }
    });
  });

  it('应在提交阶段去重 roleIds 与人员 ID', () => {
    expect(
      buildPagePermissionPayload({
        authType: 'role',
        allowRoleIds: ['r1', 'r1', 'r2', ''],
        forbiddenRoleIds: ['r2', 'r2', 'r3'],
        configRoleIds: ['r3', 'r3'],
        allowUsers: [],
        forbiddenUsers: [],
        configUsers: []
      })
    ).toEqual({
      authType: 'role',
      allowPerms: { roleIds: ['r1', 'r2'], userIds: [] },
      forbiddenPerms: { roleIds: ['r2', 'r3'], userIds: [] },
      configPerms: { roleIds: ['r3'], userIds: [] }
    });

    expect(
      buildPagePermissionPayload({
        authType: 'person',
        allowRoleIds: [],
        forbiddenRoleIds: [],
        configRoleIds: [],
        allowUsers: [
          { id: 'u1', nickName: '用户1' },
          { id: 'u1', nickName: '用户1-重复' },
          { id: '', nickName: '空ID' }
        ],
        forbiddenUsers: [
          { id: 'u2', nickName: '用户2' },
          { id: 'u2', nickName: '用户2-重复' }
        ],
        configUsers: [{ id: 'u3', nickName: '用户3' }]
      })
    ).toEqual({
      authType: 'person',
      allowPerms: { roleIds: [], userIds: ['u1'] },
      forbiddenPerms: { roleIds: [], userIds: ['u2'] },
      configPerms: { roleIds: [], userIds: ['u3'] }
    });

    expect(
      buildTemplateAuthorityPayload({
        authType: 'person',
        whiteUsers: [
          { typeId: 'u1', type: 1, typeName: '用户1' },
          { typeId: 'u1', type: 2, typeName: '用户1-重复' }
        ],
        blackUsers: [
          { typeId: 'u2', type: 1, typeName: '用户2' },
          { typeId: '', type: 1, typeName: '空ID' }
        ],
        editUsers: [
          { typeId: 'u3', type: 1, typeName: '用户3' },
          { typeId: 'u3', type: 2, typeName: '用户3-重复' }
        ],
        allowRoleIds: ['r1', 'r1'],
        forbiddenRoleIds: ['r2', 'r2'],
        configRoleIds: ['r3', 'r3']
      })
    ).toEqual({
      authType: 'person',
      whiteDTOS: [{ typeId: 'u1', type: 0, typeName: '用户1' }],
      blackDTOS: [{ typeId: 'u2', type: 0, typeName: '用户2' }],
      userIds: ['u3'],
      whiteList: [{ typeId: 'u1', type: 0, typeName: '用户1' }],
      blackList: [{ typeId: 'u2', type: 0, typeName: '用户2' }],
      editUsers: [{ typeId: 'u3', type: 0, typeName: '用户3' }],
      allowRole: { roleIds: [] },
      forbiddenRole: { roleIds: [] },
      configRole: { roleIds: [] }
    });
  });
});
