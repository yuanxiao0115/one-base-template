import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('SystemManagement/dict list source', () => {
  it('字典管理页主表与字典项表都应切换为 ObTable', () => {
    expect(listSource).toContain('<ObTable');
    expect(listSource).not.toContain('<ObVxeTable');
    expect(listSource.match(/<ObTable/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(listSource).toContain('@selection-change="handleSelectionChange"');
    expect(listSource).toContain('@selection-change="handleItemSelectionChange"');
  });
});
