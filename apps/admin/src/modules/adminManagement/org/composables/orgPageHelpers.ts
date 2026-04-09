import type { OrgRecord } from '../types';

interface DictOptionItem {
  itemValue?: number | string;
  itemName?: string;
}

interface AuthUserWithCompanyId {
  companyId?: number | string | null;
}

export function getDictLabelMap(items: DictOptionItem[]): Record<string, string> {
  return Object.fromEntries(
    items.map((item) => [String(item.itemValue ?? ''), item.itemName ?? ''])
  );
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function normalizeTreeRows(rows: unknown): OrgRecord[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  const treeRows = rows as OrgRecord[];
  return treeRows.map((row) => ({
    ...row,
    hasChildren: typeof row.hasChildren === 'boolean' ? row.hasChildren : true
  }));
}

export function getRootParentId(user: AuthUserWithCompanyId | null | undefined): string {
  const companyId = user?.companyId;

  if (typeof companyId === 'number' && Number.isFinite(companyId)) {
    return String(companyId);
  }

  if (typeof companyId === 'string' && companyId.trim()) {
    return companyId.trim();
  }

  return '0';
}
