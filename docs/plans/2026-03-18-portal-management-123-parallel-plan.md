# PortalManagement 1/2/3 并行优化 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 并行完成 PortalManagement 的 3 条结构优化线：权限弹窗拆分、materials hook 收敛、compat 迁移 adapters，最终形成“目录扁平、职责清晰、跨层边界稳定”的实现。

**Architecture:** 采用三泳道并行推进。泳道 A 聚焦 `templatePage/components` 超长弹窗解耦；泳道 B 聚焦 `materials` 入口统一与场景语义化；泳道 C 聚焦 `compat` 从业务模块迁移到 `packages/adapters`。三泳道写集基本独立，最后统一做集成回归与文档口径收口。

**Tech Stack:** Vue 3 + TypeScript + Vite + Vitest + pnpm Monorepo

---

## 背景与范围

### 输入（用户确认）

1. 拆权限弹窗：`PagePermissionDialog.vue`、`PortalAuthorityDialog.vue`。
2. 收敛 materials 三个 hook：`useMaterials/useEditorMaterials/useRendererMaterials`。
3. 将 `compat` 迁移到 `adapters`。

### 非目标

- 不改业务交互语义（仅结构与职责重构）。
- 不新增历史兼容层（除非被回归验证证明必须保留）。
- 不改变既有路由路径与页面可访问行为。

## 并行策略总览

### 泳道划分

- 泳道 A：权限弹窗拆分（UI + 交互编排）
- 泳道 B：materials hook 收敛（入口语义化）
- 泳道 C：compat 迁移 adapters（后端字段兼容职责下沉）

### 并行依赖

- A/B/C 可并行开发。
- 最终收口统一执行一次全量回归（admin + docs + adapters）。

### 并行分工建议

1. Agent A：负责泳道 A（权限弹窗拆分）。
2. Agent B：负责泳道 B（materials hook 收敛）。
3. Agent C：负责泳道 C（compat 迁移 adapters）。
4. 主线程：冲突协调、文档汇总、最终回归与提交顺序控制。

---

## Chunk 1: 泳道 A（权限弹窗拆分）

### Task A1: 提取权限弹窗共享数据源与 payload 组装

**Files:**

- Create: `apps/admin/src/modules/PortalManagement/templatePage/components/permission/permission-member-source.ts`
- Create: `apps/admin/src/modules/PortalManagement/templatePage/components/permission/permission-role-source.ts`
- Create: `apps/admin/src/modules/PortalManagement/templatePage/components/permission/permission-payload.ts`
- Test: `apps/admin/src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts`

- [x] **Step 1: 先写失败测试（RED）**

Run:

```bash
pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts
```

Expected: 测试文件不存在或断言失败。

- [x] **Step 2: 最小实现共享纯函数（GREEN）**

要求：

- 将“人员/角色 payload 归一化”从组件中抽离到 `permission-payload.ts`。
- 抽离“联系人树/角色分页请求”调用到 `permission-member-source.ts` 与 `permission-role-source.ts`。

- [x] **Step 3: 复跑测试**

Run:

```bash
pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts
```

Expected: 通过。

### Task A2: 薄化两个权限弹窗组件

**Files:**

- Modify: `apps/admin/src/modules/PortalManagement/templatePage/components/PagePermissionDialog.vue`
- Modify: `apps/admin/src/modules/PortalManagement/templatePage/components/PortalAuthorityDialog.vue`

- [x] **Step 1: 替换为“组件编排 + composable 调用”结构**

要求：

- 组件中仅保留 UI 状态与事件编排。
- 数据请求/分页/payload 组装走新抽离文件。

- [x] **Step 2: 回归模板列表链路**

Run:

```bash
pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/composables/usePortalTemplateListPageState.ts
```

Expected: 若无该测试文件，改为运行已有 portal 相关测试命令，确保链路不报错。

- [x] **Step 3: 泳道提交**

```bash
git add apps/admin/src/modules/PortalManagement/templatePage/components/PagePermissionDialog.vue \
  apps/admin/src/modules/PortalManagement/templatePage/components/PortalAuthorityDialog.vue \
  apps/admin/src/modules/PortalManagement/templatePage/components/permission

git commit -m "refactor: 拆分 Portal 权限弹窗共享逻辑"
```

---

## Chunk 2: 泳道 B（materials hook 收敛）

### Task B1: 收敛 admin 侧 materials 三入口为单入口

**Files:**

- Create: `apps/admin/src/modules/PortalManagement/materials/usePortalMaterials.ts`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/PortalPageEditPage.vue`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/PortalPreviewRenderPage.vue`
- Delete: `apps/admin/src/modules/PortalManagement/materials/useMaterials.ts`
- Delete: `apps/admin/src/modules/PortalManagement/materials/useEditorMaterials.ts`
- Delete: `apps/admin/src/modules/PortalManagement/materials/useRendererMaterials.ts`

