export interface RoleOption {
  id: string;
  name: string;
}

interface PermissionRoleSourceApi {
  listRoles: () => Promise<{ data?: unknown }>;
  pageRoles: (params: {
    currentPage: number;
    pageSize: number;
    roleName?: string;
  }) => Promise<{ data?: { records?: unknown } }>;
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

function toRoleOption(row: unknown): RoleOption | null {
  if (!row || typeof row !== 'object') {
    return null;
  }
  const record = row as Record<string, unknown>;
  const id = normalizeIdLike(record.id);
  if (!id) {
    return null;
  }
  const name = normalizeString(record.name) || normalizeString(record.roleName) || id;
  return {
    id,
    name
  };
}

function normalizeRoleOptions(rows: unknown): RoleOption[] {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => toRoleOption(item)).filter((item): item is RoleOption => Boolean(item));
}

export async function loadPermissionRoleOptions(
  api: PermissionRoleSourceApi
): Promise<RoleOption[]> {
  try {
    const listRes = await api.listRoles();
    const options = normalizeRoleOptions(listRes?.data);
    if (options.length > 0) {
      return options;
    }
  } catch {
    // 忽略并降级到分页接口。
  }

  const pageRes = await api.pageRoles({
    currentPage: 1,
    pageSize: 500
  });
  return normalizeRoleOptions(pageRes?.data?.records);
}
