import { describe, expect, it } from 'vite-plus/test';

import { toUserForm, toUserPayload, type UserForm } from './form';
import type { UserDetailData } from './types';

describe('UserManagement/user/form', () => {
  it('toUserForm 应保留组织与岗位空数组兜底', () => {
    const detail: UserDetailData = {
      userInfo: {
        id: 'user-1',
        nickName: '张三',
        userAccount: 'zhangsan',
        phone: '13800000000',
        phoneShow: true,
        mail: 'zhangsan@example.com',
        gender: 1,
        isEnable: true,
        userType: 0,
        isExternal: false,
        remark: '备注',
        roleIds: ['role-1'],
        userOrgs: []
      }
    };

    const form = toUserForm(detail);

    expect(form.userOrgs).toHaveLength(1);
    expect(form.userOrgs[0]?.postVos).toHaveLength(1);
    expect(form.roleIds).toEqual(['role-1']);
  });

  it('toUserPayload 应保留标量字段原值，仅收口数组边界', () => {
    const form = {
      id: 'user-1',
      nickName: ' 张三 ',
      userAccount: ' zhangsan ',
      phone: ' 13800000000 ',
      phoneShow: false,
      mail: ' zhangsan@example.com ',
      gender: 2,
      isEnable: false,
      userType: 1,
      isExternal: true,
      remark: ' 备注 ',
      roleIds: ['role-1', ''],
      userOrgs: [
        {
          _key: 'org-1',
          id: 'org-row-1',
          orgId: 'org-1',
          orgRankType: 3,
          ownSort: 8,
          sort: 9,
          status: 1,
          postVos: [
            {
              _key: 'post-1',
              id: 'post-row-1',
              postId: 'post-1',
              sort: 5,
              status: 1
            },
            {
              _key: 'post-2',
              postId: '',
              sort: 6,
              status: 1
            }
          ]
        },
        {
          _key: 'org-2',
          orgId: '',
          orgRankType: null,
          ownSort: 1,
          sort: 1,
          status: 1,
          postVos: []
        }
      ],
      avatar: '',
      createTime: ''
    } satisfies UserForm;

    expect(toUserPayload(form)).toEqual({
      id: 'user-1',
      nickName: ' 张三 ',
      userAccount: ' zhangsan ',
      phone: ' 13800000000 ',
      phoneShow: false,
      mail: ' zhangsan@example.com ',
      gender: 2,
      isEnable: false,
      userType: 1,
      isExternal: true,
      remark: ' 备注 ',
      roleIds: ['role-1'],
      userOrgs: [
        {
          id: 'org-row-1',
          orgId: 'org-1',
          orgRankType: 3,
          ownSort: 8,
          sort: 9,
          status: 1,
          postVos: [
            {
              id: 'post-row-1',
              postId: 'post-1',
              sort: 5,
              status: 1
            }
          ]
        }
      ]
    });
  });
});
