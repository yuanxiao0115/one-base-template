import type { CrudContainerType } from '@one-base-template/ui';
import type { UseTableDefaults, UseTableStandardResponse } from '@/hooks/table';

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') return {};
  return value as Record<string, unknown>;
}

/**
 * admin 侧默认表格响应结构适配器：
 * - 优先兼容 { data: { records/list/rows/items, total/totalCount/count } }
 * - 兼容部分项目将分页结果放在 data.result 下
 * - 仍可在页面级通过 useTable 局部 responseAdapter 覆盖
 */
export function appTableResponseAdapter(response: unknown): UseTableStandardResponse<unknown> {
  if (Array.isArray(response)) {
    return {
      records: response,
      total: response.length,
      raw: response
    };
  }

  const root = toRecord(response);
  const data = toRecord(root.data);
  const result = toRecord(data.result);

  const recordsCandidate =
    data.records ?? data.list ?? data.rows ?? data.items ?? result.records ?? result.list ?? result.rows ?? result.items;

  const records = Array.isArray(recordsCandidate)
    ? recordsCandidate
    : [];

  const totalCandidate = data.totalCount ?? data.total ?? data.count ?? result.totalCount ?? result.total ?? result.count ?? records.length;
  const currentCandidate = data.currentPage ?? data.current ?? data.page ?? result.currentPage ?? result.current ?? result.page;
  const pageSizeCandidate = data.pageSize ?? data.size ?? result.pageSize ?? result.size;

  return {
    records,
    total: Number(totalCandidate ?? records.length),
    currentPage: currentCandidate == null ? undefined : Number(currentCandidate),
    pageSize: pageSizeCandidate == null ? undefined : Number(pageSizeCandidate),
    raw: response
  };
}

/**
 * CRUD 容器默认形态：
 * - 未传 container 时生效
 * - 组件 props.container 始终优先于该默认值
 */
export const appCrudContainerDefaultType: CrudContainerType = 'drawer';

/**
 * useTable 全局默认配置：
 * - 当前页字段统一为 currentPage
 * - 每页条数字段统一为 pageSize
 * - 兼容 current/page 与 size 作为别名
 */
export const appTableDefaults: UseTableDefaults = {
  paginationKey: {
    current: 'currentPage',
    size: 'pageSize'
  },
  paginationAlias: {
    current: ['current', 'page'],
    size: ['size']
  },
  responseAdapter: appTableResponseAdapter
};
