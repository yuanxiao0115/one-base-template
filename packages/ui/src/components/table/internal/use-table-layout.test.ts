// @vitest-environment happy-dom

import { computed, nextTick, ref } from 'vue';
import type { TableInstance } from 'element-plus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { useTableLayout } from './use-table-layout';

describe('useTableLayout', () => {
  let observeSpy: ReturnType<typeof vi.fn>;
  let unobserveSpy: ReturnType<typeof vi.fn>;
  let disconnectSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    observeSpy = vi.fn();
    unobserveSpy = vi.fn();
    disconnectSpy = vi.fn();

    vi.stubGlobal(
      'ResizeObserver',
      class MockResizeObserver {
        observe = observeSpy;
        unobserve = unobserveSpy;
        disconnect = disconnectSpy;
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
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

  it('关闭 adaptive 后应移除表头 sticky 样式', async () => {
    const wrapperRef = ref<HTMLDivElement>();
    const tableRef = ref<TableInstance | null>(null);
    const adaptiveEnabled = ref(true);
    const adaptiveConfig = ref({
      offsetBottom: 110,
      timeout: 0,
      fixHeader: true
    });
    const hasPagination = ref(false);

    const tableRoot = document.createElement('div');
    tableRoot.className = 'el-table';
    const headerWrapper = document.createElement('div');
    headerWrapper.className = 'el-table__header-wrapper';
    tableRoot.appendChild(headerWrapper);

    const container = document.createElement('div');
    wrapperRef.value = container;
    tableRef.value = {
      $el: tableRoot,
      doLayout: vi.fn()
    } as unknown as TableInstance;

    const layout = useTableLayout({
      wrapperRef,
      tableRef,
      adaptiveEnabled: computed(() => adaptiveEnabled.value),
      adaptiveConfig: computed(() => adaptiveConfig.value),
      hasPagination: computed(() => hasPagination.value)
    });

    await layout.setHeaderSticky(7);
    expect(headerWrapper.style.position).toBe('sticky');
    expect(headerWrapper.style.top).toBe('0px');
    expect(headerWrapper.style.zIndex).toBe('7');

    adaptiveEnabled.value = false;
    layout.setAdaptive();
    await nextTick();
    await Promise.resolve();

    expect(headerWrapper.style.position).toBe('');
    expect(headerWrapper.style.top).toBe('');
    expect(headerWrapper.style.zIndex).toBe('');
  });

  it('应在无 tableRef.$el 时从 wrapper 中解析 DOM，并支持 hover 色变量设置', async () => {
    const wrapperRef = ref<HTMLDivElement>();
    const tableRef = ref<TableInstance | null>(null);
    const adaptiveEnabled = ref(false);
    const adaptiveConfig = ref({
      offsetBottom: 110,
      timeout: 0
    });
    const hasPagination = ref(false);

    const wrapper = document.createElement('div');
    const tableRoot = document.createElement('div');
    tableRoot.className = 'el-table';
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'el-table__inner-wrapper';
    const bodyWrapper = document.createElement('div');
    bodyWrapper.className = 'el-table__body-wrapper';
    const tbody = document.createElement('tbody');
    bodyWrapper.appendChild(tbody);
    tableRoot.append(tableWrapper, bodyWrapper);
    wrapper.appendChild(tableRoot);
    wrapperRef.value = wrapper;

    const layout = useTableLayout({
      wrapperRef,
      tableRef,
      adaptiveEnabled: computed(() => adaptiveEnabled.value),
      adaptiveConfig: computed(() => adaptiveConfig.value),
      hasPagination: computed(() => hasPagination.value)
    });

    const doms = layout.getTableDoms();
    expect(doms.tableRoot).toBe(tableRoot);
    expect(layout.resolveTableBodyTbody()).toBe(tbody);

    layout.applyRowHoverBgColor('  #f0f0f0  ');
    expect(tableWrapper.style.getPropertyValue('--el-table-row-hover-bg-color')).toBe('#f0f0f0');

    layout.applyRowHoverBgColor(' ');
    expect(tableWrapper.style.getPropertyValue('--el-table-row-hover-bg-color')).toBe('');
  });

  it('应在 adaptive 开启时绑定 observer，并在 dispose 时解绑', async () => {
    const wrapperRef = ref<HTMLDivElement>();
    const tableRef = ref<TableInstance | null>(null);
    const adaptiveEnabled = ref(true);
    const adaptiveConfig = ref({
      offsetBottom: 60,
      timeout: 0,
      fixHeader: false
    });
    const hasPagination = ref(false);

    const wrapper = document.createElement('div');
    Object.defineProperty(wrapper, 'clientHeight', {
      value: 420,
      configurable: true
    });
    const tableRoot = document.createElement('div');
    tableRoot.className = 'el-table';
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'el-table__inner-wrapper';
    Object.defineProperty(tableWrapper, 'getBoundingClientRect', {
      value: () => ({ top: 100, left: 0, right: 0, bottom: 0, width: 0, height: 0 })
    });
    const header = document.createElement('div');
    header.className = 'el-table__header-wrapper';
    tableRoot.append(tableWrapper, header);
    wrapper.appendChild(tableRoot);

    const doLayout = vi.fn();
    wrapperRef.value = wrapper;
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

    layout.setAdaptive();
    await vi.runAllTimersAsync();
    expect(observeSpy).toHaveBeenCalledTimes(1);
    expect(doLayout).toHaveBeenCalled();
    expect(header.style.position).toBe('');

    window.dispatchEvent(new Event('resize'));
    await vi.runAllTimersAsync();
    expect(doLayout).toHaveBeenCalledTimes(2);

    layout.disposeLayout();
    expect(unobserveSpy).toHaveBeenCalledTimes(1);
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
