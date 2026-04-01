import { describe, expect, it } from 'vite-plus/test';

import panelSource from './CommentAuditPanel.vue?raw';

describe('CmsManagement/audit CommentAuditPanel source', () => {
  it('评论审核面板应切换为 ObTable，并保留选择列与分页能力', () => {
    expect(panelSource).toContain('<ObTable');
    expect(panelSource).not.toContain('<ObVxeTable');
    expect(panelSource).toContain('@selection-change="onSelectionChange"');
    expect(panelSource).toContain('@page-size-change="handleSizeChange"');
    expect(panelSource).toContain('@page-current-change="handleCurrentChange"');
  });
});
