import type { UseTableStandardResponse } from '@one-base-template/core';

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

/**
 * admin 默认表格响应适配器（工具能力，不属于配置项）。
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
  const dataRaw = root.data;
  const data = toRecord(root.data);
  const resultRaw = data.result;
  const result = toRecord(resultRaw);

  const recordsCandidate =
    data.records ??
    data.list ??
    data.rows ??
    data.items ??
    result.records ??
    result.list ??
    result.rows ??
    result.items ??
    root.records ??
    root.list ??
    root.rows ??
    root.items;

  const records = Array.isArray(recordsCandidate)
    ? recordsCandidate
    : Array.isArray(dataRaw)
      ? dataRaw
      : Array.isArray(resultRaw)
        ? resultRaw
        : [];

  const totalCandidate =
    data.totalCount ??
    data.total ??
    data.count ??
    result.totalCount ??
    result.total ??
    result.count ??
    root.totalCount ??
    root.total ??
    root.count ??
    records.length;
  const currentCandidate =
    data.currentPage ??
    data.current ??
    data.page ??
    result.currentPage ??
    result.current ??
    result.page ??
    root.currentPage ??
    root.current ??
    root.page;
  const pageSizeCandidate =
    data.pageSize ?? data.size ?? result.pageSize ?? result.size ?? root.pageSize ?? root.size;

  return {
    records,
    total: Number(totalCandidate ?? records.length),
    currentPage: currentCandidate == null ? undefined : Number(currentCandidate),
    pageSize: pageSizeCandidate == null ? undefined : Number(pageSizeCandidate),
    raw: response
  };
}
