import crypto from "node:crypto";
import { fail, json, ok, parseCookies, readJsonBody, setCookie } from "./http-helpers";
import type { AdminMockRouteContext, JsonObject, OrgMockNode, PermissionMockNode } from "./types";

export async function handleCmictRoutes(ctx: AdminMockRouteContext): Promise<boolean> {
  const { req, res, url } = ctx;

  if (!url.startsWith("/cmict/")) {
    return false;
  }

  // 登录页配置
  if (req.method === "GET" && url.startsWith("/cmict/portal/getLoginPage")) {
    ok(res, { webLogoText: "统一门户高效协同", loginPageFodders: [] });
    return true;
  }

  // 滑块验证码：获取
  if (req.method === "GET" && url.startsWith("/cmict/auth/captcha/block-puzzle")) {
    const onePxPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6XbWQAAAABJRU5ErkJggg==";
    ok(res, {
      originBase64: onePxPng,
      jigsawBase64: onePxPng,
      captchaKey: crypto.randomUUID(),
    });
    return true;
  }

  // 滑块验证码：校验（mock 一律通过）
  if (req.method === "GET" && url.startsWith("/cmict/auth/captcha/check")) {
    ok(res, true);
    return true;
  }

  // 登录（token 模式）
  if (req.method === "POST" && url === "/cmict/auth/login") {
    const body = await readJsonBody(req);
    const userName = typeof body.userAccount === "string" && body.userAccount ? body.userAccount : "demo";

    const token = ctx.createTokenSession(userName);
    ok(res, {
      authToken: token,
      id: token,
      nickName: userName,
      permissionCodes: [ctx.sczfwSystemPermissionCode],
      roleCodes: ["admin"],
    });
    return true;
  }

  // 外部 SSO：portal / om（以 token 兑换 authToken）
  if (req.method === "GET" && url.startsWith("/cmict/auth/external/portal/sso")) {
    const u = new URL(url, "http://localhost");
    const raw = u.searchParams.get("token") || "demo";
    const token = ctx.createTokenSession(`portal-${raw}`);
    ok(res, { authToken: token, token });
    return true;
  }

  if (req.method === "GET" && url.startsWith("/cmict/auth/external/om/sso")) {
    const u = new URL(url, "http://localhost");
    const raw = u.searchParams.get("token") || "demo";
    const token = ctx.createTokenSession(`om-${raw}`);
    ok(res, { authToken: token, token });
    return true;
  }

  // 外部 SSO：智慧协同 / 移动办公
  if (req.method === "GET" && url.startsWith("/cmict/auth/external/zhxt/sso")) {
    const u = new URL(url, "http://localhost");
    const raw = u.searchParams.get("zhxt-token") || "demo";
    const token = ctx.createTokenSession(`zhxt-${raw}`);
    ok(res, { authToken: token });
    return true;
  }

  if (req.method === "GET" && url.startsWith("/cmict/auth/external/ydbg/sso")) {
    const u = new URL(url, "http://localhost");
    const raw = u.searchParams.get("ydbg-token") || "demo";
    const token = ctx.createTokenSession(`ydbg-${raw}`);
    ok(res, { authToken: token });
    return true;
  }

  // 票据验证（ticket -> authToken）
  if (req.method === "GET" && url.startsWith("/cmict/auth/ticket/sso")) {
    const u = new URL(url, "http://localhost");
    const raw = u.searchParams.get("ticket") || "demo";
    const token = ctx.createTokenSession(`ticket-${raw}`);
    ok(res, { authToken: token });
    return true;
  }

  // 统一桌面：换取 idToken
  if (req.method === "POST" && url.startsWith("/cmict/uaa/unity-desktop/sso-login")) {
    const token = req.headers.authorization;
    if (!token) {
      fail(res, 401, "未登录");
      return true;
    }
    ok(res, { idToken: `idToken-${token}` });
    return true;
  }

  // 当前用户
  if (req.method === "GET" && url.startsWith("/cmict/auth/token/verify")) {
    const token = req.headers.authorization;
    const session = token ? ctx.tokenSessions.get(token) : undefined;
    if (!session) {
      fail(res, 401, "未登录");
      return true;
    }
    ok(res, session.user);
    return true;
  }

  // 登出
  if (req.method === "GET" && url.startsWith("/cmict/auth/logout")) {
    const token = req.headers.authorization;
    if (token) {
      ctx.tokenSessions.delete(token);
    }
    ok(res);
    return true;
  }

  // 登录日志：客户端枚举
  if (req.method === "GET" && url.startsWith("/cmict/auth/login-record/client-type/enum")) {
    ok(res, [
      { key: "pc", value: "PC 端" },
      { key: "mobile", value: "移动端" },
      { key: "mini", value: "小程序" },
      { key: "pad", value: "平板端" },
    ]);
    return true;
  }

  const loginRecords: Record<string, unknown>[] = [];

  // 登录日志：分页
  if (req.method === "GET" && url.startsWith("/cmict/auth/login-record/page")) {
    const u = new URL(url, "http://localhost");
    const nickName = (u.searchParams.get("nickName") || "").trim();
    const clientType = (u.searchParams.get("clientType") || "").trim();
    const startTime = (u.searchParams.get("startTime") || "").trim();
    const endTime = (u.searchParams.get("endTime") || "").trim();

    const currentPage = Number(
      u.searchParams.get("currentPage") || u.searchParams.get("current") || u.searchParams.get("page") || 1
    );
    const pageSize = Number(u.searchParams.get("pageSize") || u.searchParams.get("size") || 10);

    let records = [...loginRecords];

    if (nickName) {
      records = records.filter((item) => String(item.nickName ?? "").includes(nickName));
    }

    if (clientType) {
      records = records.filter((item) => item.clientType === clientType);
    }

    if (startTime) {
      records = records.filter((item) => String(item.createTime ?? "").slice(0, 10) >= startTime);
    }

    if (endTime) {
      records = records.filter((item) => String(item.createTime ?? "").slice(0, 10) <= endTime);
    }

    const safeCurrentPage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10;
    const total = records.length;
    const start = (safeCurrentPage - 1) * safePageSize;
    const pageRecords = records.slice(start, start + safePageSize);

    ok(res, {
      records: pageRecords,
      total,
      currentPage: safeCurrentPage,
      pageSize: safePageSize,
    });
    return true;
  }

  // 登录日志：详情
  if (req.method === "GET" && url.startsWith("/cmict/auth/login-record/detail")) {
    const u = new URL(url, "http://localhost");
    const id = u.searchParams.get("id") || "1";
    const record = loginRecords.find((item) => String(item.id ?? "") === id);
    if (!record) {
      fail(res, 400, "参数错误");
      return true;
    }

    ok(res, record);
    return true;
  }

  // 登录日志：删除
  if (req.method === "POST" && url.startsWith("/cmict/auth/login-record/delete")) {
    const body = await readJsonBody(req);
    const idList = Array.isArray(body.idList) ? body.idList : [];
    if (idList.length === 0) {
      fail(res, 400, "请选择待删除记录");
      return true;
    }
    ok(res, null);
    return true;
  }

  // 组织管理：树查询（懒加载）
  if (req.method === "GET" && url.startsWith("/cmict/admin/org/children")) {
    const u = new URL(url, "http://localhost");
    const parentId = (u.searchParams.get("parentId") || "0").trim() || "0";
    ok(res, ctx.listOrgChildren(parentId));
    return true;
  }

  // 组织管理：关键字搜索（返回扁平结果）
  if (req.method === "GET" && url.startsWith("/cmict/admin/org/search")) {
    const u = new URL(url, "http://localhost");
    const parentId = (u.searchParams.get("parentId") || "0").trim() || "0";
    const keyword = (u.searchParams.get("orgName") || "").trim();

    if (parentId !== "0" && !ctx.orgNodes.has(parentId)) {
      ok(res, []);
      return true;
    }

    const list = Array.from(ctx.orgNodes.values())
      .filter((item) => ctx.isOrgInParentScope(item, parentId))
      .filter((item) => !keyword || item.orgName.includes(keyword) || item.briefName.includes(keyword))
      .sort((a, b) => a.sort - b.sort)
      .map((item) => ctx.toOrgRow(item));

    ok(res, list);
    return true;
  }

  // 组织管理：新增
  if (req.method === "POST" && url.startsWith("/cmict/admin/org/add")) {
    const body = await readJsonBody(req);
    const payload = (body.data && typeof body.data === "object" ? body.data : body) as JsonObject;
    const orgName = typeof payload.orgName === "string" ? payload.orgName.trim() : "";
    const parentId = typeof payload.parentId === "string" && payload.parentId ? payload.parentId : "0";

    if (!orgName) {
      fail(res, 400, "组织名称不能为空");
      return true;
    }
    if (parentId !== "0" && !ctx.orgNodes.has(parentId)) {
      fail(res, 400, "上级组织不存在");
      return true;
    }

    const nextId = `org-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const parent = ctx.orgNodes.get(parentId);
    const nextNode: OrgMockNode = {
      id: nextId,
      parentId,
      orgName,
      briefName: typeof payload.briefName === "string" && payload.briefName ? payload.briefName : orgName,
      sort: Number(payload.sort || 10),
      orgCategory: typeof payload.orgCategory === "string" && payload.orgCategory ? payload.orgCategory : "2",
      orgLevelName:
        typeof payload.orgLevelName === "string" && payload.orgLevelName
          ? payload.orgLevelName
          : parent
            ? "三级"
            : "一级",
      institutionalType:
        typeof payload.institutionalType === "string" && payload.institutionalType
          ? payload.institutionalType
          : parent
            ? "3"
            : "1",
      uscc:
        typeof payload.uscc === "string" && payload.uscc
          ? payload.uscc
          : `91310100MA${Date.now().toString().slice(-8)}`,
      createTime: ctx.formatDateTime(new Date()),
      orgType: Number(payload.orgType || (parent ? 2 : 1)),
      isExternal: Boolean(payload.isExternal),
    };

    ctx.orgNodes.set(nextId, nextNode);
    ok(res, ctx.toOrgRow(nextNode));
    return true;
  }

  // 组织管理：编辑
  if (req.method === "POST" && url.startsWith("/cmict/admin/org/update")) {
    const body = await readJsonBody(req);
    const payload = (body.data && typeof body.data === "object" ? body.data : body) as JsonObject;
    const id = typeof payload.id === "string" ? payload.id : "";

    if (!(id && ctx.orgNodes.has(id))) {
      fail(res, 400, "组织不存在");
      return true;
    }

    const current = ctx.orgNodes.get(id) as OrgMockNode;
    const nextNode: OrgMockNode = {
      ...current,
      orgName:
        typeof payload.orgName === "string" && payload.orgName.trim() ? payload.orgName.trim() : current.orgName,
      briefName:
        typeof payload.briefName === "string" && payload.briefName.trim()
          ? payload.briefName.trim()
          : current.briefName,
      sort: Number(payload.sort || current.sort),
      orgCategory:
        typeof payload.orgCategory === "string" && payload.orgCategory ? payload.orgCategory : current.orgCategory,
      orgLevelName:
        typeof payload.orgLevelName === "string" && payload.orgLevelName ? payload.orgLevelName : current.orgLevelName,
      institutionalType:
        typeof payload.institutionalType === "string" && payload.institutionalType
          ? payload.institutionalType
          : current.institutionalType,
      uscc: typeof payload.uscc === "string" && payload.uscc ? payload.uscc : current.uscc,
      orgType: Number(payload.orgType || current.orgType),
      isExternal: typeof payload.isExternal === "boolean" ? payload.isExternal : current.isExternal,
    };

    ctx.orgNodes.set(id, nextNode);
    ok(res, ctx.toOrgRow(nextNode));
    return true;
  }

  // 组织管理：删除
  if (req.method === "POST" && url.startsWith("/cmict/admin/org/delete")) {
    const body = await readJsonBody(req);
    const payload = (body.data && typeof body.data === "object" ? body.data : body) as JsonObject;
    const id = typeof payload.id === "string" ? payload.id : "";

    if (!(id && ctx.orgNodes.has(id))) {
      fail(res, 400, "组织不存在");
      return true;
    }
    if (ctx.hasOrgChildren(id)) {
      fail(res, 400, "请先删除下级组织后再删除当前组织");
      return true;
    }

    ctx.orgNodes.delete(id);
    ok(res, null);
    return true;
  }

  // 权限管理：资源类型枚举
  if (req.method === "GET" && url.startsWith("/cmict/admin/permission/resource-type/enum")) {
    ok(res, ctx.permissionTypeEnum);
    return true;
  }

  // 权限管理：树结构
  if (req.method === "GET" && url.startsWith("/cmict/admin/permission/tree")) {
    ok(res, ctx.buildPermissionTree());
    return true;
  }

  // 权限管理：列表查询（筛选模式）
  if (req.method === "GET" && url.startsWith("/cmict/admin/permission/list")) {
    const u = new URL(url, "http://localhost");
    const resourceName = (u.searchParams.get("resourceName") || "").trim();
    const resourceType = (u.searchParams.get("resourceType") || "").trim();
    ok(res, ctx.listPermissionByFilter({ resourceName, resourceType }));
    return true;
  }

  // 权限管理：新增
  if (req.method === "POST" && url.startsWith("/cmict/admin/permission/add")) {
    const body = await readJsonBody(req);
    const payload = (body.data && typeof body.data === "object" ? body.data : body) as JsonObject;
    const resourceName = typeof payload.resourceName === "string" ? payload.resourceName.trim() : "";
    const rawParentId = typeof payload.parentId === "string" && payload.parentId ? payload.parentId : "0";
    const parentId = rawParentId !== "0" && !ctx.permissionNodes.has(rawParentId) ? "0" : rawParentId;

    if (!resourceName) {
      fail(res, 400, "权限名称不能为空");
      return true;
    }

    const id = `perm-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const resourceType = Number(payload.resourceType || 1);
    const nextNode: PermissionMockNode = {
      id,
      parentId,
      resourceType,
      resourceName,
      permissionCode:
        typeof payload.permissionCode === "string" && payload.permissionCode.trim()
          ? payload.permissionCode.trim()
          : `permission:${id}`,
      icon: typeof payload.icon === "string" ? payload.icon : "",
      image: typeof payload.image === "string" ? payload.image : "",
      url: typeof payload.url === "string" ? payload.url : "",
      openMode: Number(payload.openMode || 0),
      redirect: typeof payload.redirect === "string" ? payload.redirect : "",
      routeCache: Number(payload.routeCache || 0),
      sort: Number(payload.sort || 10),
      hidden: Number(payload.hidden || 0),
      component: typeof payload.component === "string" ? payload.component : "",
      remark: typeof payload.remark === "string" ? payload.remark : "",
    };

    ctx.permissionNodes.set(id, nextNode);
    ok(res, ctx.toPermissionRow(nextNode));
    return true;
  }

  // 权限管理：更新
  if (req.method === "POST" && url.startsWith("/cmict/admin/permission/update")) {
    const body = await readJsonBody(req);
    const payload = (body.data && typeof body.data === "object" ? body.data : body) as JsonObject;
    const id = typeof payload.id === "string" ? payload.id : "";

    if (!(id && ctx.permissionNodes.has(id))) {
      fail(res, 400, "权限不存在");
      return true;
    }

    const current = ctx.permissionNodes.get(id) as PermissionMockNode;
    const candidateParentId =
      typeof payload.parentId === "string" && payload.parentId ? payload.parentId : current.parentId;
    const parentId = candidateParentId || "0";

    if (parentId !== "0" && !ctx.permissionNodes.has(parentId)) {
      fail(res, 400, "上级权限不存在");
      return true;
    }

    const forbiddenIds = new Set<string>();
    ctx.collectPermissionDescendantIds(id, forbiddenIds);
    if (forbiddenIds.has(parentId)) {
      fail(res, 400, "上级权限不能选择当前节点或其下级节点");
      return true;
    }

    const nextNode: PermissionMockNode = {
      ...current,
      parentId,
      resourceType: Number(payload.resourceType ?? current.resourceType),
      resourceName:
        typeof payload.resourceName === "string" && payload.resourceName.trim()
          ? payload.resourceName.trim()
          : current.resourceName,
      permissionCode:
        typeof payload.permissionCode === "string" && payload.permissionCode.trim()
          ? payload.permissionCode.trim()
          : current.permissionCode,
      icon: typeof payload.icon === "string" ? payload.icon : current.icon,
      image: typeof payload.image === "string" ? payload.image : current.image,
      url: typeof payload.url === "string" ? payload.url : current.url,
      openMode: Number(payload.openMode ?? current.openMode),
      redirect: typeof payload.redirect === "string" ? payload.redirect : current.redirect,
      routeCache: Number(payload.routeCache ?? current.routeCache),
      sort: Number(payload.sort ?? current.sort),
      hidden: Number(payload.hidden ?? current.hidden),
      component: typeof payload.component === "string" ? payload.component : current.component,
      remark: typeof payload.remark === "string" ? payload.remark : current.remark,
    };

    ctx.permissionNodes.set(id, nextNode);
    ok(res, ctx.toPermissionRow(nextNode));
    return true;
  }

  // 权限管理：删除（级联删除）
  if (req.method === "POST" && url.startsWith("/cmict/admin/permission/delete")) {
    const body = await readJsonBody(req);
    const payload = (body.data && typeof body.data === "object" ? body.data : body) as JsonObject;

    const idList = Array.isArray(payload.idList)
      ? payload.idList.map((item) => (typeof item === "string" ? item : "")).filter((item) => Boolean(item))
      : typeof payload.idList === "string" && payload.idList
        ? [payload.idList]
        : [];

    if (idList.length === 0) {
      fail(res, 400, "请选择待删除权限");
      return true;
    }

    const removeIds = new Set<string>();
    idList.forEach((id) => {
      ctx.collectPermissionDescendantIds(id, removeIds);
    });

    removeIds.forEach((id) => {
      ctx.permissionNodes.delete(id);
    });

    ok(res, null);
    return true;
  }

  // 菜单树（my-tree）
  if (req.method === "GET" && url.startsWith("/cmict/admin/permission/my-tree")) {
    void ctx.sczfwSystemPermissionCode;
    ok(res, []);
    return true;
  }

  return false;
}

