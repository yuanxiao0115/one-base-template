import { getHttpClient } from '@/shared/api/utils'
import { extractList, toNumberValue, toRecord, toStringValue } from '@/shared/api/normalize'

export interface BizResponse<T> {
  code: number
  data: T
  message?: string
}

export interface LoginLogRecord {
  id: string
  userAccount: string
  nickName: string
  clientType: string
  clientTypeLabel: string
  clientIp: string
  location: string
  browserName: string
  browserVersion: string
  clientOS: string
  createTime: string
}

export interface LoginLogPageParams {
  nickName?: string
  clientType?: string
  startTime?: string
  endTime?: string
  time?: string[]
  currentPage?: number
  pageSize?: number
}

export interface LoginLogPageData {
  records: LoginLogRecord[]
  total: number
  currentPage: number
  pageSize: number
}

export interface ClientTypeOption {
  key: string
  value: string
}

type LoginLogRawRecord = {
  id?: string | number | null
  userAccount?: string | null
  nickName?: string | null
  clientType?: string | number | null
  clientTypeLabel?: string | null
  clientIp?: string | null
  location?: string | null
  browserName?: string | null
  browserVersion?: string | null
  clientOS?: string | null
  createTime?: string | null
}

type LoginLogRawPageData = {
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

type ClientTypeRawOption = {
  key?: string | number | null
  value?: string | null
}

function toLoginLogRecord(item: LoginLogRawRecord): LoginLogRecord {
  return {
    id: toStringValue(item.id),
    userAccount: toStringValue(item.userAccount),
    nickName: toStringValue(item.nickName),
    clientType: toStringValue(item.clientType),
    clientTypeLabel: toStringValue(item.clientTypeLabel) || toStringValue(item.clientType),
    clientIp: toStringValue(item.clientIp),
    location: toStringValue(item.location),
    browserName: toStringValue(item.browserName),
    browserVersion: toStringValue(item.browserVersion),
    clientOS: toStringValue(item.clientOS),
    createTime: toStringValue(item.createTime)
  }
}

function toLoginLogPageData(data: unknown): LoginLogPageData {
  const payload = toRecord(data) as LoginLogRawPageData
  const records = extractList(payload).map((item) => toLoginLogRecord((item || {}) as LoginLogRawRecord))

  return {
    records,
    total: toNumberValue(payload.totalCount ?? payload.total ?? payload.count, records.length),
    currentPage: toNumberValue(payload.currentPage ?? payload.current ?? payload.page, 1),
    pageSize: toNumberValue(payload.pageSize ?? payload.size, 10)
  }
}

function toClientTypeOption(item: ClientTypeRawOption): ClientTypeOption {
  return {
    key: toStringValue(item.key),
    value: toStringValue(item.value)
  }
}

function normalizeListParams(params: LoginLogPageParams) {
  const startTime = Array.isArray(params.time) && params.time.length === 2
    ? (params.time[0] || '')
    : (params.startTime || '')
  const endTime = Array.isArray(params.time) && params.time.length === 2
    ? (params.time[1] || '')
    : (params.endTime || '')

  return {
    nickName: (params.nickName || '').trim(),
    clientType: params.clientType || '',
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
    currentPage: params.currentPage,
    pageSize: params.pageSize
  }
}

export const loginLogApi = {
  list: (params: LoginLogPageParams) =>
    getHttpClient()
      .get<BizResponse<LoginLogPageData>>('/cmict/auth/login-record/page', {
        params: normalizeListParams(params)
      })
      .then((response) => ({
        ...response,
        data: toLoginLogPageData(response.data)
      })),

  getEnum: () =>
    getHttpClient()
      .get<BizResponse<ClientTypeOption[]>>('/cmict/auth/login-record/client-type/enum')
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toClientTypeOption((item || {}) as ClientTypeRawOption))
      })),

  remove: (data: { idList: string[] }) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/auth/login-record/delete', { data }),

  detail: (params: { id: string }) =>
    getHttpClient()
      .get<BizResponse<LoginLogRecord>>('/cmict/auth/login-record/detail', { params })
      .then((response) => ({
        ...response,
        data: toLoginLogRecord((response.data || {}) as LoginLogRawRecord)
      }))
}

export default loginLogApi
