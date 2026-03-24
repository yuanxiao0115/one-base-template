import type { UserPageParams } from '../types';

export interface UserSearchForm {
  nickName: string;
  phone: string;
  userAccount: string;
  isEnable: boolean | null;
  mail: string;
  orgId: string;
  date: string[];
  startDate?: string;
  endDate?: string;
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toOptionalText(value: unknown): string | undefined {
  const text = toStringOrEmpty(value).trim();
  return text ? text : undefined;
}

function toNullableBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === null) {
    return null;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return true;
    }
    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }
  return null;
}

function pickDateRange(value: unknown): [string, string] {
  if (!Array.isArray(value) || value.length !== 2) {
    return ['', ''];
  }

  return [toStringOrEmpty(value[0]), toStringOrEmpty(value[1])];
}

export function buildUserListParams(input: Record<string, unknown>): UserPageParams {
  const [startDateFromRange, endDateFromRange] = pickDateRange(input.date);
  const startDate = toOptionalText(input.startDate) ?? toOptionalText(startDateFromRange);
  const endDate = toOptionalText(input.endDate) ?? toOptionalText(endDateFromRange);

  const params: UserPageParams = {
    nickName: toStringOrEmpty(input.nickName),
    phone: toStringOrEmpty(input.phone),
    userAccount: toStringOrEmpty(input.userAccount),
    isEnable: toNullableBoolean(input.isEnable),
    mail: toStringOrEmpty(input.mail),
    orgId: toStringOrEmpty(input.orgId),
    currentPage: Number(input.currentPage ?? 1),
    pageSize: Number(input.pageSize ?? 10)
  };

  if (startDate) {
    params.startDate = startDate;
  }

  if (endDate) {
    params.endDate = endDate;
  }

  return params;
}

export default buildUserListParams;
