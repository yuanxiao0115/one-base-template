import { getAppHttpClient } from '@/shared/api/http-client'

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

export interface LoginLogListResult {
  records: LoginLogRecord[]
  total: number
  currentPage: number
  pageSize: number
}

export interface ClientTypeOption {
  key: string
  value: string
}

function getHttp() {
  return getAppHttpClient()
}

function normalizeListParams(params: Record<string, unknown>) {
  const next = { ...params }

  if (Array.isArray(next.time) && next.time.length === 2) {
    next.startTime = next.time[0]
    next.endTime = next.time[1]
  }

  delete next.time

  const currentPage = Number(next.currentPage ?? next.current ?? next.page ?? 1)
  const pageSize = Number(next.pageSize ?? next.size ?? 10)

  return {
    ...next,
    currentPage,
    pageSize
  }
}

export const loginLogApi = {
  list: (params: Record<string, unknown>) =>
    getHttp().get<BizResponse<LoginLogListResult>>('/cmict/auth/login-record/page', {
      params: normalizeListParams(params)
    }),

  getEnum: () =>
    getHttp().get<BizResponse<ClientTypeOption[]>>('/cmict/auth/login-record/client-type/enum'),

  delete: (data: { idList: string[] }) =>
    getHttp().post<BizResponse<null>>('/cmict/auth/login-record/delete', { data }),

  detail: (params: { id: string }) =>
    getHttp().get<BizResponse<LoginLogRecord>>('/cmict/auth/login-record/detail', { params })
}

export default loginLogApi
