import { describe, expect, it } from 'vite-plus/test';

import {
  PAGE_PERMISSION_ROLE_FIELDS,
  PAGE_PERMISSION_USER_FIELDS,
  PORTAL_AUTHORITY_ROLE_FIELDS,
  PORTAL_AUTHORITY_USER_FIELDS
} from './permission-form-fields';

describe('permission-form-fields', () => {
  it('应提供页面权限的角色与人员字段顺序', () => {
    expect(PAGE_PERMISSION_ROLE_FIELDS).toEqual([
      { key: 'allowRoleIds', label: '可访问角色' },
      { key: 'forbiddenRoleIds', label: '不可访问角色' },
      { key: 'configRoleIds', label: '可维护角色' }
    ]);

    expect(PAGE_PERMISSION_USER_FIELDS).toEqual([
      { field: 'allow', label: '可访问者' },
      { field: 'forbidden', label: '不可访问者' },
      { field: 'config', label: '可维护人员' }
    ]);
  });

  it('应提供门户权限的角色与人员字段顺序', () => {
    expect(PORTAL_AUTHORITY_ROLE_FIELDS).toEqual([
      { key: 'allowRoleIds', label: '可访问角色' },
      { key: 'forbiddenRoleIds', label: '不可访问角色' },
      { key: 'configRoleIds', label: '可维护角色' }
    ]);

    expect(PORTAL_AUTHORITY_USER_FIELDS).toEqual([
      { field: 'white', label: '可访问人员' },
      { field: 'black', label: '不可访问人员' },
      { field: 'edit', label: '可维护人员' }
    ]);
  });
});