- [x] **Step 1: 新增统一入口 API**

建议签名：

```ts
usePortalMaterials(scene: 'editor' | 'renderer')
```

- [x] **Step 2: 页面切换为统一入口**

要求：

- 编辑页传 `editor`。
- 预览页传 `renderer`。

- [x] **Step 3: 删除冗余 wrapper 文件**

要求：

- 确认无引用后再删除。

- [x] **Step 4: 泳道验证**

Run:

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
```

Expected: 0 errors（warning 可单独记录）。

- [x] **Step 5: 泳道提交**

```bash
git add apps/admin/src/modules/PortalManagement/materials \
  apps/admin/src/modules/PortalManagement/designPage/PortalPageEditPage.vue \
  apps/admin/src/modules/PortalManagement/designPage/PortalPreviewRenderPage.vue

git commit -m "refactor: 收敛 Portal materials 单入口"
```

---

## Chunk 3: 泳道 C（compat 迁移 adapters）

### Task C1: 将 `whiteList -> whiteDTOS` 兼容下沉到 adapters

**Files:**

- Create: `packages/adapters/src/portal/normalize-template.ts`
- Modify: `packages/adapters/src/index.ts`
- Modify: `apps/admin/src/modules/PortalManagement/templatePage/api.ts`
- Delete: `apps/admin/src/modules/PortalManagement/compat/mapper.ts`
- (可选) Delete: `apps/admin/src/modules/PortalManagement/compat/`（若空目录）

- [x] **Step 1: 先写适配函数单测（RED）**

**Files:**

- Create: `packages/adapters/src/portal/normalize-template.unit.test.ts`

Run:

```bash
pnpm -C packages/adapters typecheck
```

Expected: 新测试或类型先失败。

- [x] **Step 2: 实现 adapters 归一化函数（GREEN）**

要求：

- 输入：`BizResponse<PortalTemplate>` 风格对象。
- 输出：当 `whiteDTOS` 空且 `whiteList` 存在时补齐 `whiteDTOS`。

- [x] **Step 3: admin 调用点切换到 adapters 导出**

要求：

- `templatePage/api.ts` 不再依赖 `../compat/mapper`。

- [x] **Step 4: 删除业务模块 compat 文件**

要求：

- 保证 PortalManagement 下不再保留同类协议兼容实现。

- [x] **Step 5: 泳道验证**

Run:

```bash
pnpm -C packages/adapters typecheck
pnpm -C packages/adapters lint
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
```

Expected: 0 errors。

- [x] **Step 6: 泳道提交**

```bash
git add packages/adapters/src/index.ts \
  packages/adapters/src/portal \
  apps/admin/src/modules/PortalManagement/templatePage/api.ts \
  apps/admin/src/modules/PortalManagement/compat

git commit -m "refactor: 下沉 Portal 模板兼容映射到 adapters"
```

---

## Chunk 4: 汇合收口（主线程）

### Task D1: 全量回归与文档同步

**Files:**

- Modify: `apps/docs/docs/guide/portal/admin-designer.md`
- Modify: `apps/docs/docs/guide/portal/index.md`
- Modify: `apps/docs/docs/guide/module-system.md`（若仍提到模块内 compat）

- [x] **Step 1: 文档补齐三条优化结果**

要求：

- 写清权限弹窗拆分、materials 单入口、compat 下沉 adapters 的新边界。

- [x] **Step 2: 全量验证**

Run:

```bash
pnpm -C packages/adapters typecheck
pnpm -C packages/adapters lint
pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

Expected: 0 errors；历史 warning 单列。

- [x] **Step 3: 收口提交（中文）**

```bash
git add apps/docs/docs/guide/portal/index.md \
  apps/docs/docs/guide/portal/admin-designer.md \
  apps/docs/docs/guide/module-system.md

git commit -m "docs: 同步 PortalManagement 三线并行优化口径"
```

---

## 风险与检查点

1. 泳道 A 风险：组件拆分后事件回传字段漂移。

- 检查点：权限提交 payload 与原接口字段逐项对比。

2. 泳道 B 风险：场景参数写错导致预览加载编辑态组件。

- 检查点：预览页仅拿 `materialsMap`，不引入编辑类组件依赖。

3. 泳道 C 风险：adapters 类型依赖耦合 admin 业务类型。

- 检查点：adapters 不依赖 `apps/admin`，必要类型放在 adapters 内部最小定义或共享契约。

4. 汇合风险：并行分支修改同一文档段落。

- 检查点：docs 改动统一在 Chunk 4 收口，避免冲突。

---

## 执行顺序建议

1. A/B/C 同时启动。
2. 每条泳道完成后先本地自证（测试 + typecheck + lint）。
3. 主线程做一次汇合回归与文档收口。
4. 若三条泳道都通过，再进入下一轮结构优化（权限组件继续拆分细粒度子模块）。
