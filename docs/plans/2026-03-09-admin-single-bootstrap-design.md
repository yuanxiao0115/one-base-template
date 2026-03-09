# Admin 单启动链路净化设计

## 背景

当前 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/main.ts` 同时承担了以下职责：

- 运行时 OS 判断与根节点标记写入
- `platform-config.json` 加载
- `public/admin` 双启动链路分流
- 启动失败错误分类与 DOM 级错误页渲染

这套设计的初衷是为 `/login` 与 `/sso` 做匿名首屏性能优化，但近期已经暴露出两类问题：

1. 启动链路变长，定位失败原因更困难；
2. `main.ts` 负担过重，任何小改动都容易牵动启动时序。

用户已确认新的收敛方向：

- **不需要字体切换**
- **回退架构策略**
- **不需要双启动链路**

## 目标

将 admin 启动流程收敛为**单启动链路 + 通用错误兜底**：

- 所有路径统一走 `bootstrapAdminApp()`
- `main.ts` 只保留最小入口编排
- 删除 `public bootstrap`、启动模式判断与 OS 字体切换
- 保留 `platform-config` 前置加载与最基本的启动失败提示

## 非目标

- 不继续追求 `/login` 匿名首屏专项性能优化
- 不改登录页、SSO 页的业务协议、接口参数与跳转目标
- 不触碰权限、菜单、Layout、Tabs、Table 等业务逻辑

## 方案结论

采用 **方案 A：单启动链路 + 通用错误兜底**。

### 关键决策 1：删除双启动链路

以下链路整体退出：

- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/public.ts`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/public-entry.ts`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/entry.ts`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/switcher.ts`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/router/public-routes.ts`

`/login` 与 `/sso` 继续作为普通公共路由存在于 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/router/assemble-routes.ts`，但启动时不再做匿名链路分流。

### 关键决策 2：删除 OS 字体切换

以下能力退出：

- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/main.ts` 中的 `detectRuntimeOs()` / `applyRuntimeOsMarker()`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/styles/index.css` 中基于 `data-one-os` 的字体覆盖
- 文档中关于 `data-one-os` 的说明

### 关键决策 3：保留配置前置加载

`/Users/haoqiuzhi/code/one-base-template/apps/admin/src/config/platform-config.ts` 仍需在启动前完成加载，因为 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/infra/env.ts` 约束了 `getAppEnv()` 必须在配置就绪后读取。

### 关键决策 4：错误兜底降级为通用提示

不再在 `main.ts` 里维护按错误码拆分的多分支提示。

保留最小策略：

- 启动成功：`router.isReady()` 后挂载应用
- 启动失败：渲染统一错误提示，避免白屏

## 代码影响面

### 核心实现

- 修改 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/main.ts`
- 可能修改 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/index.ts`
- 修改 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/http.ts`
- 修改 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/pages/login/LoginPage.vue`
- 修改 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/pages/sso/SsoCallbackPage.vue`

### 待清理文件

- 删除 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/runtime.ts`
- 删除 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/public.ts`
- 删除 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/public-entry.ts`
- 删除 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/entry.ts`
- 删除 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/switcher.ts`
- 删除 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/router/public-routes.ts`

### 测试与文档

- 更新 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/__tests__/style-entries-source.test.ts`
- 删除或改写 public/bootstrap 相关测试
- 更新 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/__tests__/manual-chunks.test.ts`
- 更新 `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/architecture.md`
- 更新 `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/env.md`
- 更新 `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/theme-system.md`

## 风险与控制

### 风险 1：登录后跳转行为变化

原先 `public bootstrap` 下登录成功会整页 reload 回完整 admin 链路；回退为单链路后，登录成功将始终走 `router.replace()`。

控制：

- 保持 `/login`、`/sso` 已在主路由表中静态存在
- 定向回归登录、SSO、未授权回登录页再登录

### 风险 2：构建分包测试失效

现有 `manual-chunks` 测试大量写死了 `public bootstrap` 前提。

控制：

- 只保留单链路下仍然有价值的 chunk 断言
- 移除已失效的匿名链路分包断言

### 风险 3：文档与代码口径不一致

当前文档大量描述了 `public/admin` 双启动模型。

控制：

- 本次实现必须同步文档
- 至少补跑 `apps/docs build`

## 验证口径

最小验收：

- `pnpm -C apps/admin exec vitest run ...` 相关定向测试通过
- `pnpm -C apps/admin typecheck` 通过
- `pnpm -C apps/admin build` 通过
- `pnpm -C apps/docs build` 通过

行为回归：

- `/login` 可打开
- `/sso` 可打开
- 登录成功可进入业务页
- 未授权跳回 `/login` 不白屏

## 当前决定

该方案已由用户确认，可进入实施计划阶段。
