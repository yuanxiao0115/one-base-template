import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('PortalManagement/templatePage list source', () => {
  it('门户模板页应切换为 ObTable，并保留分页与操作列能力', () => {
    expect(listSource).toContain('<ObTable');
    expect(listSource).not.toContain('<ObVxeTable');
    expect(listSource).toContain('@page-size-change="handlePageSizeChange"');
    expect(listSource).toContain('@page-current-change="handlePageCurrentChange"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
  });
});
