import { getHttpClient } from '@/shared/api/utils'
import { extractList, toNumberValue, toRecord, toStringValue } from '@/shared/api/normalize'

export interface BizResponse<T> {
  code: number
  data: T
  message?: string
}

export interface SysLogRecord {
  id: string
  clientIp: string
  module: string
  operationType: string
  operationResult: number
  httpStatus: string
  requestUrl: string
  createTime: string
  userId: string
  userAccount: string
  nickName: string
  browserName: string
  browserVersion: string
  clientOS: string
  clientId: string
  tenantId: string
}

export interface SysLogPageParams {
  operator?: string
  clientIp?: string
  module?: string
  operationType?: string
  operationResult?: string | number
  userAccount?: string
  nickName?: string
  browserName?: string
  clientOS?: string
  tenantId?: string
  startTime?: string
  endTime?: string
  time?: string[]
  currentPage?: number
  pageSize?: number
}

export interface SysLogPageData {
  records: SysLogRecord[]
  total: number
  currentPage: number
  pageSize: number
}

type SysLogRawRecord = {
  id?: string | number | null
  clientIp?: string | null
  module?: string | null
  operationType?: string | null
  operationResult?: string | number | null
  httpStatus?: string | number | null
  requestUrl?: string | null
  createTime?: string | null
  userId?: string | number | null
  userAccount?: string | null
  nickName?: string | null
  browserName?: string | null
  browserVersion?: string | null
  clientOS?: string | null
  clientId?: string | number | null
  tenantId?: string | number | null
}

type SysLogRawPageData = {
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

function toSysLogRecord(item: SysLogRawRecord): SysLogRecord {
  return {
    id: toStringValue(item.id),
    clientIp: toStringValue(item.clientIp),
    module: toStringValue(item.module),
    operationType: toStringValue(item.operationType),
    operationResult: toNumberValue(item.operationResult, 0),
    httpStatus: toStringValue(item.httpStatus),
    requestUrl: toStringValue(item.requestUrl),
    createTime: toStringValue(item.createTime),
    userId: toStringValue(item.userId),
    userAccount: toStringValue(item.userAccount),
    nickName: toStringValue(item.nickName),
    browserName: toStringValue(item.browserName),
    browserVersion: toStringValue(item.browserVersion),
    clientOS: toStringValue(item.clientOS),
    clientId: toStringValue(item.clientId),
    tenantId: toStringValue(item.tenantId)
  }
}

function toSysLogPageData(data: unknown): SysLogPageData {
  const payload = toRecord(data) as SysLogRawPageData
  const records = extractList(payload).map((item) => toSysLogRecord((item || {}) as SysLogRawRecord))

  return {
    records,
    total: toNumberValue(payload.totalCount ?? payload.total ?? payload.count, records.length),
    currentPage: toNumberValue(payload.currentPage ?? payload.current ?? payload.page, 1),
    pageSize: toNumberValue(payload.pageSize ?? payload.size, 10)
  }
}

function normalizeListParams(params: SysLogPageParams) {
  const startTime = Array.isArray(params.time) && params.time.length === 2
    ? (params.time[0] || '')
    : (params.startTime || '')
  const endTime = Array.isArray(params.time) && params.time.length === 2
    ? (params.time[1] || '')
    : (params.endTime || '')

  return {
    operator: (params.operator || '').trim(),
    clientIp: (params.clientIp || '').trim(),
    module: (params.module || '').trim(),
    operationType: params.operationType || '',
    operationResult: params.operationResult ?? '',
    userAccount: (params.userAccount || '').trim(),
    nickName: (params.nickName || '').trim(),
    browserName: (params.browserName || '').trim(),
    clientOS: (params.clientOS || '').trim(),
    tenantId: (params.tenantId || '').trim(),
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
    currentPage: params.currentPage,
    pageSize: params.pageSize
  }
}

export const sysLogApi = {
  list: (params: SysLogPageParams) =>
    getHttpClient()
      .get<BizResponse<SysLogPageData>>('/cmict/logstore/sys-log/page', {
        params: normalizeListParams(params)
      })
      .then((response) => ({
        ...response,
        data: toSysLogPageData(response.data)
      })),

  remove: (data: { idList: string[] }) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/logstore/sys-log/delete', { data }),

  detail: (params: { id: string }) =>
    getHttpClient()
      .get<BizResponse<SysLogRecord>>('/cmict/logstore/sys-log/detail', { params })
      .then((response) => ({
        ...response,
        data: toSysLogRecord((response.data || {}) as SysLogRawRecord)
      }))
}

export default sysLogApi
