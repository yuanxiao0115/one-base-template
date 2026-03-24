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

function parseIdLike(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

function parseString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseOrgRows(rows: unknown[], parentIdFallback: string): PortalContactRow[] {
  return rows
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const id = parseIdLike(row.id) || parseIdLike(row.orgId);
      if (!id) {
        return null;
      }
      const parentId = parseIdLike(row.parentId) || parentIdFallback;
      const orgName = parseString(row.orgName) || parseString(row.name);
      return {
        ...row,
        id,
        parentId,
        companyId: parseIdLike(row.companyId) || '0',
        nodeType: 'org',
        orgName,
        title: parseString(row.title) || orgName || id
      } as PortalContactRow;
    })
    .filter((item) => Boolean(item)) as PortalContactRow[];
}

function getUserParentId(row: Record<string, unknown>, parentIdFallback: string): string {
  const directParentId = parseIdLike(row.parentId);
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
  return parseIdLike((firstOrg as Record<string, unknown>).orgId) || parentIdFallback;
}

function getUserCompanyId(row: Record<string, unknown>): string {
  const directCompanyId = parseIdLike(row.companyId);
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
  return parseIdLike((firstOrg as Record<string, unknown>).companyId) || '0';
}

function parseUserRows(rows: unknown[], parentIdFallback: string): PortalContactRow[] {
  return rows
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as Record<string, unknown>;
      const id = parseIdLike(row.id) || parseIdLike(row.userId);
      if (!id) {
        return null;
      }
      const nickName = parseString(row.nickName) || parseString(row.name);
      return {
        ...row,
        id,
        userId: parseIdLike(row.userId) || id,
        parentId: getUserParentId(row, parentIdFallback),
        companyId: getUserCompanyId(row),
        nodeType: 'user',
        nickName,
        title: parseString(row.title) || nickName || parseString(row.userAccount) || id
      } as PortalContactRow;
    })
    .filter((item) => Boolean(item)) as PortalContactRow[];
}

function isUserLikeRow(row: Record<string, unknown>): boolean {
  const nodeType = parseString(row.nodeType);
  if (nodeType === 'user') {
    return true;
  }
  return Boolean(
    parseIdLike(row.userId) || parseString(row.nickName) || parseString(row.userAccount)
  );
}

function parseMixedRows(rows: unknown[], parentIdFallback: string): PortalContactRow[] {
  const normalized: PortalContactRow[] = [];
  rows.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }
    const row = item as Record<string, unknown>;
    if (isUserLikeRow(row)) {
      normalized.push(...parseUserRows([row], parentIdFallback));
      return;
    }
    normalized.push(...parseOrgRows([row], parentIdFallback));
  });
  return normalized;
}

function parseContactRows(data: unknown, parentIdFallback = '0'): PortalContactRow[] {
  const fallbackParentId = parseIdLike(parentIdFallback) || '0';
  if (Array.isArray(data)) {
    const rows = parseMixedRows(data, fallbackParentId);
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
    ...parseOrgRows(orgRows, fallbackParentId),
    ...parseUserRows(userRows, fallbackParentId)
  ];
  if (fromTree.length > 0) {
    return fromTree;
  }

  const fallbackRows = Array.isArray(payload.records)
    ? payload.records
    : Array.isArray(payload.list)
      ? payload.list
      : [];
  return parseMixedRows(fallbackRows, fallbackParentId);
}

function parseContactResponse(
  response: BizResponse<unknown>,
  parentIdFallback = '0',
  onlyUsers = false
): BizResponse<PortalContactRow[]> {
  const normalizedRows = parseContactRows(response?.data, parentIdFallback);
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
    const parentId = parseIdLike(params.parentId) || '0';
    const response = await obHttp().get<BizResponse<unknown>>(
      '/cmict/admin/org/detail/children-and-user',
      {
        params: {
          parentId
        }
      }
    );
    return parseContactResponse(response, parentId, false);
  },

  searchContactUsers: async (params: { search?: string }) => {
    const response = await obHttp().get<BizResponse<unknown>>(
      '/cmict/admin/user/structure/search/',
      { params }
    );
    return parseContactResponse(response, '0', true);
  }
};
