import { obHttp } from '@one-base-template/core';
import type { BizResponse } from '../types';

interface PortalRoleRow {
  id?: string;
  name?: string;
  roleName?: string;
  [key: string]: unknown;
}

interface PortalContactRow {
  id?: string;
  parentId?: string;
  companyId?: string;
  title?: string;
  nodeType?: string;
  orgName?: string;
  orgType?: number;
  userId?: string;
  nickName?: string;
  userAccount?: string;
  phone?: string;
  [key: string]: unknown;
}

function normalizeIdLike(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeOrgRows(rows: unknown[], parentIdFallback: string): PortalContactRow[] {
  return rows
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const id = normalizeIdLike(row.id) || normalizeIdLike(row.orgId);
      if (!id) {
        return null;
      }
      const parentId = normalizeIdLike(row.parentId) || parentIdFallback;
      const orgName = normalizeString(row.orgName) || normalizeString(row.name);
      return {
        ...row,
        id,
        parentId,
        companyId: normalizeIdLike(row.companyId) || '0',
        nodeType: 'org',
        orgName,
        title: normalizeString(row.title) || orgName || id
      } as PortalContactRow;
    })
    .filter((item) => Boolean(item)) as PortalContactRow[];
}

function resolveUserParentId(row: Record<string, unknown>, parentIdFallback: string): string {
  const directParentId = normalizeIdLike(row.parentId);
  if (directParentId) {
    return directParentId;
  }
  const userOrgs = Array.isArray(row.userOrgs) ? row.userOrgs : [];
  if (userOrgs.length === 0) {
    return parentIdFallback;
  }
  const firstOrg = userOrgs[0];
  if (!firstOrg || typeof firstOrg !== 'object') {
    return parentIdFallback;
  }
  return normalizeIdLike((firstOrg as Record<string, unknown>).orgId) || parentIdFallback;
}

function resolveUserCompanyId(row: Record<string, unknown>): string {
  const directCompanyId = normalizeIdLike(row.companyId);
  if (directCompanyId) {
    return directCompanyId;
  }
  const userOrgs = Array.isArray(row.userOrgs) ? row.userOrgs : [];
  if (userOrgs.length === 0) {
    return '0';
  }
  const firstOrg = userOrgs[0];
  if (!firstOrg || typeof firstOrg !== 'object') {
    return '0';
  }
  return normalizeIdLike((firstOrg as Record<string, unknown>).companyId) || '0';
}

function normalizeUserRows(rows: unknown[], parentIdFallback: string): PortalContactRow[] {
  return rows
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const id = normalizeIdLike(row.id) || normalizeIdLike(row.userId);
      if (!id) {
        return null;
      }
      const nickName = normalizeString(row.nickName) || normalizeString(row.name);
      return {
        ...row,
        id,
        userId: normalizeIdLike(row.userId) || id,
        parentId: resolveUserParentId(row, parentIdFallback),
        companyId: resolveUserCompanyId(row),
        nodeType: 'user',
        nickName,
        title: normalizeString(row.title) || nickName || normalizeString(row.userAccount) || id
      } as PortalContactRow;
    })
    .filter((item) => Boolean(item)) as PortalContactRow[];
}

function isUserLikeRow(row: Record<string, unknown>): boolean {
  const nodeType = normalizeString(row.nodeType);
  if (nodeType === 'user') {
    return true;
  }
  return Boolean(
    normalizeIdLike(row.userId) || normalizeString(row.nickName) || normalizeString(row.userAccount)
  );
}

function normalizeMixedRows(rows: unknown[], parentIdFallback: string): PortalContactRow[] {
  const normalized: PortalContactRow[] = [];
  rows.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }
    const row = item as Record<string, unknown>;
    if (isUserLikeRow(row)) {
      normalized.push(...normalizeUserRows([row], parentIdFallback));
      return;
    }
    normalized.push(...normalizeOrgRows([row], parentIdFallback));
  });
  return normalized;
}

function normalizeContactRows(data: unknown, parentIdFallback = '0'): PortalContactRow[] {
  const fallbackParentId = normalizeIdLike(parentIdFallback) || '0';
  if (Array.isArray(data)) {
    const rows = normalizeMixedRows(data, fallbackParentId);
    if (rows.length > 0) {
      return rows;
    }
    return [];
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const payload = data as Record<string, unknown>;
  const orgRows = Array.isArray(payload.orgIndustryContactVOS)
    ? payload.orgIndustryContactVOS
    : Array.isArray(payload.orgDetailList)
      ? payload.orgDetailList
      : [];
  const userRows = Array.isArray(payload.userStructureQueryVOS)
    ? payload.userStructureQueryVOS
    : Array.isArray(payload.userList)
      ? payload.userList
      : [];

  const fromTree = [
    ...normalizeOrgRows(orgRows, fallbackParentId),
    ...normalizeUserRows(userRows, fallbackParentId)
  ];
  if (fromTree.length > 0) {
    return fromTree;
  }

  const fallbackRows = Array.isArray(payload.records)
    ? payload.records
    : Array.isArray(payload.list)
      ? payload.list
      : [];
  return normalizeMixedRows(fallbackRows, fallbackParentId);
}

function normalizeContactResponse(
  response: BizResponse<unknown>,
  parentIdFallback = '0',
  onlyUsers = false
): BizResponse<PortalContactRow[]> {
  const normalizedRows = normalizeContactRows(response?.data, parentIdFallback);
  const data = onlyUsers
    ? normalizedRows.filter((item) => item.nodeType === 'user')
    : normalizedRows;
  return {
    ...response,
    data
  };
}

export const portalAuthorityApi = {
  listRoles: async () => obHttp().get<BizResponse<PortalRoleRow[]>>('/cmict/admin/role/get-list'),

  pageRoles: async (params: { currentPage: number; pageSize: number; roleName?: string }) =>
    obHttp().get<BizResponse<{ records?: PortalRoleRow[]; [key: string]: unknown }>>(
      '/cmict/admin/role/page',
      { params }
    ),

  getOrgContactsLazy: async (params: { parentId?: string }) => {
    const parentId = normalizeIdLike(params.parentId) || '0';
    const response = await obHttp().get<BizResponse<unknown>>(
      '/cmict/admin/org/detail/children-and-user',
      {
        params: {
          parentId
        }
      }
    );
    return normalizeContactResponse(response, parentId, false);
  },

  searchContactUsers: async (params: { search?: string }) => {
    const response = await obHttp().get<BizResponse<unknown>>(
      '/cmict/admin/user/structure/search/',
      { params }
    );
    return normalizeContactResponse(response, '0', true);
  }
};
