# 模块系统与 CLI 切割

从 2026-02-27 起，`apps/admin` 采用 **模块 Manifest 驱动** 的路由组装方式，目标是让模块可以被 CLI 稳定裁剪。

## 1) 模块入口约定

每个业务模块必须提供 `module.ts` 作为唯一入口：

```text
apps/admin/src/modules/<module-id>/
  module.ts
  routes/
    layout.ts
    standalone.ts   # 可选
  api/
  services/
  stores/
  pages/
  components/
  compat/
```

`module.ts` 必填字段：

- `id`: 模块标识（如 `portal`）
- `version`: 当前固定为 `'1'`
- `enabledByDefault`: 是否默认启用
- `routes.layout`: 挂载到 `AdminLayout` 下的路由
- `routes.standalone`（可选）: 顶层路由（全屏/匿名等）
- `apiNamespace`: API 命名空间
- `compat`（可选）: 历史路径/字段兼容描述

## 2) 路由组装规则

- 统一入口：`apps/admin/src/router/module-system/assemble-routes.ts`
- 扫描来源：`apps/admin/src/modules/**/module.ts`
- 全局固定路由仅保留：`/login`、`/sso`、`/403`、`/404`、404 兜底
- 业务路由一律来自模块 Manifest

这意味着：

- 顶层特例（如门户设计器）不再写在 `router/index.ts`
- 删除模块目录后，不会残留对应路由注册

## 3) enabledModules 运行时开关

`apps/admin/public/platform-config.json` 新增：

```json
{
  "enabledModules": "*"
}
```

支持两种形式：

- `"*"`：启用全部已注册模块
- `string[]`：白名单启用（如 `['home', 'portal']`）

示例（只保留首页与门户）：

```json
{
  "enabledModules": ["home", "portal"]
}
```

## 4) API 分层约束

页面层只允许调用 `services/*`，不直接依赖 HTTP 客户端。

推荐结构：

- `api/endpoints.ts`：路径常量
- `api/contracts.ts`：请求/响应类型
- `api/client.ts`：唯一请求实现
- `services/*.ts`：页面用例编排
- `compat/*.ts`：历史字段映射（如 `whiteList -> whiteDTOS`）

## 5) ESLint 边界约束

当前已启用两条硬约束：

1. `apps/admin/src/modules/**/*` 禁止直接 `@/modules/*` 互相依赖
2. 页面/组件/store 禁止直接引用 `@/infra/http`

这样可以减少模块间隐式耦合，确保模块可切割。

## 6) 面向 CLI 的最小契约

CLI 生成器可按以下步骤裁剪：

1. 读取 `platform-config.enabledModules`
2. 过滤模块 Manifest
3. 只组装白名单模块路由
4. 物理删除未选模块目录后执行验证：
   - `pnpm -w typecheck`
   - `pnpm -w lint`
   - `pnpm -w build`

通过该契约，可以稳定支持 `--modules home,portal,...` 的脚手架生成策略。

## 7) 命名规则复用（生成器推荐）

为减少生成代码与现有代码命名风格偏差，建议 CLI 同时读取命名白名单：

- 文档说明：`/guide/naming-whitelist`
- 机器可读文件：`apps/docs/public/cli-naming-whitelist.json`
