import { describe, expect, it } from 'vite-plus/test';

import panelSource from './ArticleAuditPanel.vue?raw';

describe('CmsManagement/audit ArticleAuditPanel source', () => {
  it('文章审核面板应切换为 ObTable，并保留分页与操作列能力', () => {
    expect(panelSource).toContain('<ObTable');
    expect(panelSource).not.toContain('<ObVxeTable');
    expect(panelSource).toContain('@page-size-change="handleSizeChange"');
    expect(panelSource).toContain('@page-current-change="handleCurrentChange"');
    expect(panelSource).toContain('<template #operation="{ row, size: actionSize }">');
  });
});
