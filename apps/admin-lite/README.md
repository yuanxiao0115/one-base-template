# admin-lite 后台基座指南

> 适用目录：`apps/admin-lite/**`
>
> 目标：作为后台管理项目的**快速起项目母版**，优先保证“能快速承接业务开发”，而不是继续承载强业务默认模块。

## TL;DR

- `admin-lite` 是从 `apps/admin` 收敛出来的后台基座。
- 默认只保留 `home`、`admin-management`、`system-management`、`log-management`。
- `pnpm new:app <app-id>` 已切到从 `apps/admin-lite` 复制。
- 强业务扩展默认不启用，需要时以可开关模块回接。

## 1. 当前定位

`admin-lite` 承担两件事：

1. 作为仓库内的后台快速起项目基座。
2. 作为后续新后台项目的派生母版。

不再承担以下职责：

- 默认承载 Portal/CMS/公文表单等强业务模块。
- 用“最小静态示例”定位来解释后台启动骨架。
- 在默认配置里保留明显绑定当前业务的扩展开关。

## 2. 默认模块

当前默认模块收敛为：

- `home`
- `admin-management`
- `system-management`
- `log-management`

对应配置入口：`apps/admin-lite/src/config/platform-config.ts`

基座原则：

- 这四类模块能覆盖后台项目最常见的基础能力。
- 其他扩展模块如需启用，应作为**按需扩展**回接，而不是重新塞回默认基线。

## 3. 默认关闭的扩展

当前基座已把下列能力收口为可配置或默认关闭：

- 顶栏租户切换
- 素材图片缓存
- 强业务管理模块（CMS / Portal / 公文表单）

对应配置入口：`apps/admin-lite/src/config/ui.ts`

推荐做法：

- 新项目先直接使用默认配置启动。
- 只有业务真正需要时，再显式打开对应扩展能力。
- 任何新增扩展都要补 README / docs / AGENTS，不要只改代码不留口径。

## 4. 启动与配置骨架

核心链路：

- `src/main.ts`
- `src/bootstrap/startup.ts`
- `src/bootstrap/index.ts`
- `src/config/platform-config.ts`
- `src/config/ui.ts`

关键约束：

- 平台配置只认 `platform-config.ts`。
- UI 开关只认 `ui.ts`。
- 登录页、顶栏和启动链路不要散落业务化分支。

## 5. 新项目派生方式

从仓库根目录执行：

```bash
pnpm new:app <app-id>
pnpm new:app <app-id> --with-crud-starter
pnpm new:app <app-id> --dry-run
```

脚手架行为：

- 默认从 `apps/admin-lite` 复制。
- 自动替换应用名、样式入口、构建配置与存储命名空间。
- `--with-crud-starter` 会附带一个本地可跑通的 CRUD 起步模块。

生成后建议执行：

```bash
pnpm -C apps/<app-id> typecheck
pnpm -C apps/<app-id> lint
pnpm -C apps/<app-id> lint:arch
pnpm -C apps/<app-id> test:run
pnpm -C apps/<app-id> build
```

## 6. 模块开发基线

新增后台模块时，默认沿用以下范式：

- 路由：`routes.ts`
- 接口：`api.ts`
- 类型：`types.ts`
- 编排页：`list.vue`

约束：

- 列表页统一使用 `ObPageContainer + ObTableBox + ObVxeTable`。
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

说明：

- `lint` / `lint:fix` 已收口到仓库根包装脚本，避免 `vite-plus@0.1.14` 在派生 app 目录下直接执行 `vp lint/check` 时触发通用配置解析异常。
- 自动导入与组件全局声明已固化到 `src/types/auto-imports.d.ts`、`src/types/components.d.ts`；`tsconfig.json` 必须继续包含 `src/**/*.d.ts`。

涉及文档或规则改动时，再补：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 8. 相关文档

- `apps/admin-lite/AGENTS.md`
- `/guide/admin-lite-base-app`
- `/guide/admin-lite-agent-redlines`
- `/guide/quick-start`
