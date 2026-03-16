import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vite-plus/test';

describe('VxeTable source', () => {
  it('应在组件边界把 data 归一为数组后再传给 VxeGrid，避免 vxe 内部 slice 报错', () => {
    const source = readFileSync(
      new URL('./components/table/VxeTable.vue', import.meta.url),
      'utf8'
    );

    expect(source).toContain(
      'const normalizedData = computed<RowRecord[]>(() => (Array.isArray(props.data) ? props.data : []));'
    );
    expect(source).toContain(':data="normalizedData"');
    expect(source).not.toContain(':data="data"');
  });
});
