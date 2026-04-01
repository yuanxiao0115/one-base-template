// @vitest-environment happy-dom

import { computed, ref } from 'vue';
import type { TableInstance } from 'element-plus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { useTableLayout } from './use-table-layout';

describe('useTableLayout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('高度不变时 forceLayout 仍会触发 doLayout', async () => {
    const wrapperRef = ref<HTMLDivElement>();
    const tableRef = ref<TableInstance | null>(null);
    const adaptiveEnabled = ref(true);
    const adaptiveConfig = ref({
      offsetBottom: 110,
      timeout: 0
    });
    const hasPagination = ref(false);

    const tableRoot = document.createElement('div');
    tableRoot.className = 'el-table';
    const innerWrapper = document.createElement('div');
    innerWrapper.className = 'el-table__inner-wrapper';
    tableRoot.appendChild(innerWrapper);

    Object.defineProperty(innerWrapper, 'getBoundingClientRect', {
      value: () => ({
        top: 120,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0
      })
    });

    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', {
      value: 560
    });

    const doLayout = vi.fn();
    wrapperRef.value = container;
    tableRef.value = {
      $el: tableRoot,
      doLayout
    } as unknown as TableInstance;

    const layout = useTableLayout({
      wrapperRef,
      tableRef,
      adaptiveEnabled: computed(() => adaptiveEnabled.value),
      adaptiveConfig: computed(() => adaptiveConfig.value),
      hasPagination: computed(() => hasPagination.value)
    });

    layout.scheduleAdaptiveResize();
    await vi.runAllTimersAsync();
    expect(doLayout).toHaveBeenCalledTimes(1);

    layout.scheduleAdaptiveResize();
    await vi.runAllTimersAsync();
    expect(doLayout).toHaveBeenCalledTimes(1);

    layout.scheduleAdaptiveResize(true);
    await vi.runAllTimersAsync();
    expect(doLayout).toHaveBeenCalledTimes(2);
  });
});
