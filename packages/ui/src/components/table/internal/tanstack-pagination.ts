import { computed, type ComputedRef } from 'vue';
import type { TablePagination } from '../types';

type PagerLayoutName = 'Total' | 'Sizes' | 'PrevPage' | 'Number' | 'NextPage' | 'FullJump';

function resolvePagerLayouts(layout?: string): PagerLayoutName[] {
  if (!layout) {
    return ['Total', 'Sizes', 'PrevPage', 'Number', 'NextPage', 'FullJump'];
  }

  const layoutMap: Record<string, PagerLayoutName> = {
    total: 'Total',
    sizes: 'Sizes',
    prev: 'PrevPage',
    pager: 'Number',
    next: 'NextPage',
    jumper: 'FullJump'
  };

  const layouts = layout
    .split(',')
    .map((item) => item.trim())
    .map((item) => layoutMap[item])
    .filter((item): item is PagerLayoutName => Boolean(item));

  return layouts.length > 0
    ? layouts
    : ['Total', 'Sizes', 'PrevPage', 'Number', 'NextPage', 'FullJump'];
}

export function useTanStackPagerProps(options: {
  pagination: ComputedRef<TablePagination | null>;
  paginationSmall: ComputedRef<boolean>;
}) {
  return computed<Record<string, unknown> | null>(() => {
    const pagination = options.pagination.value;
    if (!pagination) {
      return null;
    }

    return {
      autoHidden: false,
      total: Number(pagination.total ?? 0),
      currentPage: Number(pagination.currentPage ?? 1),
      pageSize: Number(pagination.pageSize ?? 10),
      pageSizes:
        Array.isArray(pagination.pageSizes) && pagination.pageSizes.length > 0
          ? pagination.pageSizes
          : [10, 20, 50, 100],
      background: pagination.background ?? true,
      layouts: resolvePagerLayouts(pagination.layout),
      size: options.paginationSmall.value ? 'small' : undefined
    };
  });
}
