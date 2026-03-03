import { extractList, toNumberValue, toRecord, toStringValue } from '@/shared/api/normalize'
import { getHttpClient, trimText } from '@/shared/api/utils'

export interface BizResponse<T> {
  code: number
  data: T
  message?: string
}

export interface DictRecord {
  id: string
  dictCode: string
  dictName: string
  remark: string
  creatorName: string
  createTime: string
}

export interface DictPageParams {
  dictCode?: string
  dictName?: string
  currentPage?: number
  pageSize?: number
}

export interface DictPageData {
  records: DictRecord[]
  total: number
  currentPage: number
  pageSize: number
}

export interface DictSavePayload {
  id?: string
  dictCode: string
  dictName: string
  remark: string
}

export interface DictItemRecord {
  id: string
  dictId: string
  itemName: string
  itemValue: string
  disabled: number
  sort: number
  remark: string
  createBy: string
  createTime: string
}

export interface DictItemPageParams {
  dictId: string
  itemName?: string
  itemValue?: string
  currentPage?: number
  pageSize?: number
}

export interface DictItemPageData {
  records: DictItemRecord[]
  total: number
  currentPage: number
  pageSize: number
}

export interface DictItemSavePayload {
  id?: string
  dictId: string
  itemName: string
  itemValue: string
  sort: number
  remark: string
}

type RawPageData = {
  records?: unknown[]
  list?: unknown[]
  rows?: unknown[]
  items?: unknown[]
  total?: string | number | null
  totalCount?: string | number | null
  count?: string | number | null
  currentPage?: string | number | null
  current?: string | number | null
  page?: string | number | null
  pageSize?: string | number | null
  size?: string | number | null
}

type DictRawRecord = {
  id?: string | number | null
  dictCode?: string | null
  dictName?: string | null
  remark?: string | null
  creatorName?: string | null
  createBy?: string | null
  createTime?: string | null
}

type DictItemRawRecord = {
  id?: string | number | null
  dictId?: string | number | null
  itemName?: string | null
  itemValue?: string | number | null
  disabled?: string | number | null
  sort?: string | number | null
  remark?: string | null
  createBy?: string | null
  createTime?: string | null
}

function toPageData<T>(data: unknown, mapRow: (row: unknown) => T) {
  const payload = toRecord(data) as RawPageData
  const records = extractList(payload).map((item) => mapRow(item))

  return {
    records,
    total: toNumberValue(payload.totalCount ?? payload.total ?? payload.count, records.length),
    currentPage: toNumberValue(payload.currentPage ?? payload.current ?? payload.page, 1),
    pageSize: toNumberValue(payload.pageSize ?? payload.size, 10)
  }
}

function toDictRecord(item: unknown): DictRecord {
  const row = (item || {}) as DictRawRecord

  return {
    id: toStringValue(row.id),
    dictCode: toStringValue(row.dictCode),
    dictName: toStringValue(row.dictName),
    remark: toStringValue(row.remark),
    creatorName: toStringValue(row.creatorName || row.createBy),
    createTime: toStringValue(row.createTime)
  }
}

function toDictItemRecord(item: unknown): DictItemRecord {
  const row = (item || {}) as DictItemRawRecord

  return {
    id: toStringValue(row.id),
    dictId: toStringValue(row.dictId),
    itemName: toStringValue(row.itemName),
    itemValue: toStringValue(row.itemValue),
    disabled: toNumberValue(row.disabled, 0),
    sort: toNumberValue(row.sort, 0),
    remark: toStringValue(row.remark),
    createBy: toStringValue(row.createBy),
    createTime: toStringValue(row.createTime)
  }
}

export const dictApi = {
  page: (params: DictPageParams) =>
    getHttpClient()
      .get<BizResponse<DictPageData>>('/cmict/admin/data-dict/page', {
        params: {
          dictCode: trimText(params.dictCode),
          dictName: trimText(params.dictName),
          currentPage: params.currentPage,
          pageSize: params.pageSize
        }
      })
      .then((response) => ({
        ...response,
        data: toPageData(response.data, toDictRecord)
      })),

  add: (data: DictSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/data-dict/add', { data }),

  update: (data: DictSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/data-dict/update', { data }),

  remove: (data: { idList: string | string[] }) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/data-dict/delete', { data })
}

export const dictItemApi = {
  page: (params: DictItemPageParams) =>
    getHttpClient()
      .get<BizResponse<DictItemPageData>>('/cmict/admin/dict-item/page', {
        params: {
          dictId: params.dictId,
          itemName: trimText(params.itemName),
          itemValue: trimText(params.itemValue),
          currentPage: params.currentPage,
          pageSize: params.pageSize
        }
      })
      .then((response) => ({
        ...response,
        data: toPageData(response.data, toDictItemRecord)
      })),

  add: (data: DictItemSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/dict-item/add', { data }),

  update: (data: DictItemSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/dict-item/update', { data }),

  remove: (data: { idList: string | string[] }) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/dict-item/delete', { data }),

  toggleStatus: (data: { ids: string | string[]; isEnable: boolean }) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/dict-item/deactivate', { data })
}

export default dictApi
