import { describe, expect, it } from 'vite-plus/test';
import type { UserSavePayload } from '../types';
import { validateUserSavePayload } from './validateUserSavePayload';

function createValidPayload(): UserSavePayload {
  return {
    nickName: '测试用户',
    userAccount: 'test_user',
    phone: '13800138000',
    phoneShow: true,
    mail: 'test@example.com',
    gender: 1,
    isEnable: true,
    userType: 0,
    isExternal: false,
    remark: '',
    roleIds: [],
    userOrgs: [
      {
        orgId: 'org-1',
        postVos: [
          {
            postId: 'post-1'
          }
        ]
      }
    ]
  };
}

describe('UserManagement/user/validateUserSavePayload', () => {
  it('合法数据不应抛错', () => {
    const payload = createValidPayload();
    expect(() => validateUserSavePayload(payload)).not.toThrow();
  });

  it('缺少组织应抛错', () => {
    const payload = createValidPayload();
    payload.userOrgs = [];
    expect(() => validateUserSavePayload(payload)).toThrow('请至少配置一个组织岗位');
  });

  it('组织缺少 orgId 应抛错', () => {
    const payload = createValidPayload();
    payload.userOrgs[0]!.orgId = '';
    expect(() => validateUserSavePayload(payload)).toThrow('第1条组织信息缺少组织');
  });

  it('组织重复应抛错', () => {
    const payload = createValidPayload();
    payload.userOrgs.push({
      orgId: 'org-1',
      postVos: [
        {
          postId: 'post-2'
        }
      ]
    });
    expect(() => validateUserSavePayload(payload)).toThrow(
      '第2条组织信息重复，请勿重复选择同一组织'
    );
  });

  it('组织缺少岗位应抛错', () => {
    const payload = createValidPayload();
    payload.userOrgs[0]!.postVos = [];
    expect(() => validateUserSavePayload(payload)).toThrow('第1条组织信息至少需要一个岗位');
  });

  it('组织岗位重复应抛错', () => {
    const payload = createValidPayload();
    payload.userOrgs[0]!.postVos?.push({
      postId: 'post-1'
    });
    expect(() => validateUserSavePayload(payload)).toThrow('第1条组织信息中第2个岗位重复');
  });
});
