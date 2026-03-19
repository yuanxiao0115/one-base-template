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

interface PermissionMemberSourceSharedState {
  fetchCache: Map<string, PersonnelNode[]>;
  fetchLoading: Map<string, Promise<PersonnelNode[]>>;
  searchCache: Map<string, PersonnelNode[]>;
  searchLoading: Map<string, Promise<PersonnelNode[]>>;
}

const sharedMemberSourceStateMap = new WeakMap<
  PermissionMemberSourceApi,
  PermissionMemberSourceSharedState
>();

function resolveSharedMemberSourceState(
  api: PermissionMemberSourceApi
): PermissionMemberSourceSharedState {
  const cached = sharedMemberSourceStateMap.get(api);
  if (cached) {
    return cached;
  }
  const created: PermissionMemberSourceSharedState = {
    fetchCache: new Map(),
    fetchLoading: new Map(),
    searchCache: new Map(),
    searchLoading: new Map()
  };
  sharedMemberSourceStateMap.set(api, created);
  return created;
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

function normalizePersonnelNodes(rows: unknown, onlyUser = false): PersonnelNode[] {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows
    .map((item) =>
      item && typeof item === 'object' ? toPersonnelNode(item as Record<string, unknown>) : null
    )
    .filter((item): item is PersonnelNode =>
      Boolean(item && (!onlyUser || item.nodeType === 'user'))
    );
}

export function createPermissionMemberSource(options: CreatePermissionMemberSourceOptions): {
  fetchNodes: PersonnelFetchNodes;
  searchNodes: PersonnelSearchNodes;
} {
  const sharedState = resolveSharedMemberSourceState(options.api);

  const fetchNodes: PersonnelFetchNodes = async ({ parentId }) => {
    const normalizedParentId = normalizeIdLike(parentId);
    const requestParentId =
      !normalizedParentId || normalizedParentId === '0'
        ? options.resolveRootParentId() || '0'
        : normalizedParentId;
    const cacheKey = requestParentId;

    const cachedRows = sharedState.fetchCache.get(cacheKey);
    if (cachedRows) {
      return cachedRows;
    }

    const loadingPromise = sharedState.fetchLoading.get(cacheKey);
    if (loadingPromise) {
      return loadingPromise;
    }

    const request = options.api
      .getOrgContactsLazy({
        parentId: requestParentId
      })
      .then((res) => {
        const nodes = normalizePersonnelNodes(res?.data);
        sharedState.fetchCache.set(cacheKey, nodes);
        return nodes;
      })
      .finally(() => {
        sharedState.fetchLoading.delete(cacheKey);
      });

    sharedState.fetchLoading.set(cacheKey, request);
    return request;
  };

  const searchNodes: PersonnelSearchNodes = async ({ keyword }) => {
    const normalizedKeyword = normalizeString(keyword).trim();
    const cacheKey = normalizedKeyword;

    const cachedRows = sharedState.searchCache.get(cacheKey);
    if (cachedRows) {
      return cachedRows;
    }

    const loadingPromise = sharedState.searchLoading.get(cacheKey);
    if (loadingPromise) {
      return loadingPromise;
    }

    const request = options.api
      .searchContactUsers({
        search: keyword
      })
      .then((res) => {
        const nodes = normalizePersonnelNodes(res?.data, true);
        sharedState.searchCache.set(cacheKey, nodes);
        return nodes;
      })
      .finally(() => {
        sharedState.searchLoading.delete(cacheKey);
      });

    sharedState.searchLoading.set(cacheKey, request);
    return request;
  };

  return {
    fetchNodes,
    searchNodes
  };
}
