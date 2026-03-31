import { computed, type ComputedRef } from 'vue';
import type { TablePagination } from '../types';

interface TanStackPagerProps {
  total: number;
  currentPage: number;
  pageSize: number;
  pageSizes: number[];
  background: boolean;
  layout: string;
  size?: 'small';
}

function resolvePagerLayout(layout?: string): string {
  const defaultLayout = ['total', 'sizes', 'prev', 'pager', 'next', 'jumper'];
  if (!layout) {
    return defaultLayout.join(', ');
  }

  const layoutSet = new Set(defaultLayout);
  const resolvedLayout = layout
    .split(',')
    .map((item) => item.trim())
    .filter((item) => layoutSet.has(item));

  return resolvedLayout.length > 0 ? resolvedLayout.join(', ') : defaultLayout.join(', ');
}

export function useTanStackPagerProps(options: {
  pagination: ComputedRef<TablePagination | null>;
  paginationSmall: ComputedRef<boolean>;
}) {
  return computed<TanStackPagerProps | null>(() => {
    const pagination = options.pagination.value;
    if (!pagination) {
      return null;
    }

    return {
      total: Number(pagination.total ?? 0),
      currentPage: Number(pagination.currentPage ?? 1),
      pageSize: Number(pagination.pageSize ?? 10),
      pageSizes:
        Array.isArray(pagination.pageSizes) && pagination.pageSizes.length > 0
          ? pagination.pageSizes
          : [10, 20, 50, 100],
      background: pagination.background ?? true,
      layout: resolvePagerLayout(pagination.layout),
      size: options.paginationSmall.value ? 'small' : undefined
    };
  });
}
