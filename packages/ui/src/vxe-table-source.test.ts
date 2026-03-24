import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vite-plus/test';

describe('VxeTable source', () => {
  const source = readFileSync(new URL('./components/table/VxeTable.vue', import.meta.url), 'utf8');

  it('应在组件边界把 data 归一为数组后再传给 VxeGrid，避免 vxe 内部 slice 报错', () => {
    expect(source).toContain(
      'const normalizedData = computed<RowRecord[]>(() => (Array.isArray(props.data) ? props.data : []));'
    );
    expect(source).toContain(':data="normalizedData"');
    expect(source).not.toContain(':data="data"');
  });

  it('应提供首屏骨架门禁，避免空数据首载抖动', () => {
    expect(source).toContain('enableFirstLoadSkeleton: true');
    expect(source).toContain('const shouldUseFirstLoadSkeleton = computed(');
    expect(source).toContain('<div v-if="showFirstLoadSkeleton" class="ob-vxe-table__skeleton">');
  });
});
