import { nextTick, ref, type ComputedRef, type Ref } from 'vue';
import type { TableInstance } from 'element-plus';
import type { AdaptiveConfig } from '../types';
import { queryFirstElement, resolveAdaptiveHeight } from './table-helpers';

export interface TableDomRefs {
  tableRoot: HTMLElement | null;
  tableWrapper: HTMLElement | null;
  tableHeaderRef: HTMLElement | null;
  tableBodyRef: HTMLElement | null;
}

interface UseTableLayoutOptions {
  wrapperRef: Ref<HTMLDivElement | undefined>;
  tableRef: Ref<TableInstance | null>;
  adaptiveEnabled: ComputedRef<boolean>;
  adaptiveConfig: ComputedRef<AdaptiveConfig | undefined>;
  hasPagination: ComputedRef<boolean>;
}

type TableRuntimeInstance = TableInstance & { $el?: unknown };

export function useTableLayout(options: UseTableLayoutOptions) {
  const adaptiveHeight = ref<number>();
  let resizeObserver: ResizeObserver | null = null;
  let observedTarget: HTMLElement | null = null;
  let adaptiveWindowResizeHandler: (() => void) | null = null;
  let adaptiveResizeTimer: ReturnType<typeof setTimeout> | null = null;

  function clearAdaptiveResizeTimer() {
    if (!adaptiveResizeTimer) {
      return;
    }
    clearTimeout(adaptiveResizeTimer);
    adaptiveResizeTimer = null;
  }

  function resolveTableRootElement(): HTMLElement | null {
    const table = options.tableRef.value as TableRuntimeInstance | null;
    if (table?.$el instanceof HTMLElement) {
      return table.$el;
    }
    return queryFirstElement(options.wrapperRef.value, ['.ob-table__table', '.el-table']);
  }

  function getTableDoms(): TableDomRefs {
    const tableRoot = resolveTableRootElement();
    if (!tableRoot) {
      return {
        tableRoot: null,
        tableWrapper: null,
        tableHeaderRef: null,
        tableBodyRef: null
      };
    }

    const tableWrapper = queryFirstElement(tableRoot, [
      '.el-table__inner-wrapper',
      '.el-table__body-wrapper',
      '.el-table__main-wrapper'
    ]);
    const tableHeaderRef = queryFirstElement(tableRoot, [
      '.el-table__header-wrapper',
      '.el-table__fixed-header-wrapper'
    ]);
    const tableBodyRef = queryFirstElement(tableRoot, [
      '.el-table__body-wrapper',
      '.el-table__fixed-body-wrapper',
      '.el-scrollbar__wrap'
    ]);

    return {
      tableRoot,
      tableWrapper,
      tableHeaderRef,
      tableBodyRef
    };
  }

  function resolveTableBodyTbody() {
    const { tableBodyRef, tableRoot } = getTableDoms();
    const fromBody = tableBodyRef?.querySelector('tbody');
    if (fromBody instanceof HTMLElement) {
      return fromBody;
    }
    const fromRoot = tableRoot?.querySelector('.el-table__body-wrapper tbody');
    return fromRoot instanceof HTMLElement ? fromRoot : null;
  }

  function applyRowHoverBgColor(color?: string) {
    const { tableWrapper } = getTableDoms();
    if (!tableWrapper) {
      return;
    }
    const nextColor = typeof color === 'string' ? color.trim() : '';
    if (!nextColor) {
      tableWrapper.style.removeProperty('--el-table-row-hover-bg-color');
      return;
    }
    tableWrapper.style.setProperty('--el-table-row-hover-bg-color', nextColor, 'important');
  }

  async function setHeaderSticky(zIndex = options.adaptiveConfig.value?.zIndex ?? 3) {
    await nextTick();
    const { tableRoot, tableHeaderRef } = getTableDoms();
    const stickyHeaders = new Set<HTMLElement>();
    if (tableHeaderRef) {
      stickyHeaders.add(tableHeaderRef);
    }
    tableRoot
      ?.querySelectorAll('.el-table__header-wrapper, .el-table__fixed-header-wrapper')
      .forEach((headerNode) => {
        if (headerNode instanceof HTMLElement) {
          stickyHeaders.add(headerNode);
        }
      });

    if (stickyHeaders.size === 0) {
      return;
    }

    stickyHeaders.forEach((headerRef) => {
      headerRef.style.position = 'sticky';
      headerRef.style.top = '0';
      headerRef.style.zIndex = String(zIndex);
    });
  }

  function updateAdaptiveHeight() {
    if (typeof window === 'undefined') {
      adaptiveHeight.value = undefined;
      return;
    }

    const { tableWrapper } = getTableDoms();
    const heightAnchor = tableWrapper ?? options.wrapperRef.value;
    if (!heightAnchor) {
      adaptiveHeight.value = undefined;
      return;
    }

    const paginationHeight = options.hasPagination.value ? 52 : 0;
    const offsetBottom = options.adaptiveConfig.value?.offsetBottom ?? 110;
    const nextHeight = resolveAdaptiveHeight({
      viewportHeight: window.innerHeight,
      elementTop: heightAnchor.getBoundingClientRect().top,
      offsetBottom,
      paginationHeight,
      containerHeight: options.wrapperRef.value?.clientHeight,
      minHeight: 120
    });
    const shouldRelayout = adaptiveHeight.value !== nextHeight;
    adaptiveHeight.value = nextHeight;
    if (!shouldRelayout) {
      return;
    }
    void nextTick(() => {
      options.tableRef.value?.doLayout();
    });
  }

  function scheduleAdaptiveResize() {
    clearAdaptiveResizeTimer();
    const timeout = options.adaptiveConfig.value?.timeout ?? 16;
    adaptiveResizeTimer = setTimeout(() => {
      adaptiveResizeTimer = null;
      updateAdaptiveHeight();
    }, timeout);
  }

  function bindAdaptiveObserver() {
    if (!options.adaptiveEnabled.value || typeof window === 'undefined') {
      return;
    }

    const target = options.wrapperRef.value;
    if (!target) {
      return;
    }

    if (!adaptiveWindowResizeHandler) {
      adaptiveWindowResizeHandler = () => {
        scheduleAdaptiveResize();
      };
      window.addEventListener('resize', adaptiveWindowResizeHandler);
    }

    if (typeof ResizeObserver !== 'undefined') {
      if (!resizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          scheduleAdaptiveResize();
        });
      }
      if (observedTarget !== target) {
        if (observedTarget) {
          resizeObserver.unobserve(observedTarget);
        }
        resizeObserver.observe(target);
        observedTarget = target;
      }
    }

    scheduleAdaptiveResize();

    if (options.adaptiveConfig.value?.fixHeader !== false) {
      void setHeaderSticky(options.adaptiveConfig.value?.zIndex ?? 3);
    }
  }

  function unbindAdaptiveObserver() {
    if (resizeObserver && observedTarget) {
      resizeObserver.unobserve(observedTarget);
    }
    resizeObserver?.disconnect();
    resizeObserver = null;
    observedTarget = null;

    if (adaptiveWindowResizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', adaptiveWindowResizeHandler);
    }
    adaptiveWindowResizeHandler = null;

    clearAdaptiveResizeTimer();
  }

  function setAdaptive() {
    if (!options.adaptiveEnabled.value) {
      unbindAdaptiveObserver();
      adaptiveHeight.value = undefined;
      void nextTick(() => {
        options.tableRef.value?.doLayout();
      });
      return;
    }
    bindAdaptiveObserver();
  }

  function disposeLayout() {
    unbindAdaptiveObserver();
  }

  return {
    adaptiveHeight,
    getTableDoms,
    resolveTableBodyTbody,
    applyRowHoverBgColor,
    setHeaderSticky,
    scheduleAdaptiveResize,
    setAdaptive,
    disposeLayout
  };
}
