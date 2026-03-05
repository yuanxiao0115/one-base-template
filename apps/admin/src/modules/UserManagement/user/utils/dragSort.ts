export interface PaginationLike {
  currentPage?: number;
  pageSize?: number;
}

export interface BuildAdjustOrgSortParams {
  orgId: string;
  rowId: number | string | null | undefined;
  newIndex: number;
  pagination: PaginationLike;
}

export function moveArrayItem<T>(list: T[], oldIndex: number, newIndex: number): T[] {
  const array = Array.isArray(list) ? list.slice() : [];
  if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0 || oldIndex >= array.length || newIndex >= array.length) {
    return array;
  }

  const [moved] = array.splice(oldIndex, 1);
  if (typeof moved === "undefined") {
    return array;
  }
  array.splice(newIndex, 0, moved);
  return array;
}

export function calcGlobalIndex(pagination: PaginationLike, newIndex: number): number {
  const currentPage = Number(pagination.currentPage ?? 1);
  const pageSize = Number(pagination.pageSize ?? 10);
  return (currentPage - 1) * pageSize + newIndex + 1;
}

export function buildAdjustOrgSortPayload(params: BuildAdjustOrgSortParams) {
  if (!params.orgId && params.orgId !== "0") {
    return null;
  }
  if (params.rowId == null) {
    return null;
  }

  return {
    orgId: params.orgId,
    id: String(params.rowId),
    index: calcGlobalIndex(params.pagination, params.newIndex),
  };
}

export const dragHandleClass = "user-drag-handle";

export function buildSortableOptions(onEnd: (evt: unknown) => void) {
  return {
    animation: 160,
    handle: `.${dragHandleClass}`,
    onEnd,
  };
}
