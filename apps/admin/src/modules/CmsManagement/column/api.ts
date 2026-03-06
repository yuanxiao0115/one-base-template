import { extractList, toNumberValue, toRecord, toStringValue } from "@/shared/api/normalize";
import { getHttpClient, trimText } from "@/shared/api/utils";

export interface BizResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface ColumnRecord {
  id: string;
  parentCategoryId: string;
  categoryName: string;
  isShow: number;
  articleAmount: number;
  sort: number;
  createTime: string;
  children?: ColumnRecord[];
}

export interface ColumnTreeParams {
  categoryName?: string;
  isShow?: number | string;
}

export interface ColumnSavePayload {
  id?: string;
  categoryName: string;
  parentCategoryId: string | null;
  isShow: number;
  sort: number;
}

interface ColumnRawRecord {
  id?: number | string | null;
  parentCategoryId?: number | string | null;
  categoryName?: string | null;
  name?: string | null;
  isShow?: number | string | null;
  articleAmount?: number | string | null;
  sort?: number | string | null;
  createTime?: string | null;
  children?: unknown;
}

function toColumnRow(item: unknown): ColumnRecord {
  const row = (item || {}) as ColumnRawRecord;
  const children = extractList(row.children).map((child) => toColumnRow(child));

  return {
    id: toStringValue(row.id),
    parentCategoryId: toStringValue(row.parentCategoryId),
    categoryName: toStringValue(row.categoryName || row.name),
    isShow: toNumberValue(row.isShow, 1),
    articleAmount: toNumberValue(row.articleAmount, 0),
    sort: toNumberValue(row.sort, 0),
    createTime: toStringValue(row.createTime),
    children: children.length > 0 ? children : undefined,
  };
}

function normalizeIsShow(value?: number | string): number | "" {
  if (value === "" || value === undefined || value === null) {
    return "";
  }
  return Number(value);
}

export const columnApi = {
  tree: async (params: ColumnTreeParams) =>
    getHttpClient()
      .get<BizResponse<ColumnRecord[]>>("/cmict/cms/cmsCategory/tree", {
        params: {
          categoryName: trimText(params.categoryName),
          isShow: normalizeIsShow(params.isShow),
        },
      })
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toColumnRow(item)),
      })),

  add: async (data: ColumnSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),

  update: async (data: ColumnSavePayload) =>
    getHttpClient().put<BizResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),

  remove: async (data: { id: string }) =>
    getHttpClient().delete<BizResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),
};

export function toColumnRows(data: unknown): ColumnRecord[] {
  const payload = toRecord(data);
  return extractList(payload).map((item) => toColumnRow(item));
}

export default columnApi;
