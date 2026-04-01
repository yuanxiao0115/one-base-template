import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('LogManagement/sys-log list source', () => {
  it('操作日志页应切换为 ObTable，保留结果列与操作列插槽', () => {
    expect(listSource).toContain('<ObTable');
    expect(listSource).not.toContain('<ObVxeTable');
    expect(listSource).toContain('@page-size-change="handleSizeChange"');
    expect(listSource).toContain('@page-current-change="handleCurrentChange"');
    expect(listSource).toContain('<template #operationResult="{ row }">');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
  });
});
