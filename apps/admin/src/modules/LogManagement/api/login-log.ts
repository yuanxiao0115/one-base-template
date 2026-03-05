import { getHttpClient } from "@/shared/api/utils";
import { extractList, toNumberValue, toRecord, toStringValue } from "@/shared/api/normalize";

export interface BizResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface LoginLogRecord {
  id: string;
  userAccount: string;
  nickName: string;
  clientType: string;
  clientTypeLabel: string;
  clientIp: string;
  location: string;
  browserName: string;
  browserVersion: string;
  clientOS: string;
  createTime: string;
}

export interface LoginLogPageParams {
  nickName?: string;
  clientType?: string;
  startTime?: string;
  endTime?: string;
  time?: string[];
  currentPage?: number;
  pageSize?: number;
}

export interface LoginLogPageData {
  records: LoginLogRecord[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface ClientTypeOption {
  key: string;
  value: string;
}

interface LoginLogRawRecord {
  id?: number | string | null;
  userAccount?: string | null;
  nickName?: string | null;
  clientType?: number | string | null;
  clientTypeLabel?: string | null;
  clientIp?: string | null;
  location?: string | null;
  browserName?: string | null;
  browserVersion?: string | null;
  clientOS?: string | null;
  createTime?: string | null;
}

interface LoginLogRawPageData {
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

interface ClientTypeRawOption {
  key?: number | string | null;
  value?: string | null;
}

function resolveTimeRange(params: LoginLogPageParams) {
  const [rangeStart, rangeEnd] = Array.isArray(params.time) ? params.time : [];
  return {
    startTime: rangeStart ?? params.startTime ?? "",
    endTime: rangeEnd ?? params.endTime ?? "",
  };
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
    createTime: toStringValue(item.createTime),
  };
}

function toLoginLogPageData(data: unknown): LoginLogPageData {
  const payload = toRecord(data) as LoginLogRawPageData;
  const records = extractList(payload).map((item) => toLoginLogRecord(toRecord(item) as LoginLogRawRecord));

  return {
    records,
    total: toNumberValue(payload.totalCount ?? payload.total ?? payload.count, records.length),
    currentPage: toNumberValue(payload.currentPage ?? payload.current ?? payload.page, 1),
    pageSize: toNumberValue(payload.pageSize ?? payload.size, 10),
  };
}

function toClientTypeOption(item: ClientTypeRawOption): ClientTypeOption {
  return {
    key: toStringValue(item.key),
    value: toStringValue(item.value),
  };
}

function normalizeListParams(params: LoginLogPageParams) {
  const { startTime, endTime } = resolveTimeRange(params);
  return {
    nickName: (params.nickName ?? "").trim(),
    clientType: params.clientType ?? "",
    ...(startTime.length > 0 ? { startTime } : {}),
    ...(endTime.length > 0 ? { endTime } : {}),
    currentPage: params.currentPage,
    pageSize: params.pageSize,
  };
}

export const loginLogApi = {
  list: async (params: LoginLogPageParams) =>
    getHttpClient()
      .get<BizResponse<LoginLogPageData>>("/cmict/auth/login-record/page", {
        params: normalizeListParams(params),
      })
      .then((response) => ({
        ...response,
        data: toLoginLogPageData(response.data),
      })),

  getEnum: async () =>
    getHttpClient()
      .get<BizResponse<ClientTypeOption[]>>("/cmict/auth/login-record/client-type/enum")
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toClientTypeOption(toRecord(item) as ClientTypeRawOption)),
      })),

  remove: async (data: { idList: string[] }) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/auth/login-record/delete", { data }),

  detail: async (params: { id: string }) =>
    getHttpClient()
      .get<BizResponse<LoginLogRecord>>("/cmict/auth/login-record/detail", {
        params,
      })
      .then((response) => ({
        ...response,
        data: toLoginLogRecord(toRecord(response.data) as LoginLogRawRecord),
      })),
};

export default loginLogApi;