export async function handleApiRoutes(ctx: AdminMockRouteContext): Promise<boolean> {
  const { req, res, url } = ctx;

  if (!url.startsWith("/api/")) {
    return false;
  }

  // 登录
  if (req.method === "POST" && url === "/api/auth/login") {
    const body = await readJsonBody(req);
    const userName = typeof body.username === "string" && body.username ? body.username : "demo";

    const sid = ctx.createSession(userName);
    setCookie(res, `${ctx.cookieName}=${encodeURIComponent(sid)}; HttpOnly; Path=/; SameSite=Lax`);
    ok(res);
    return true;
  }

  // 登出
  if (req.method === "POST" && url === "/api/auth/logout") {
    const cookies = parseCookies(req.headers.cookie);
    ctx.clearSession(cookies[ctx.cookieName]);
    setCookie(res, `${ctx.cookieName}=; Max-Age=0; HttpOnly; Path=/; SameSite=Lax`);
    ok(res);
    return true;
  }

  // 当前用户
  if (req.method === "GET" && url === "/api/auth/me") {
    const cookies = parseCookies(req.headers.cookie);
    const sid = cookies[ctx.cookieName];
    const session = sid ? ctx.sessions.get(sid) : undefined;
    if (!session) {
      fail(res, 401, "未登录");
      return true;
    }
    ok(res, session.user);
    return true;
  }

  // 菜单树
  if (req.method === "GET" && url === "/api/menu/tree") {
    ok(res, []);
    return true;
  }

  // 下载示例：返回二进制流（触发 core 的 autoDownload）
  if (req.method === "GET" && url === "/api/demo/download") {
    const cookies = parseCookies(req.headers.cookie);
    const sid = cookies[ctx.cookieName];
    const session = sid ? ctx.sessions.get(sid) : undefined;
    if (!session) {
      fail(res, 401, "未登录");
      return true;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", 'attachment; filename="ob-demo.txt"');

    const content = ["one-base-template demo download", `user=${session.user.name}`, `time=${new Date().toISOString()}`].join(
      "\n"
    );

    res.end(Buffer.from(content, "utf-8"));
    return true;
  }

  // 下载错误示例：虽然是“下载接口”，但返回 JSON 业务错误（用于验证 blob->json 探测）
  if (req.method === "GET" && url === "/api/demo/download-error") {
    json(res, 200, { code: 500, data: null, message: "下载失败：模拟业务错误" });
    return true;
  }

  // SSO: token/ticket/code 换会话
  if (req.method === "POST" && url.startsWith("/api/sso/")) {
    const sid = ctx.createSession("sso-user");
    setCookie(res, `${ctx.cookieName}=${encodeURIComponent(sid)}; HttpOnly; Path=/; SameSite=Lax`);
    ok(res);
    return true;
  }

  return false;
}
