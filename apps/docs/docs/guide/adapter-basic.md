# basic Adapter（接入与边界）

<div class="doc-tldr">
  <strong>TL;DR：</strong>`basicAdapter` 位于 `packages/adapters/src/basicAdapter.ts`，负责把 basic 后端协议映射为统一 `BackendAdapter` 契约；应用层只负责传入 `tokenKey/systemPermissionCode/SSO endpoint`。
</div>

## 适用范围

- 适用目录：`packages/adapters/**`、`apps/*/src/bootstrap/adapter.ts`
- 适用场景：basic 后端接入、菜单系统映射、SSO ticket 兑换
- 目标读者：后端协议对接者、前端基础架构维护者

## 1. 接口清单（当前实现）

| 能力         | Method | Path                                | 说明                                 |
| ------------ | ------ | ----------------------------------- | ------------------------------------ |
| 登录         | `POST` | `/cmict/auth/login`                 | 返回 `authToken`，写入本地 token     |
| 当前用户     | `GET`  | `/cmict/auth/token/verify`          | 映射为统一 `AppUser`                 |
| 菜单树       | `GET`  | `/cmict/admin/permission/my-tree`   | 按 `systemPermissionCode` 取系统子树 |
| 菜单系统列表 | `GET`  | `/cmict/admin/permission/my-tree`   | 映射为 `AppMenuSystem[]`             |
| ticket 兑换  | `GET`  | `ticketSsoEndpoint`                 | 兑换后写入 `authToken`               |
| 资源图片     | `GET`  | `/cmict/file/resource/show?id=<id>` | 返回 `blob`（图标/文件预览）         |

## 2. 真实行为（按能力）

### 2.1 认证

- `auth.login()`：把 `username/password/captcha/captchaKey/encrypt` 映射为后端字段（`userAccount/password/...`）。
- `auth.logout()`：调用 `/cmict/auth/logout`，并删除本地 token。
- `auth.fetchMe()`：把 basic 用户信息映射成统一 `AppUser` 字段。

### 2.2 菜单

- `menu.fetchMenuTree()`：按 `systemPermissionCode` 查找根系统，再映射树节点。
- `menu.fetchMenuSystems()`：将后端根系统数组映射成 `code/name/menus`。

### 2.3 SSO 与资源

- `sso.exchangeToken()`：直接落 token。
- `sso.exchangeTicket()`：调用 ticket 端点兑换并写 token。
- `assets.fetchImageBlob()`：统一走 blob 读取。

## 3. 应用层接入方式

### 3.1 admin / admin-lite

接入文件：

- `apps/admin/src/bootstrap/adapter.ts`
- `apps/admin-lite/src/bootstrap/adapter.ts`

接入要点：

1. `backend === 'basic'` 时调用 `createBasicAdapter(...)`。
2. 基于 `systemConfig` 对 `fetchMenuSystems()` 做系统范围过滤。
3. `single` 模式且后端无匹配系统时，回退固定系统，保证可用。

### 3.2 portal

接入文件：`apps/portal/src/bootstrap/adapter.ts`

- 同样使用 `createBasicAdapter(...)`。
- 不做 admin 那一层系统范围过滤增强。

## 4. 签名与加密职责边界

| 层级             | 文件                                               | 责任                                                              |
| ---------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| 应用层（admin）  | `apps/admin/src/services/security/crypto.ts`       | `createClientSignature` 适配 + `sm4EncryptBase64`（少量业务加密） |
| 应用层（portal） | `apps/portal/src/config/basic/crypto.ts`           | `createClientSignature` 适配                                      |
| core 通用算法    | `packages/core/src/http/client-signature.ts`       | 签名参数与三段式拼接                                              |
| core 注入逻辑    | `packages/core/src/http/basic-client-signature.ts` | 请求头注入 `Client-Signature`                                     |
| UI 共享登录      | `packages/ui/src/components/auth/LoginBox.vue` 等  | 登录框内部共享加密能力                                            |

## 5. 最小可运行路径

### 5.1 配置前提（以 admin 为例）

- `apps/admin/src/config/app.ts`：`backend: 'basic'`
- `authMode` 推荐 `token`
- 按需配置 `defaultSystemCode/systemHomeMap`

### 5.2 验证命令

在仓库根目录执行：

```bash
pnpm -C packages/adapters typecheck
pnpm -C packages/adapters lint
pnpm -C apps/docs build
```

通过标准：

1. adapters 类型与 lint 通过。
2. 文档构建通过。

## 6. 常见问题

| 问题                       | 原因                                      | 处理方式                                      |
| -------------------------- | ----------------------------------------- | --------------------------------------------- |
| 登录成功但提示未返回 token | 后端返回字段不含 `authToken/token`        | 检查登录响应体并对齐字段                      |
| 菜单为空                   | `systemPermissionCode` 与后端根节点不匹配 | 校对 `systemConfig.code/defaultSystemCode`    |
| 多系统显示不符合预期       | 应用层未按 `systemConfig` 过滤            | 检查 `apps/*/bootstrap/adapter.ts` 的过滤逻辑 |

## 7. 相关阅读

- [菜单与路由规范（Schema）](/guide/menu-route-spec)
- [配置模型（apps/admin / admin-lite）](/guide/env)
- [目录结构与边界](/guide/architecture)
