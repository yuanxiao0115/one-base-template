import type {
  PersonnelFetchNodes,
  PersonnelNode,
  PersonnelSearchNodes
} from '@/components/PersonnelSelector/types';
import { normalizeIdLike, normalizeString } from './permission-common';

export interface PermissionMemberSourceApi {
  getOrgContactsLazy: (params: { parentId?: string }) => Promise<{ data?: unknown }>;
  searchContactUsers: (params: { search?: string }) => Promise<{ data?: unknown }>;
}

interface CreatePermissionMemberSourceOptions {
  api: PermissionMemberSourceApi;
  resolveRootParentId: () => string;
}

function toPersonnelNode(row: Record<string, unknown>): PersonnelNode | null {
  const id = normalizeIdLike(row.id);
  if (!id) {
    return null;
  }

  const nodeTypeRaw = normalizeString(row.nodeType);
  const hasUser = Boolean(normalizeIdLike(row.userId)) || Boolean(normalizeString(row.nickName));
  const nodeType =
    nodeTypeRaw === 'org' || nodeTypeRaw === 'user' ? nodeTypeRaw : hasUser ? 'user' : 'org';
  const parentId = normalizeIdLike(row.parentId) || '0';
  const companyId = normalizeIdLike(row.companyId) || '0';
  const title =
    normalizeString(row.title) ||
    normalizeString(row.orgName) ||
    normalizeString(row.nickName) ||
    normalizeString(row.userAccount) ||
    id;

  if (nodeType === 'org') {
    return {
      id,
      parentId,
      companyId,
      title,
      orgName: normalizeString(row.orgName) || title,
      orgType: typeof row.orgType === 'number' ? row.orgType : 0,
      nodeType: 'org'
    };
  }

  return {
    id,
    parentId,
    companyId,
    title,
    userId: normalizeIdLike(row.userId) || id,
    nickName: normalizeString(row.nickName) || title,
    userAccount: normalizeString(row.userAccount),
    phone: normalizeString(row.phone),
    nodeType: 'user'
  };
}

export function createPermissionMemberSource(options: CreatePermissionMemberSourceOptions): {
  fetchNodes: PersonnelFetchNodes;
  searchNodes: PersonnelSearchNodes;
} {
  const fetchNodes: PersonnelFetchNodes = async ({ parentId }) => {
    const normalizedParentId = normalizeIdLike(parentId);
    const requestParentId =
      !normalizedParentId || normalizedParentId === '0'
        ? options.resolveRootParentId() || '0'
        : normalizedParentId;
    const res = await options.api.getOrgContactsLazy({
      parentId: requestParentId
    });
    const rows = Array.isArray(res?.data) ? res.data : [];
    return rows
      .map((item) =>
        item && typeof item === 'object' ? toPersonnelNode(item as Record<string, unknown>) : null
      )
      .filter((item): item is PersonnelNode => Boolean(item));
  };

  const searchNodes: PersonnelSearchNodes = async ({ keyword }) => {
    const res = await options.api.searchContactUsers({
      search: keyword
    });
    const rows = Array.isArray(res?.data) ? res.data : [];
    return rows
      .map((item) =>
        item && typeof item === 'object' ? toPersonnelNode(item as Record<string, unknown>) : null
      )
      .filter((item): item is PersonnelNode => Boolean(item && item.nodeType === 'user'));
  };

  return {
    fetchNodes,
    searchNodes
  };
}
