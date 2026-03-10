import crypto from "node:crypto";
import type { Plugin } from "vite";
import { fail } from "./http-helpers";
import { handleApiRoutes, handleCmictRoutes } from "./route-handlers";
import type { OrgMockNode, PermissionMockNode } from "./types";

export function createAdminMockMiddleware(options?: { sczfwSystemPermissionCode?: string }): Plugin {
  // 简易内存会话：仅用于开发演示
  const sessions = new Map<string, { user: { id: string; name: string; companyId: string } }>();
  const cookieName = "ob_session";

  const sczfwSystemPermissionCode = options?.sczfwSystemPermissionCode ?? "admin_server";

  // token 模式（sczfw）mock：用 Authorization 头携带 token
  const tokenSessions = new Map<
    string,
    { user: { id: string; nickName: string; permissionCodes: string[]; roleCodes: string[]; companyId: string } }
  >();

  const orgNodes = new Map<string, OrgMockNode>();

  // 按项目约定保留空 mock，避免内置业务演示数据影响联调。
  const seedOrgNodes: OrgMockNode[] = [];

  for (const item of seedOrgNodes) {
    orgNodes.set(item.id, item);
  }

  const permissionTypeEnum = [
    { key: "1", value: "菜单" },
    { key: "2", value: "页面" },
    { key: "3", value: "按钮" },
  ];
  const permissionTypeLabelMap = new Map(permissionTypeEnum.map((item) => [item.key, item.value]));
  const permissionNodes = new Map<string, PermissionMockNode>();
  const seedPermissionNodes: PermissionMockNode[] = [];

  for (const item of seedPermissionNodes) {
    permissionNodes.set(item.id, item);
  }

  function hasOrgChildren(parentId: string) {
    for (const item of orgNodes.values()) {
      if (item.parentId === parentId) {
        return true;
      }
    }
    return false;
  }

  function toOrgRow(item: OrgMockNode) {
    return {
      ...item,
      hasChildren: hasOrgChildren(item.id),
    };
  }

  function listOrgChildren(parentId: string) {
    return Array.from(orgNodes.values())
      .filter((item) => item.parentId === parentId)
      .sort((a, b) => a.sort - b.sort)
      .map((item) => toOrgRow(item));
  }

  function isOrgInParentScope(item: OrgMockNode, parentId: string) {
    if (parentId === "0") {
      return true;
    }

    let currentParentId = item.parentId;
    while (currentParentId && currentParentId !== "0") {
      if (currentParentId === parentId) {
        return true;
      }
      const parent = orgNodes.get(currentParentId);
      if (!parent) {
        return false;
      }
      currentParentId = parent.parentId;
    }

    return false;
  }

  function listPermissionChildren(parentId: string) {
    return Array.from(permissionNodes.values())
      .filter((item) => item.parentId === parentId)
      .sort((a, b) => a.sort - b.sort);
  }

  function toPermissionRow(item: PermissionMockNode) {
    return {
      ...item,
      resourceTypeText: permissionTypeLabelMap.get(String(item.resourceType)) || "未知",
    };
  }

  function buildPermissionTree(parentId = "0") {
    return listPermissionChildren(parentId).map((item) => {
      const children = buildPermissionTree(item.id);
      return {
        ...toPermissionRow(item),
        children,
      };
    });
  }

  function flattenPermissionTree(tree: Record<string, unknown>[]) {
    const output: Record<string, unknown>[] = [];

    function walk(nodes: Record<string, unknown>[]) {
      nodes.forEach((node) => {
        const { children, ...rest } = node;
        output.push(rest);
        if (Array.isArray(children) && children.length > 0) {
          walk(children as Record<string, unknown>[]);
        }
      });
    }

    walk(tree);
    return output;
  }

  function listPermissionByFilter(params: { resourceName?: string; resourceType?: string }) {
    const keyword = (params.resourceName || "").trim();
    const resourceType = (params.resourceType || "").trim();

    return flattenPermissionTree(buildPermissionTree())
      .filter((item) => {
        const row = item as PermissionMockNode & { resourceTypeText?: string };
        const hitKeyword =
          !keyword ||
          row.resourceName.includes(keyword) ||
          row.permissionCode.includes(keyword) ||
          row.url.includes(keyword);
        const hitType = !resourceType || String(row.resourceType) === resourceType;
        return hitKeyword && hitType;
      })
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
  }

  function collectPermissionDescendantIds(id: string, ids: Set<string>) {
    if (!permissionNodes.has(id) || ids.has(id)) {
      return;
    }

    ids.add(id);
    listPermissionChildren(id).forEach((child) => {
      collectPermissionDescendantIds(child.id, ids);
    });
  }

  function formatDateTime(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }

  function createSession(userName: string) {
    const sid = crypto.randomUUID();
    sessions.set(sid, {
      user: {
        id: sid,
        name: userName,
        companyId: "org-1000",
      },
    });
    return sid;
  }

  function createTokenSession(userName: string) {
    const token = crypto.randomUUID();
    tokenSessions.set(token, {
      user: {
        id: token,
        nickName: userName,
        permissionCodes: [sczfwSystemPermissionCode],
        roleCodes: ["admin"],
        companyId: "org-1000",
      },
    });
    return token;
  }

  function clearSession(sid: string | undefined) {
    if (!sid) {
      return;
    }
    sessions.delete(sid);
  }

  return {
    name: "ob-dev-mock-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";

        const isApi = url.startsWith("/api/");
        const isCmict = url.startsWith("/cmict/");
        if (!(isApi || isCmict)) {
          return next();
        }

        const routeContext = {
          req,
          res,
          url,
          cookieName,
          sczfwSystemPermissionCode,
          sessions,
          tokenSessions,
          orgNodes,
          permissionNodes,
          permissionTypeEnum,
          createSession,
          createTokenSession,
          clearSession,
          hasOrgChildren,
          toOrgRow,
          listOrgChildren,
          isOrgInParentScope,
          toPermissionRow,
          buildPermissionTree,
          listPermissionByFilter,
          collectPermissionDescendantIds,
          formatDateTime,
        };

        try {
          if (isCmict && (await handleCmictRoutes(routeContext))) {
            return;
          }

          if (isApi && (await handleApiRoutes(routeContext))) {
            return;
          }

          return next();
        } catch (e: unknown) {
          const message = e instanceof Error && e.message ? e.message : "mock error";
          return fail(res, 500, message);
        }
      });
    },
  };
}
