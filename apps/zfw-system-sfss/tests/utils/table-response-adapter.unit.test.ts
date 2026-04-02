import { describe, expect, it } from 'vite-plus/test';
import { appTableResponseAdapter } from '@/utils/table-response-adapter';

describe('utils/table-response-adapter', () => {
  it('应兼容 data.records + data.total 分页结构', () => {
    const response = {
      data: {
        records: [{ id: 1 }, { id: 2 }],
        total: 10,
        currentPage: 2,
        pageSize: 20
      }
    };

    const result = appTableResponseAdapter(response);
    expect(result.records).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.total).toBe(10);
    expect(result.currentPage).toBe(2);
    expect(result.pageSize).toBe(20);
    expect(result.raw).toBe(response);
  });

  it('应兼容数组响应并回退 total=数组长度', () => {
    const response = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = appTableResponseAdapter(response);

    expect(result.records).toEqual(response);
    expect(result.total).toBe(3);
    expect(result.currentPage).toBeUndefined();
    expect(result.pageSize).toBeUndefined();
    expect(result.raw).toBe(response);
  });
});
