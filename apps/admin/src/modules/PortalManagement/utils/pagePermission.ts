import type { PortalTab } from "../types";
import { isPortalTabEditable, normalizeIdLike, walkTabs } from "./portalTree";

export interface PagePermissionGroupPayload {
  roleIds: string[];
  userIds: string[];
}

export interface PagePermissionSubmitPayload {
  authType: "person" | "role";
  allowPerms: PagePermissionGroupPayload;
  forbiddenPerms: PagePermissionGroupPayload;
  configPerms: PagePermissionGroupPayload;
}

export interface TemplatePagePermissionTabOption {
  tabId: string;
  tabName: string;
}

export interface TemplatePagePermissionTreeNode {
  id: string;
  label: string;
  tabId: string;
  selectable: boolean;
  children?: TemplatePagePermissionTreeNode[];
}

export interface PortalTabPermissionUpdatePayload extends Partial<PortalTab> {
  id: string;
  tabName: string;
  templateId: string;
  sort: number;
  authType: "person" | "role";
  allowPerms: PagePermissionGroupPayload;
  forbiddenPerms: PagePermissionGroupPayload;
  configPerms: PagePermissionGroupPayload;
}

function normalizeRequiredIdLike(value: unknown, field: string): string {
  const normalized = normalizeIdLike(value);
  if (normalized) {
    return normalized;
  }
  throw new Error(`页面详情缺少必填字段：${field}`);
}

function normalizeRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`页面详情缺少必填字段：${field}`);
  }
  const normalized = value.trim();
  if (normalized) {
    return normalized;
  }
  throw new Error(`页面详情缺少必填字段：${field}`);
}

function normalizeRequiredNumber(value: unknown, field: string): number {
  const normalized = Number(value);
  if (Number.isFinite(normalized)) {
    return normalized;
  }
  throw new Error(`页面详情缺少必填字段：${field}`);
}

function normalizeRoleIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => normalizeIdLike(item)).filter(Boolean);
}

function normalizeUserIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => normalizeIdLike(item)).filter(Boolean);
}

function normalizePermissionGroup(group: unknown): PagePermissionGroupPayload {
  if (!group || typeof group !== "object") {
    return { roleIds: [], userIds: [] };
  }
  const payload = group as Record<string, unknown>;
  return {
    roleIds: normalizeRoleIds(payload.roleIds),
    userIds: normalizeUserIds(payload.userIds),
  };
}

export function collectTemplatePagePermissionTabs(tabs: PortalTab[] | undefined): TemplatePagePermissionTabOption[] {
  const options: TemplatePagePermissionTabOption[] = [];
  const seen = new Set<string>();

  walkTabs(tabs, (tab) => {
    if (!isPortalTabEditable(tab.tabType)) {
      return;
    }

    const tabId = normalizeIdLike(tab.id);
    if (!tabId || seen.has(tabId)) {
      return;
    }

    seen.add(tabId);
    options.push({
      tabId,
      tabName: typeof tab.tabName === "string" && tab.tabName.trim() ? tab.tabName.trim() : `页面-${tabId}`,
    });
  });

  return options;
}

export function buildTemplatePagePermissionTree(tabs: PortalTab[] | undefined): TemplatePagePermissionTreeNode[] {
  let autoGroupId = 0;

  function nextGroupId(): string {
    autoGroupId += 1;
    return `portal-perm-group-${autoGroupId}`;
  }

  function resolveTabLabel(tab: PortalTab, fallbackId: string): string {
    return typeof tab.tabName === "string" && tab.tabName.trim() ? tab.tabName.trim() : `页面-${fallbackId}`;
  }

  function walk(nodes: PortalTab[] | undefined): TemplatePagePermissionTreeNode[] {
    if (!Array.isArray(nodes)) {
      return [];
    }

    const result: TemplatePagePermissionTreeNode[] = [];
    for (const tab of nodes) {
      if (!tab || typeof tab !== "object") {
        continue;
      }

      const children = walk(tab.children);
      const tabId = normalizeIdLike(tab.id);
      const label = resolveTabLabel(tab, tabId || String(autoGroupId + 1));

      if (isPortalTabEditable(tab.tabType) && tabId) {
        const node: TemplatePagePermissionTreeNode = {
          id: tabId,
          label,
          tabId,
          selectable: true,
        };
        if (children.length > 0) {
          node.children = children;
        }
        result.push(node);
        continue;
      }

      if (children.length === 0) {
        continue;
      }

      result.push({
        id: tabId || nextGroupId(),
        label,
        tabId: "",
        selectable: false,
        children,
      });
    }
    return result;
  }

  return walk(tabs);
}

export function buildPortalTabPermissionUpdatePayload(
  tabDetail: Partial<PortalTab>,
  payload: PagePermissionSubmitPayload
): PortalTabPermissionUpdatePayload {
  const id = normalizeRequiredIdLike(tabDetail.id, "id");
  const tabName = normalizeRequiredString(tabDetail.tabName, "tabName");
  const templateId = normalizeRequiredIdLike(tabDetail.templateId, "templateId");
  const sort = normalizeRequiredNumber(tabDetail.sort, "sort");

  return {
    ...tabDetail,
    id,
    tabName,
    templateId,
    sort,
    authType: payload.authType === "role" ? "role" : "person",
    allowPerms: normalizePermissionGroup(payload.allowPerms),
    forbiddenPerms: normalizePermissionGroup(payload.forbiddenPerms),
    configPerms: normalizePermissionGroup(payload.configPerms),
  };
}
