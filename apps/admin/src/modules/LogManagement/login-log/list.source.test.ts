import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('LogManagement/login-log list source', () => {
  it('登录日志页应切换为 ObTanStackTable，保留分页与操作列插槽', () => {
    expect(listSource).toContain('<ObTanStackTable');
    expect(listSource).toContain('@page-size-change="handleSizeChange"');
    expect(listSource).toContain('@page-current-change="handleCurrentChange"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
  });
});
