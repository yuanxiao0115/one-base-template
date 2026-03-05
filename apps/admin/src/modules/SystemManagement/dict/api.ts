import { extractList, toNumberValue, toRecord, toStringValue } from "@/shared/api/normalize";
import { getHttpClient, trimText } from "@/shared/api/utils";

export interface BizResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface DictRecord {
  id: string;
  dictCode: string;
  dictName: string;
  remark: string;
  creatorName: string;
  createTime: string;
}

export interface DictPageParams {
  dictCode?: string;
  dictName?: string;
  currentPage?: number;
  pageSize?: number;
}

export interface DictPageData {
  records: DictRecord[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface DictSavePayload {
  id?: string;
  dictCode: string;
  dictName: string;
  remark: string;
}

export interface DictItemRecord {
  id: string;
  dictId: string;
  itemName: string;
  itemValue: string;
  disabled: number;
  sort: number;
  remark: string;
  createBy: string;
  createTime: string;
}

export interface DictItemPageParams {
  dictId: string;
  itemName?: string;
  itemValue?: string;
  currentPage?: number;
  pageSize?: number;
}

export interface DictItemPageData {
  records: DictItemRecord[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface DictItemSavePayload {
  id?: string;
  dictId: string;
  itemName: string;
  itemValue: string;
  sort: number;
  remark: string;
}

interface RawPageData {
  records?: unknown[];
  list?: unknown[];
  rows?: unknown[];
  items?: unknown[];
  total?: number | string | null;
  totalCount?: number | string | null;
  count?: number | string | null;
  currentPage?: number | string | null;
  current?: number | string | null;
  page?: number | string | null;
  pageSize?: number | string | null;
  size?: number | string | null;
}

interface DictRawRecord {
  id?: number | string | null;
  dictCode?: string | null;
  dictName?: string | null;
  remark?: string | null;
  creatorName?: string | null;
  createBy?: string | null;
  createTime?: string | null;
}

interface DictItemRawRecord {
  id?: number | string | null;
  dictId?: number | string | null;
  itemName?: string | null;
  itemValue?: number | string | null;
  disabled?: number | string | null;
  sort?: number | string | null;
  remark?: string | null;
  createBy?: string | null;
  createTime?: string | null;
}

function toPageData<T>(data: unknown, mapRow: (row: unknown) => T) {
  const payload = toRecord(data) as RawPageData;
  const records = extractList(payload).map((item) => mapRow(item));

  return {
    records,
    total: toNumberValue(payload.totalCount ?? payload.total ?? payload.count, records.length),
    currentPage: toNumberValue(payload.currentPage ?? payload.current ?? payload.page, 1),
    pageSize: toNumberValue(payload.pageSize ?? payload.size, 10),
  };
}

function toDictRecord(item: unknown): DictRecord {
  const row = (item ?? {}) as DictRawRecord;

  return {
    id: toStringValue(row.id),
    dictCode: toStringValue(row.dictCode),
    dictName: toStringValue(row.dictName),
    remark: toStringValue(row.remark),
    creatorName: toStringValue(row.creatorName || row.createBy),
    createTime: toStringValue(row.createTime),
  };
}

function toDictItemRecord(item: unknown): DictItemRecord {
  const row = (item ?? {}) as DictItemRawRecord;

  return {
    id: toStringValue(row.id),
    dictId: toStringValue(row.dictId),
    itemName: toStringValue(row.itemName),
    itemValue: toStringValue(row.itemValue),
    disabled: toNumberValue(row.disabled, 0),
    sort: toNumberValue(row.sort, 0),
    remark: toStringValue(row.remark),
    createBy: toStringValue(row.createBy),
    createTime: toStringValue(row.createTime),
  };
}

export const dictApi = {
  page: async (params: DictPageParams) =>
    getHttpClient()
      .get<BizResponse<DictPageData>>("/cmict/admin/data-dict/page", {
        params: {
          dictCode: trimText(params.dictCode),
          dictName: trimText(params.dictName),
          currentPage: params.currentPage,
          pageSize: params.pageSize,
        },
      })
      .then((response) => ({
        ...response,
        data: toPageData(response.data, toDictRecord),
      })),

  add: async (data: DictSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/admin/data-dict/add", {
      data,
    }),

  update: async (data: DictSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/admin/data-dict/update", { data }),

  remove: async (data: { idList: string[] | string }) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/admin/data-dict/delete", { data }),
};

export const dictItemApi = {
  page: async (params: DictItemPageParams) =>
    getHttpClient()
      .get<BizResponse<DictItemPageData>>("/cmict/admin/dict-item/page", {
        params: {
          dictId: params.dictId,
          itemName: trimText(params.itemName),
          itemValue: trimText(params.itemValue),
          currentPage: params.currentPage,
          pageSize: params.pageSize,
        },
      })
      .then((response) => ({
        ...response,
        data: toPageData(response.data, toDictItemRecord),
      })),

  add: async (data: DictItemSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/admin/dict-item/add", {
      data,
    }),

  update: async (data: DictItemSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/admin/dict-item/update", { data }),

  remove: async (data: { idList: string[] | string }) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/admin/dict-item/delete", { data }),

  toggleStatus: async (data: { ids: string[] | string; isEnable: boolean }) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/admin/dict-item/deactivate", { data }),
};

export default dictApi;
