# admin-lite 后台基座

> 项目路径：`apps/admin-lite`
> 当前定位：**后台快速起项目基座**

## TL;DR

- `admin-lite` 由 `apps/admin` 收敛而来，用于承接新的后台管理项目。
- 默认模块只保留：`home`、`admin-management`、`system-management`、`log-management`。
- `pnpm new:app <app-id>` 已切到从 `apps/admin-lite` 复制，默认仅保留 `home` 模块。
- 强业务扩展默认不启用，确有需要时必须做成可开关能力。

## 1. 目标与边界

### 目标

- 提供与 `admin` 同构的后台启动骨架。
- 提供可直接派生新后台项目的默认母版。
- 让业务同学优先在 `modules/**` 开发，而不是反复搭底座。

### 非目标

- 不把 CMS、Portal、公文表单等强业务模块继续塞进默认基线。
- 不再把 `admin-lite` 当成“最小静态示例”。
- 不在默认配置里保留明显绑定当前业务的扩展能力。

## 2. 默认模块

`apps/admin-lite/src/config/app.ts` 当前默认模块为：

- `home`
- `admin-management`
- `system-management`
- `log-management`

设计原则：

- 先满足后台项目最常见的基础能力。
- 扩展模块一律按需回接，不反向污染基座默认值。

可选示例模块（默认关闭）：

- `starter-crud`：用于演示 `ObPageContainer + ObTableBox + ObTable + ObCrudContainer` 的标准 CRUD 编排。
- `demo-management`：用于演示“模块级骨架（legacy 路由聚合）+ 子业务骨架（user 结构）”迁移模板。

开启方式（代码静态配置）：

```ts
// apps/admin-lite/src/config/app.ts
const enableStarterCrudDemoModule = true;
const enableDemoManagementTemplateModule = true;

const moduleConfig = {
  enabledModules: ['home', 'admin-management', 'log-management', 'system-management']
    .concat(enableStarterCrudDemoModule ? 'starter-crud' : [])
    .concat(enableDemoManagementTemplateModule ? 'demo-management' : [])
};
```

## 3. 默认关闭的扩展

`apps/admin-lite/src/config/ui.ts` 已将以下能力收口为可配置或默认关闭：

- 顶栏租户切换
- 素材图片缓存
- 强业务模块扩展入口

推荐流程：

1. 新项目先按默认配置启动。
2. 明确业务需要后，再显式打开对应扩展能力。
3. 打开新扩展时同步更新 README、AGENTS 与 docs。

## 4. 启动骨架

核心链路固定为：

- `src/main.ts`
- `src/bootstrap/startup.ts`
- `src/bootstrap/index.ts`
- `src/config/app.ts`
- `src/config/ui.ts`

约束：

- 平台配置只认 `app.ts`。
- UI 开关只认 `ui.ts`。
- 登录页、顶栏、启动链路禁止散落业务化分支。
- `systemConfig.mode === 'single'` 时会按 `systemConfig.code` 收口系统范围；即使后端返回多系统，也只展示配置系统。

## 5. 新项目派生方式

在仓库根目录执行：

```bash
pnpm new:app <app-id>
pnpm new:app <app-id> --preset minimal
pnpm new:app <app-id> --with-admin-management --with-log-management --with-system-management
pnpm new:app <app-id> --preset enterprise
pnpm new:app <app-id> --with-crud-starter
pnpm new:app <app-id> --dry-run
```

脚手架会：

- 从 `apps/admin-lite` 复制项目骨架。
- 默认 preset 为 `minimal`，可选：
  - `minimal`：只保留 `home` 模块，顶栏能力最小化（关闭个人中心/改密/个性化）。
  - `standard`：仍只保留 `home` 模块，恢复标准顶栏能力（个人中心/改密/个性化）。
  - `enterprise`：在 `standard` 基础上开启 `tenantSwitcher`。
- 通过 `--with-admin-management --with-log-management --with-system-management` 可按需追加后台管理基础模块。
- 自动替换应用名、样式入口、构建配置与存储命名空间。
- 可选附带 `starter-crud` 起步模块。

子项目内模块脚手架（根目录不再提供 `new:module`）：

```bash
pnpm -C apps/<app-id> new:module demo-management --route demo/management
pnpm -C apps/<app-id> new:module:item user --module demo-management --route /demo/management/user
```

生成后建议直接验证：

```bash
pnpm -C apps/<app-id> typecheck
pnpm -C apps/<app-id> lint
pnpm -C apps/<app-id> lint:arch
pnpm -C apps/<app-id> test:run
pnpm -C apps/<app-id> build
```

补充：

- `lint` / `lint:fix` 默认经仓库根包装脚本执行，避免 `vite-plus@0.1.14` 在派生 app 目录下直接执行 `vp lint/check` 时触发通用配置解析异常。

## 6. 模块开发基线

新增后台模块时，默认沿用：

- `routes.ts`
- `api.ts`
- `types.ts`
- `list.vue`

红线：

- 列表页统一使用 `ObPageContainer + ObTableBox + ObTable`。
- 新增/编辑/查看统一使用 `ObCrudContainer`。
- 模块目录优先 feature-first，不新增无收益的中间层。

## 7. 验证命令

```bash
pnpm -C apps/admin-lite typecheck
pnpm -C apps/admin-lite lint
pnpm -C apps/admin-lite lint:arch
pnpm -C apps/admin-lite test:run
pnpm -C apps/admin-lite build
```

涉及文档或规则改动时，再补：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 8. 相关文档

- `apps/admin-lite/README.md`
- `apps/admin-lite/AGENTS.md`
- `/guide/admin-lite-agent-redlines`
- `/guide/quick-start`
