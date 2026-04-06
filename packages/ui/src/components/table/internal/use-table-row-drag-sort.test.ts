// @vitest-environment happy-dom

import { computed, defineComponent, h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vite-plus/test';
import type { TableRowDragSortPayload } from '../types';
import { useTableRowDragSort } from './use-table-row-drag-sort';

const sortableDestroy = vi.fn();
const sortableCreate = vi.fn((_element: HTMLElement, _options?: Record<string, unknown>) => ({
  destroy: sortableDestroy
}));

vi.mock('sortablejs', () => ({
  default: {
    create: sortableCreate
  }
}));

type RowRecord = Record<string, unknown>;

async function flushRowDragInit() {
  await nextTick();
  await Promise.resolve();
  await vi.dynamicImportSettled();
  await nextTick();
}

describe('useTableRowDragSort', () => {
  it('相同 tbody 与配置重复初始化时不重复创建 Sortable 实例', async () => {
    sortableCreate.mockClear();
    sortableDestroy.mockClear();

    const tbody = document.createElement('tbody');
    tbody.append(document.createElement('tr'));
    tbody.append(document.createElement('tr'));
    const enabled = ref(true);
    const rows = ref<RowRecord[]>([{ id: 1 }, { id: 2 }]);
    const config = ref({
      animation: 120
    });
    const payloadList: TableRowDragSortPayload[] = [];

    const Harness = defineComponent({
      setup(_, { expose }) {
        const api = useTableRowDragSort({
          enabled: computed(() => enabled.value),
          data: computed(() => rows.value),
          config: computed(() => config.value),
          resolveTbody: () => tbody,
          onSortEnd: (payload) => {
            payloadList.push(payload);
          }
        });
        expose(api);
        return () => h('div');
      }
    });

    const wrapper = mount(Harness);
    const vm = wrapper.vm as unknown as { initSortable: () => Promise<void> };

    await flushRowDragInit();
    expect(sortableCreate).toHaveBeenCalledTimes(1);

    await vm.initSortable();
    await flushRowDragInit();
    expect(sortableCreate).toHaveBeenCalledTimes(1);

    const firstRow = tbody.querySelector('tr');
    expect(firstRow?.getAttribute('tabindex')).toBe('0');
    expect(firstRow?.getAttribute('aria-label')).toContain('Alt+方向键');

    firstRow?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true })
    );
    expect(payloadList).toHaveLength(1);
    expect(payloadList[0]).toMatchObject({ oldIndex: 0, newIndex: 1 });

    wrapper.unmount();
  });

  it('Sortable onEnd 应忽略无效索引并在禁用后销毁实例', async () => {
    sortableCreate.mockClear();
    sortableDestroy.mockClear();

    const tbody = document.createElement('tbody');
    tbody.append(document.createElement('tr'));
    tbody.append(document.createElement('tr'));
    const enabled = ref(true);
    const rows = ref<RowRecord[]>([{ id: 1 }, { id: 2 }]);
    const config = ref({
      animation: 180
    });
    const payloadList: TableRowDragSortPayload[] = [];

    const Harness = defineComponent({
      setup(_, { expose }) {
        const api = useTableRowDragSort({
          enabled: computed(() => enabled.value),
          data: computed(() => rows.value),
          config: computed(() => config.value),
          resolveTbody: () => tbody,
          onSortEnd: (payload) => {
            payloadList.push(payload);
          }
        });
        expose(api);
        return () => h('div');
      }
    });

    const wrapper = mount(Harness);
    await flushRowDragInit();

    const firstCreateCall = sortableCreate.mock.calls[0] as unknown as
      | [unknown, { onEnd?: (event: { oldIndex?: number; newIndex?: number }) => void }]
      | undefined;
    const sortableOptions = firstCreateCall?.[1];
    expect(sortableOptions?.onEnd).toBeTypeOf('function');

    sortableOptions?.onEnd?.({ oldIndex: 0, newIndex: 0 });
    sortableOptions?.onEnd?.({ oldIndex: 10, newIndex: 0 });
    sortableOptions?.onEnd?.({ oldIndex: 0, newIndex: 10 });
    sortableOptions?.onEnd?.({ oldIndex: 0, newIndex: 1 });

    expect(payloadList).toHaveLength(1);
    expect(payloadList[0]).toMatchObject({ oldIndex: 0, newIndex: 1 });

    enabled.value = false;
    await flushRowDragInit();
    expect(sortableDestroy).toHaveBeenCalledTimes(1);
    expect(tbody.querySelector('tr')?.getAttribute('tabindex')).toBeNull();

    wrapper.unmount();
  });
});
