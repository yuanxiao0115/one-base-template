import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('CmsManagement/column list source', () => {
  it('栏目管理页应切换为 ObTable，并保留树表与操作列能力', () => {
    expect(listSource).toContain('<ObTable');
    expect(listSource).not.toContain('<ObVxeTable');
    expect(listSource).toContain(':tree-config="tableTreeConfig"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
  });
});
