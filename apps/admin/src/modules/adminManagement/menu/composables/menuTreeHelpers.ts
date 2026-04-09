import type { MenuPermissionRecord } from '../types';
import type { ParentOption } from '../form';

export const ROOT_PARENT_ID = '0';
export const SYSTEM_RESOURCE_TYPE = 1;
export const MENU_RESOURCE_TYPE = 2;

export function isSystemNode(row: MenuPermissionRecord): boolean {
  return (
    row.resourceType === SYSTEM_RESOURCE_TYPE || (row.parentId ?? ROOT_PARENT_ID) === ROOT_PARENT_ID
  );
}

export function getTreeRows(data: unknown): MenuPermissionRecord[] {
  return Array.isArray(data) ? (data as MenuPermissionRecord[]) : [];
}

export function getSystemNodes(rows: MenuPermissionRecord[]): MenuPermissionRecord[] {
  return rows.filter((row) => isSystemNode(row));
}

export function findSystemNodeById(
  rows: MenuPermissionRecord[],
  systemId: string
): MenuPermissionRecord | null {
  const systems = getSystemNodes(rows);
  const matched = systems.find((row) => row.id === systemId);
  return matched || null;
}

export function findSystemScopeIdByNodeId(
  rows: MenuPermissionRecord[],
  nodeId: string,
  currentSystemId = ''
): string {
  for (const row of rows) {
    const nextSystemId = isSystemNode(row) ? row.id : currentSystemId;

    if (row.id === nodeId) {
      return nextSystemId;
    }

    if (Array.isArray(row.children) && row.children.length > 0) {
      const found = findSystemScopeIdByNodeId(row.children, nodeId, nextSystemId);
      if (found) {
        return found;
      }
    }
  }

  return '';
}

function markNodeChildren(row: MenuPermissionRecord, ids: Set<string>) {
  if (!Array.isArray(row.children) || row.children.length === 0) {
    return;
  }

  row.children.forEach((child) => {
    ids.add(child.id);
    markNodeChildren(child, ids);
  });
}

export function markDescendants(
  rows: MenuPermissionRecord[],
  targetId: string,
  ids: Set<string>
): boolean {
  for (const row of rows) {
    if (row.id === targetId) {
      ids.add(row.id);
      markNodeChildren(row, ids);
      return true;
    }

    if (Array.isArray(row.children) && row.children.length > 0) {
      const found = markDescendants(row.children, targetId, ids);
      if (found) {
        return true;
      }
    }
  }

  return false;
}

export function toParentTreeOptions(
  rows: MenuPermissionRecord[],
  disabledIds: Set<string>
): ParentOption[] {
  return rows.map((row) => ({
    value: row.id,
    label: row.resourceName,
    disabled: disabledIds.has(row.id),
    children: toParentTreeOptions(row.children || [], disabledIds)
  }));
}
