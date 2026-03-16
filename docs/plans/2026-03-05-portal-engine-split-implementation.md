# 门户引擎抽包与 Portal 独立应用实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 portal 从 admin 半成品演进为“共享引擎 + 独立消费者应用”架构，首批完成 CMS 物料迁移与通用容器沉淀。

**Architecture:** 新增 `packages/portal-engine` 承载物料、设计器、渲染器、schema 与容器；`apps/admin` 只做设计器编排；新增 `apps/portal` 负责门户消费渲染；通过 adapter 注入 API，避免引擎绑定具体后端。

**Tech Stack:** Vue 3、TypeScript、Pinia、Element Plus、grid-layout-plus、pnpm workspace、Turborepo

---

### Task 1: 创建 `packages/portal-engine` 包骨架

**Files:**

- Create: `packages/portal-engine/package.json`
- Create: `packages/portal-engine/tsconfig.json`
- Create: `packages/portal-engine/src/index.ts`
- Create: `packages/portal-engine/src/{editor,renderer,materials,registry,stores,composables,schema,container}/.gitkeep`
- Modify: `pnpm-workspace.yaml`（若无需改动则仅确认）

**Step 1: 新建包清单与构建脚本**

- 参考 `packages/ui` 与 `apps/template` 的脚本约定，提供 `build/typecheck/lint`。

**Step 2: 导出最小 API**

- 在 `src/index.ts` 先导出占位类型和函数，保证 admin 可逐步迁移引用。

**Step 3: 验证包可被 workspace 识别**

Run:

- `pnpm -C packages/portal-engine typecheck`
- `pnpm -C packages/portal-engine lint`

Expected: 命令可执行（初期可无业务代码）。

### Task 2: 迁移 portal 基础类型与工具到 engine

**Files:**

- Move/Create: `packages/portal-engine/src/schema/types.ts`（来自 `apps/admin/src/modules/portal/types.ts`）
- Move/Create: `packages/portal-engine/src/composables/useSchemaConfig.ts`
- Move/Create: `packages/portal-engine/src/utils/deep.ts`
- Modify: `apps/admin/src/modules/portal/**` 引用路径

**Step 1: 抽离纯类型与纯工具**

- 先迁不依赖 app 的文件，降低破坏面。

**Step 2: admin 改为引用 engine 导出**

- 每次改动后定向 typecheck。

Run:

- `pnpm -C apps/admin typecheck`

### Task 3: 迁移 pageLayout store 与渲染器核心

**Files:**

- Move/Create: `packages/portal-engine/src/stores/pageLayout.ts`
- Move/Create: `packages/portal-engine/src/renderer/PortalGridRenderer.vue`
- Move/Create: `packages/portal-engine/src/editor/{GridLayoutEditor.vue,PropertyPanel.vue,MaterialLibrary.vue}`
- Modify: `apps/admin/src/modules/portal/pages/PortalPageEditPage.vue`
- Modify: `apps/admin/src/modules/portal/pages/PortalPreviewRenderPage.vue`

**Step 1: 在 engine 内保持现有组件行为等价**

- 不改交互，先保证“可编译 + 可渲染”。

**Step 2: admin 页面替换 import 到 engine**

- 仅页面编排层保留在 admin。

Run:

- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`

### Task 4: 迁移物料注册与动态加载能力

**Files:**

- Move/Create: `packages/portal-engine/src/registry/materials-registry.ts`
- Move/Create: `packages/portal-engine/src/registry/utils/{component-factory.ts,config-merger.ts}`
- Move/Create: `packages/portal-engine/src/materials/useMaterials.ts`
- Move/Create: `packages/portal-engine/src/materials/**`（首批 cms 组件）

**Step 1: 首批迁移现有 party-building 组件文件**

- 目标组件：`related-links`、`image-text-list`、`image-text-column`、`document-card-list`、`carousel-text-list`。

**Step 2: 改名为 cms 语义目录**

- `party-building` -> `cms`。

**Step 3: 保留旧 type alias**

- 在 registry 中映射 `pb-*` 到 `cms-*`，保障老数据可渲染。

Run:

- `pnpm -C packages/portal-engine typecheck`
- `pnpm -C apps/admin typecheck`

### Task 5: 建立动作协议与 target 注册机制（解耦跳转）

**Files:**

- Create: `packages/portal-engine/src/actions/types.ts`
- Create: `packages/portal-engine/src/actions/execute-action.ts`
- Create: `packages/portal-engine/src/actions/resolve-action-params.ts`
- Create: `packages/portal-engine/src/actions/target-registry.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Modify: `packages/portal-engine/src/materials/cms/**/index.vue`（替换硬编码 `router.push`）

**Step 1: 定义动作协议（v1）**

- 动作类型：`navigate | open-url | emit`。
- `target` 命名规则：`模块_动作`（业务语义）。
- 参数支持 `$item/$context/$route/$user` 模板变量。

**Step 2: 注入式 target registry**

- 由 app 注入 `target -> route/permission/meta` 映射。
- 未映射时默认策略：阻断并提示（不自动回退）。

**Step 3: 首批组件去硬编码**

- 至少覆盖当前已知硬编码跳转组件：
  - `image-text-list`
  - `image-text-column`
  - `carousel-text-list`

Run:

- `pnpm -C packages/portal-engine typecheck`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/portal typecheck`

