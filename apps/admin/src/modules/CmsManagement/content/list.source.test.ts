import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('CmsManagement/content list source', () => {
  it('内容管理页应切换为 ObTable，并保留分页与操作列能力', () => {
    expect(listSource).toContain('<ObTable');
    expect(listSource).not.toContain('<ObVxeTable');
    expect(listSource).toContain('@page-size-change="table.handleSizeChange"');
    expect(listSource).toContain('@page-current-change="table.handleCurrentChange"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
  });
});
