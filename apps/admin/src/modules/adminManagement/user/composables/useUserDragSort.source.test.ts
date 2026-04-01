import { describe, expect, it } from 'vite-plus/test';

import source from './useUserDragSort.ts?raw';

describe('adminManagement/user useUserDragSort source', () => {
  it('拖拽定位应基于 ObTable 的 Element tbody，不再依赖 vxe 选择器', () => {
    expect(source).toContain("tableEl.querySelector('.el-table__body-wrapper tbody')");
    expect(source).not.toContain('vxe-table--body-wrapper');
    expect(source).not.toContain('vxe-table--main-body');
  });
});