### Task 6: 迁移并去耦老项目 Container

**Files:**

- Create: `packages/portal-engine/src/container/CmsContainer.vue`
- Create: `packages/portal-engine/src/container/types.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Modify: `packages/portal-engine/src/materials/cms/**/index.vue`（逐步替换容器）

**Step 1: 从老项目迁入 Container 结构**

- 来源：`standard-oa-web-sczfw/.../componentConfig/component/container.vue`。

**Step 2: 去耦实现**

- 抽掉对 `@/hooks/drawer`、`@/utils/auth`、`router` 的硬依赖。
- 改为通过 props/callback 注入。

**Step 3: 在首批 cms 组件接入 CmsContainer**

Run:

- `pnpm -C packages/portal-engine typecheck`
- `pnpm -C apps/admin typecheck`

### Task 7: 新增独立应用 `apps/portal`

**Files:**

- Create: `apps/portal/**`（可从 `apps/template` 复制）
- Modify: `apps/portal/package.json`
- Modify: `apps/portal/src/bootstrap/index.ts`
- Modify: `apps/portal/src/router/{constants.ts,routes.ts,index.ts}`

**Step 1: 复制 template app 作为 portal 起点**

- 保留 core/ui/tag 接入方式。

**Step 2: 只保留 portal 消费者路由**

- 示例：`/portal/preview/:tabId?`、`/portal/index/:tabId?`。

**Step 3: portal 页面改为使用 portal-engine 渲染器**

Run:

- `pnpm -C apps/portal typecheck`
- `pnpm -C apps/portal lint`
- `pnpm -C apps/portal build`

### Task 8: adapter 层补齐 portal API 适配收口

**Files:**

- Create/Modify: `packages/adapters/src/portal/**`
- Modify: `apps/admin/src/modules/portal/api/**`
- Modify: `apps/portal/src/**`（接入 adapter）

**Step 1: 收口 template/tab/public 接口调用**

- engine 不直接写后端 URL，全部经 adapter 注入。

**Step 2: admin 与 portal 统一走同一适配契约**

Run:

- `pnpm -C packages/adapters typecheck`
- `pnpm -C packages/adapters lint`

### Task 9: admin portal 页面改为“编排层”

**Files:**

- Modify: `apps/admin/src/modules/portal/pages/{PortalTemplateListPage.vue,PortalTemplateSettingPage.vue,PortalPageEditPage.vue,PortalPreviewRenderPage.vue}`
- Modify: `apps/admin/src/modules/portal/module.ts`

**Step 1: 去掉页面对本地 materials/editor 实现的直接依赖**

- 改为依赖 `@one-base-template/portal-engine` 导出。

**Step 2: 保持 route 与菜单行为不变**

Run:

- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`

### Task 10: 文档同步（必须同次完成）

**Files:**

- Modify: `apps/docs/docs/guide/portal-designer.md`
- Create: `apps/docs/docs/guide/portal-engine.md`
- Modify: `apps/docs/docs/.vitepress/config.ts`
- Modify: `apps/docs/docs/guide/index.md`

**Step 1: 更新架构图与目录说明**

- 明确 `apps/admin` 与 `apps/portal` 职责。
- 明确 `party-building -> cms` 命名收敛。

**Step 2: 补充迁移与兼容说明**

- alias 策略、Container 去耦策略、回滚方法。

Run:

- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`

### Task 11: 全仓回归与证据落盘

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1: 全量验证**

Run:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm -C apps/docs build`

**Step 2: 记录风险与遗留项**

- 记录尚未迁移的非 cms 组件清单。
- 记录 alias 清理里程碑。
