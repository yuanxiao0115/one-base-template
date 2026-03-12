import { obHttp } from "@one-base-template/core";
import type { ApiResponse } from "@/shared/api/types";
import type { PersonnelNode, PersonnelUserNode } from "./types";

function normalizeIdLike(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value : "";
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
  if (!firstOrg || typeof firstOrg !== "object") {
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
    return "0";
  }
  const firstOrg = userOrgs[0];
  if (!firstOrg || typeof firstOrg !== "object") {
    return "0";
  }
  return normalizeIdLike((firstOrg as Record<string, unknown>).companyId) || "0";
}

function isUserLikeRow(row: Record<string, unknown>): boolean {
  const nodeType = normalizeString(row.nodeType);
  if (nodeType === "user") {
    return true;
  }
  return Boolean(normalizeIdLike(row.userId) || normalizeString(row.nickName) || normalizeString(row.userAccount));
}

function sortBySortField(rows: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return [...rows].sort((left, right) => {
    const leftSort = typeof left.sort === "number" ? left.sort : Number(left.sort ?? 0);
    const rightSort = typeof right.sort === "number" ? right.sort : Number(right.sort ?? 0);
    if (Number.isFinite(leftSort) && Number.isFinite(rightSort)) {
      return leftSort - rightSort;
    }
    if (Number.isFinite(leftSort)) {
      return -1;
    }
    if (Number.isFinite(rightSort)) {
      return 1;
    }
    return 0;
  });
}

function normalizeOrgNodes(rows: unknown[], parentIdFallback: string): PersonnelNode[] {
  const records = rows
    .map((item) => (item && typeof item === "object" ? (item as Record<string, unknown>) : null))
    .filter((item): item is Record<string, unknown> => Boolean(item));

  const normalized: PersonnelNode[] = [];
  for (const row of sortBySortField(records)) {
    const id = normalizeIdLike(row.id) || normalizeIdLike(row.orgId);
    if (!id) {
      continue;
    }
    const parentId = normalizeIdLike(row.parentId) || parentIdFallback;
    const title = normalizeString(row.title) || normalizeString(row.orgName) || normalizeString(row.name) || id;
    const companyId = normalizeIdLike(row.companyId) || "0";
    const orgName = normalizeString(row.orgName) || normalizeString(row.name) || title;
    normalized.push({
      id,
      parentId,
      companyId,
      title,
      orgName,
      orgType: typeof row.orgType === "number" ? row.orgType : 0,
      nodeType: "org",
    });
  }
  return normalized;
}

function normalizeUserNodes(rows: unknown[], parentIdFallback: string): PersonnelNode[] {
  const records = rows
    .map((item) => (item && typeof item === "object" ? (item as Record<string, unknown>) : null))
    .filter((item): item is Record<string, unknown> => Boolean(item));

  const normalized: PersonnelNode[] = [];
  for (const row of sortBySortField(records)) {
    const id = normalizeIdLike(row.id) || normalizeIdLike(row.userId);
    if (!id) {
      continue;
    }
    const userId = normalizeIdLike(row.userId) || id;
    const parentId = resolveUserParentId(row, parentIdFallback);
    const companyId = resolveUserCompanyId(row);
    const title =
      normalizeString(row.title) ||
      normalizeString(row.nickName) ||
      normalizeString(row.name) ||
      normalizeString(row.userAccount) ||
      id;
    normalized.push({
      id,
      parentId,
      companyId,
      title,
      userId,
      nickName: normalizeString(row.nickName) || normalizeString(row.name) || title,
      userAccount: normalizeString(row.userAccount),
      phone: normalizeString(row.phone),
      nodeType: "user",
    });
  }
  return normalized;
}

function normalizeMixedNodes(rows: unknown[], parentIdFallback: string): PersonnelNode[] {
  const users: Record<string, unknown>[] = [];
  const orgs: Record<string, unknown>[] = [];

  rows.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }
    const row = item as Record<string, unknown>;
    if (isUserLikeRow(row)) {
      users.push(row);
      return;
    }
    orgs.push(row);
  });

  return [...normalizeUserNodes(users, parentIdFallback), ...normalizeOrgNodes(orgs, parentIdFallback)];
}

function normalizeContactNodes(data: unknown, parentIdFallback: string): PersonnelNode[] {
  const fallbackParentId = normalizeIdLike(parentIdFallback) || "0";

  if (Array.isArray(data)) {
    return normalizeMixedNodes(data, fallbackParentId);
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const payload = data as Record<string, unknown>;
  const orgRows = Array.isArray(payload.orgDetailList)
    ? payload.orgDetailList
    : Array.isArray(payload.orgIndustryContactVOS)
      ? payload.orgIndustryContactVOS
      : [];
  const userRows = Array.isArray(payload.userStructureQueryVOS)
    ? payload.userStructureQueryVOS
    : Array.isArray(payload.userList)
      ? payload.userList
      : [];

  const treeRows = [...normalizeUserNodes(userRows, fallbackParentId), ...normalizeOrgNodes(orgRows, fallbackParentId)];
  if (treeRows.length > 0) {
    return treeRows;
  }

  const listRows = Array.isArray(payload.records) ? payload.records : Array.isArray(payload.list) ? payload.list : [];
  return normalizeMixedNodes(listRows, fallbackParentId);
}

export function resolvePersonnelRootParentId(user: unknown): string {
  if (!user || typeof user !== "object") {
    return "0";
  }
  const companyId = normalizeIdLike((user as Record<string, unknown>).companyId);
  return companyId || "0";
}

export async function fetchPersonnelTreeByLegacyApi(params: { parentId?: string }): Promise<ApiResponse<PersonnelNode[]>> {
  const parentId = normalizeIdLike(params.parentId) || "0";
  const response = await obHttp().get<ApiResponse<unknown>>("/cmict/admin/org/detail/children-and-user", {
    params: {
      parentId,
    },
  });
  return {
    ...response,
    data: normalizeContactNodes(response?.data, parentId),
  };
}

export async function searchPersonnelUsersByStructure(
  params: { search?: string }
): Promise<ApiResponse<PersonnelUserNode[]>> {
  const response = await obHttp().get<ApiResponse<unknown>>("/cmict/admin/user/structure/search/", { params });
  const users = normalizeContactNodes(response?.data, "0").filter(
    (item): item is PersonnelUserNode => item.nodeType === "user"
  );
  return {
    ...response,
    data: users,
  };
}
