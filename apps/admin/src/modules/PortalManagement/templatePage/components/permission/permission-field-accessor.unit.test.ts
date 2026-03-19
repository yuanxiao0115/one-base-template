import { describe, expect, it } from 'vite-plus/test';

import { createPermissionFieldAccessor } from './permission-field-accessor';

describe('permission-field-accessor', () => {
  it('应根据字段映射读取与写回对应列表', () => {
    const form = {
      allowUsers: [{ id: 'u1' }],
      forbiddenUsers: [{ id: 'u2' }],
      configUsers: [] as Array<{ id: string }>
    };

    const accessor = createPermissionFieldAccessor<
      typeof form,
      'allow' | 'forbidden' | 'config',
      { id: string }
    >(form, {
      allow: 'allowUsers',
      forbidden: 'forbiddenUsers',
      config: 'configUsers'
    });

    expect(accessor.getByField('allow')).toEqual([{ id: 'u1' }]);
    expect(accessor.getByField('forbidden')).toEqual([{ id: 'u2' }]);

    accessor.setByField('config', [{ id: 'u3' }]);
    expect(form.configUsers).toEqual([{ id: 'u3' }]);
  });

  it('应保持字段映射顺序并可覆盖写回', () => {
    const form = {
      whiteUsers: [{ typeId: 'u1' }],
      blackUsers: [] as Array<{ typeId: string }>,
      editUsers: [{ typeId: 'u2' }]
    };

    const accessor = createPermissionFieldAccessor<
      typeof form,
      'white' | 'black' | 'edit',
      { typeId: string }
    >(form, {
      white: 'whiteUsers',
      black: 'blackUsers',
      edit: 'editUsers'
    });

    accessor.setByField('white', [{ typeId: 'u3' }]);
    accessor.setByField('black', [{ typeId: 'u4' }]);

    expect(accessor.getByField('white')).toEqual([{ typeId: 'u3' }]);
    expect(accessor.getByField('black')).toEqual([{ typeId: 'u4' }]);
    expect(accessor.getByField('edit')).toEqual([{ typeId: 'u2' }]);
  });
});
