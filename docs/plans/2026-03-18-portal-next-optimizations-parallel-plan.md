# Portal 引擎后续优化并行实施计划 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不保留旧 public 命名兼容层的前提下，继续把 `PortalManagement / portal-engine` 收敛成“导出语义清晰、admin 扩展低样板、分类可独立扩展、测试有门禁”的注册体系。

**Architecture:** 已完成的 P0-P3 解决了上下文化目录、声明式扩展、`designer/internal` 双入口和旧 public helper 命名删除，本计划只处理剩余的“收口型优化”。后续实现按 4 条泳道推进：先收口 root 导出边界，再并行处理类型语义化与 extension helper 产品化，最后用 admin 集成测试和最小完整示例统一收尾。

**Tech Stack:** Vue 3 + TypeScript + Vite + Vitest + pnpm Monorepo

---

## 背景与范围

### 已完成前置

- `P0`：`PortalEngineContext -> Material Catalog` 上下文化链路已打通。
- `P1`：`materialExtensions` 已成为 admin 正式扩展入口。
- `P2`：`@one-base-template/portal-engine/designer` 与 `@one-base-template/portal-engine/internal` 已分层。
- `P3`：旧 public helper 命名已从 `designer/root` 删除。

### 本轮只做的可选优化

1. **导出边界彻底收口**：root 入口仍暴露大量实现语义组件和 composable，容易让业务侧重新绑定到底层命名。
2. **类型层语义化**：组件别名已语义化，但部分 route/type 名称仍带 `Workbench / RouteQueryLike` 的实现味道。
3. **extension helper 产品化**：admin 新增分类/物料时，仍要手写较多对象结构；“只扩分类不立刻挂物料”也不够顺手。
4. **集成门禁与最小示例**：缺少 `setupPortalEngineForAdmin` 级别的集成测试，以及一份“新增分类 + 新增物料”的最小完整示例。

### 非目标

- **不新增 deprecated / 兼容 alias**。
- **不把实现语义重新放回 root public path**。
- **不新增 admin 侧重复壳层或半壳注册器**。

## 并行策略总览

### 泳道与依赖

- 泳道 A：**P4 导出边界彻底收口**
  - 必须最先完成。
  - 产物：root 只保留稳定通用能力与语义化 alias，`internal` 成为唯一实现语义出口。
- 泳道 B：**P5 类型层语义化**
  - 依赖 A。
  - 可与泳道 C 并行。
- 泳道 C：**P6 extension helper 产品化**
  - 依赖 A。
  - 可与泳道 B 并行。
- 泳道 D：**P7-P8 集成测试 + 最小完整示例**
  - 依赖 B/C 收敛后的最终 public API 与 helper 方案。

### 并行分工建议

1. **Agent A**
   - 负责泳道 A。
   - 目标是把 root 的设计器实现命名全部撤到 `internal`。
2. **Agent B**
   - 负责泳道 B。
   - 目标是让页面层 `import type` 不再出现原始 `Workbench / RouteQueryLike` 风格命名。
3. **Agent C**
   - 负责泳道 C。
   - 目标是把 admin 扩展入口压成更低样板的声明式写法，并支持“先扩分类后补物料”。
4. **主线程**
   - 等 B/C 稳定后执行泳道 D。
   - 统一补集成测试、文档示例和最终回归。

## 文件结构与职责调整

### 目标职责分布

- `packages/portal-engine/src/index.ts`
  - root 仅保留稳定 runtime/schema/renderer/material API 与语义化 designer alias。
  - 不再暴露设计器实现语义组件、composable、原始 route 类型。
- `packages/portal-engine/src/public-designer.ts`
  - 成为设计器公开语义层唯一主入口。
  - 除组件 alias 外，继续承载 designer 场景类型 alias。
- `packages/portal-engine/src/internal/index.ts`
  - 成为 `Workbench / Controller / ByRoute / 原始 route 类型` 的唯一出口。
- `packages/portal-engine/src/materials/extensions.ts`
  - 定义低样板 helper：`definePortalMaterialCategory`、`definePortalMaterial`、`definePortalMaterialExtension`。
  - extension 支持“仅注册分类”。
- `packages/portal-engine/src/materials/registerMaterialExtensions.ts`
  - 统一处理“分类注册 + 物料元数据注册 + section 组件注册”。
- `apps/admin/src/modules/PortalManagement/engine/register.ts`
  - 继续作为 admin 唯一 Portal 引擎注册入口。
  - 通过集成测试锁定默认扩展 + 调用方扩展的合并行为。
- `apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`
  - 只保留默认扩展声明，不再承载复杂样板。
- `apps/docs/docs/guide/portal-engine.md`
  - 记录最终 public API、extension helper、示例与验证命令。

## Chunk 1: 泳道 A - P4 导出边界彻底收口

### Task 1: 用测试先锁定 root 不再暴露实现语义

**Files:**

- Modify: `packages/portal-engine/src/public-designer.test.ts`
- Modify: `scripts/check-portal-materials.mjs`

- [ ] **Step 1: 追加失败断言，先明确 root 边界**

新增断言：

- `@one-base-template/portal-engine` **不再**暴露以下实现语义符号：
  - `PortalTemplateWorkbenchShell`
  - `PortalDesignerHeaderBar`
  - `PortalDesignerTreePanel`
  - `PortalDesignerActionStrip`
  - `PortalDesignerPreviewFrame`
  - `PortalPageEditorWorkbench`
  - `MaterialLibrary`
  - `PropertyPanel`
  - `useTemplateWorkbenchPageByRoute`
  - `usePageEditorWorkbenchByRoute`
- `@one-base-template/portal-engine/internal` 继续暴露上述符号。
- `scripts/check-portal-materials.mjs` 新增对 root/export 文本门禁，防止这些名字再次回流 root。

- [ ] **Step 2: 运行测试确认当前实现失败**

Run:

```bash
pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts
```

Expected:

- FAIL，root 包级导入仍能拿到实现语义符号。

- [ ] **Step 3: 收口 root 导出面**

调整要求：

- `packages/portal-engine/src/index.ts`
  - 删除上述实现语义组件/composable 的 root 导出。
  - 保留稳定通用 API 与 `./public-designer` 语义 alias 转发。
- `packages/portal-engine/src/internal/index.ts`
  - 保持实现语义完整，不从这里再派生 public alias。

- [ ] **Step 4: 同步门禁脚本**

要求：

- `scripts/check-portal-materials.mjs`
  - 新增 “root 不得包含实现语义 designer/export” 校验。
  - 继续要求 root 保留 `./public-designer` 语义化转发。

- [ ] **Step 5: 回归验证**

Run:

```bash
pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine typecheck
pnpm -C packages/portal-engine lint
```

Expected:

- 全部通过。

- [ ] **Step 6: 提交**

```bash
git add packages/portal-engine/src/index.ts \
  packages/portal-engine/src/internal/index.ts \
  packages/portal-engine/src/public-designer.test.ts \
  scripts/check-portal-materials.mjs
git commit -m "refactor: 收口 portal root 设计器导出边界"
```

### Task 2: 同步文档示例到最终导出边界

**Files:**

- Modify: `apps/docs/docs/guide/portal-engine.md`
- Modify: `apps/docs/docs/guide/portal-designer.md`

- [ ] **Step 1: 替换 root 路径中的实现语义用法**

调整要求：

- 文档示例中涉及模板设计页/页面设计页 route composable 的导入，一律改为：
  - `@one-base-template/portal-engine/designer`
- 若文档需要解释底层实现能力，只通过：
  - `@one-base-template/portal-engine/internal`

- [ ] **Step 2: 标注 root/designer/internal 三层职责**

文档结论必须明确：

- root：稳定通用能力 + 语义 alias
- designer：默认业务接入入口
- internal：实现语义/高级封装入口

- [ ] **Step 3: 文档回归**

Run:

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

Expected:

- 全部通过。

- [ ] **Step 4: 提交**

```bash
git add apps/docs/docs/guide/portal-engine.md \
  apps/docs/docs/guide/portal-designer.md
git commit -m "docs: 更新 portal 导出边界与设计器接入示例"
```

## Chunk 2: 泳道 B - P5 类型层语义化

### Task 3: 为 preview / designer 场景补齐语义化类型名

**Files:**

- Modify: `packages/portal-engine/src/index.ts`
- Modify: `packages/portal-engine/src/public-designer.ts`
- Modify: `packages/portal-engine/src/internal/index.ts`
- Modify: `scripts/check-portal-materials.mjs`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalPreviewRenderPage.vue`

- [ ] **Step 1: 先定义最终类型命名清单**

目标命名：

- designer 场景继续统一为：
  - `PortalDesignerRouteQueryPrimitive`
  - `PortalDesignerRouteQueryValue`
  - `PortalDesignerRouteQueryLike`
  - `UsePortalTemplateDesignerRouteOptions`
  - `UsePortalPageDesignerRouteOptions`
  - `PortalTemplateDesignerPreviewTarget`
- preview 场景补齐为：
  - `PortalPreviewRouteQueryPrimitive`
  - `PortalPreviewRouteQueryValue`
  - `PortalPreviewRouteQueryLike`
  - `UsePortalPreviewRouteOptions`

- [ ] **Step 2: 写失败约束**

约束方式：

- `scripts/check-portal-materials.mjs`
  - 要求 `public-designer.ts` 必须包含 designer 类型 alias。
  - 要求 root 只暴露 preview 语义类型，不再暴露原始 `PortalRouteQuery*`。
- 如需源码断言，可在 `public-designer.test.ts` 增加对导出文本/动态导入结果的辅助检查。

Run:

```bash
pnpm -C packages/portal-engine run verify:materials
```

Expected:

- FAIL，当前 root 仍暴露原始 `PortalRouteQuery*` 类型名。

- [ ] **Step 3: 实现类型层收敛**

调整要求：

- `packages/portal-engine/src/public-designer.ts`
  - 统一使用 `PortalDesigner*` 风格类型名。
- `packages/portal-engine/src/index.ts`
  - 删除原始 `PortalRouteQuery*`、`UseTemplateWorkbenchPageByRouteOptions`、`UsePageEditorWorkbenchByRouteOptions` 这类实现味类型导出。
  - 补齐 preview 侧语义化类型 alias，供预览页场景使用。
- `packages/portal-engine/src/internal/index.ts`
  - 继续保留原始实现语义类型名。

- [ ] **Step 4: 更新真实消费端与文档示例**

至少同步：

- `apps/admin/src/modules/PortalManagement/designPage/pages/PortalPreviewRenderPage.vue`

要求：

- 页面层不再使用原始 `PortalRouteQueryLike`。
- 文档示例统一延后到 Chunk 4 一次性收口，避免与 Chunk 3 争抢同一 docs 文件写集。

- [ ] **Step 5: 回归验证**

Run:

```bash
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine typecheck
pnpm -C packages/portal-engine lint
pnpm -C apps/admin typecheck
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

Expected:

- 全部通过。

- [ ] **Step 6: 提交**

```bash
git add packages/portal-engine/src/index.ts \
  packages/portal-engine/src/public-designer.ts \
  packages/portal-engine/src/internal/index.ts \
  packages/portal-engine/src/public-designer.test.ts \
  scripts/check-portal-materials.mjs \
  apps/admin/src/modules/PortalManagement/designPage/pages/PortalPreviewRenderPage.vue
git commit -m "refactor: 收敛 portal 设计器与预览类型命名"
```

## Chunk 3: 泳道 C - P6 extension helper 产品化

### Task 4: 扩展协议支持“只扩分类”并补齐 helper

**Files:**

- Modify: `packages/portal-engine/src/materials/extensions.ts`
- Modify: `packages/portal-engine/src/materials/registerMaterialExtensions.ts`
- Create: `packages/portal-engine/src/materials/extensions.test.ts`
- Modify: `packages/portal-engine/src/materials/registerMaterialExtensions.test.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Modify: `scripts/check-portal-materials.mjs`

- [ ] **Step 1: 写失败测试，先锁定 helper 和 category-only 能力**

测试点：

- `definePortalMaterialCategory()` 返回的分类对象可直接复用到 extension。
- `definePortalMaterial()` 保留 `type/name/config` 字面量推断，不需要额外中间类型。
- `definePortalMaterialExtension()` 支持：
  - `category + materials`
  - `category only`
  - `materials only`
- `registerMaterialExtensions()` 在 `category only` 场景下也会把分类注册到 context。

- [ ] **Step 2: 运行失败测试**

Run:

```bash
pnpm -C packages/portal-engine run test:run -- src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts
```

Expected:

- FAIL，helper 尚不存在，且当前 extension 不支持空物料数组/仅分类注册。

- [ ] **Step 3: 实现最小 helper 集**

实现要求：

- `packages/portal-engine/src/materials/extensions.ts`
  - 新增：
    - `definePortalMaterialCategory`
    - `definePortalMaterial`
    - `definePortalMaterialExtension`
  - `PortalMaterialExtension.materials` 改为可选或默认空数组。
- 不新增额外包装层，不把 helper 分散到多个文件。

- [ ] **Step 4: 收口注册器逻辑**

要求：

- `packages/portal-engine/src/materials/registerMaterialExtensions.ts`
  - 先注册分类，再遍历物料。
  - `materials` 为空时不报错，直接结束该 extension。
  - 仍保持 section 组件注册、别名注册、错误提示逻辑不变。

- [ ] **Step 5: 回归验证**

Run:

```bash
pnpm -C packages/portal-engine run test:run -- src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts src/materials/usePortalMaterialCatalog.test.ts
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine typecheck
pnpm -C packages/portal-engine lint
```

Expected:

- 全部通过。

- [ ] **Step 6: 提交**

```bash
git add packages/portal-engine/src/materials/extensions.ts \
  packages/portal-engine/src/materials/registerMaterialExtensions.ts \
  packages/portal-engine/src/materials/extensions.test.ts \
  packages/portal-engine/src/materials/registerMaterialExtensions.test.ts \
  packages/portal-engine/src/index.ts \
  scripts/check-portal-materials.mjs
git commit -m "feat: 完善 portal 物料扩展 helper 与分类协议"
```

### Task 5: 把 admin 默认扩展入口改成可复制的低样板写法

**Files:**

- Modify: `apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`
- Create: `apps/admin/src/modules/PortalManagement/materials/extensions/minimal-example.ts`

- [ ] **Step 1: 抽一份真实可复制的最小示例**

示例要求：

- `minimal-example.ts` 覆盖“新增分类 + 新增一个物料”的最小闭环。
- 示例必须使用：
  - `definePortalMaterialCategory`
  - `definePortalMaterial`
  - `definePortalMaterialExtension`
- 示例文件不自动接入默认数组，只作为团队复制模板。

- [ ] **Step 2: 收敛默认扩展入口**

要求：

- `apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`
  - 保持唯一默认声明入口。
  - 写法尽量压缩成“数组 + helper”，不再手写大段嵌套对象样板。

- [ ] **Step 3: 保持示例可直接被文档引用**

要求：

- `minimal-example.ts`
  - 文件名、导出名与注释一眼就能看出“新增分类 + 新增物料”的最小闭环。
  - 后续由 Chunk 4 统一接入 docs，避免与类型泳道产生文档冲突。

- [ ] **Step 4: 回归验证**

Run:

```bash
pnpm -C packages/portal-engine typecheck
pnpm -C apps/admin typecheck
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

Expected:

- 全部通过。

- [ ] **Step 5: 提交**

```bash
git add apps/admin/src/modules/PortalManagement/materials/extensions/index.ts \
  apps/admin/src/modules/PortalManagement/materials/extensions/minimal-example.ts
git commit -m "refactor: 收敛 portal admin 默认扩展示例入口"
```

## Chunk 4: 泳道 D - P7-P8 集成测试与最终收口

### Task 6: 为 setupPortalEngineForAdmin 增加集成测试

**Files:**

- Create: `apps/admin/src/modules/PortalManagement/engine/register.unit.test.ts`
- Modify: `apps/admin/src/modules/PortalManagement/engine/register.ts`
- Modify: `apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`

- [ ] **Step 1: 写失败测试，锁定 admin 注册入口行为**

测试点：

- `setupPortalEngineForAdmin()` 会合并：
  - `PORTAL_ADMIN_MATERIAL_EXTENSIONS`
  - `options.materialExtensions`
- `category only` extension 注册后，`usePortalMaterialCatalog({ context, scene: 'editor' })` 能看到新增分类。
- `registerDemoMaterial` 默认不影响正式扩展链路。
- `resetPortalEngineAdminSetupForTesting()` 后，重复测试不串 context 状态。

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm -C apps/admin run test:run -- src/modules/PortalManagement/engine/register.unit.test.ts
```

Expected:

- FAIL，当前缺少该集成测试或缺少 category-only 场景覆盖。

- [ ] **Step 3: 补足测试所需最小实现**

要求：

- 如果 helper/category-only 协议已经在泳道 C 完成，这里只允许补最小测试配套代码。
- 不再新增新的 admin 注册层包装函数。

- [ ] **Step 4: admin 回归**

Run:

```bash
pnpm -C apps/admin run test:run -- src/modules/PortalManagement/engine/register.unit.test.ts
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C packages/portal-engine typecheck
```

Expected:

- 全部通过。

- [ ] **Step 5: 提交**

```bash
git add apps/admin/src/modules/PortalManagement/engine/register.unit.test.ts \
  apps/admin/src/modules/PortalManagement/engine/register.ts \
  apps/admin/src/modules/PortalManagement/materials/extensions/index.ts
git commit -m "test: 补齐 portal admin 注册入口集成覆盖"
```

### Task 7: 文档与最终验证统一收口

**Files:**

- Modify: `apps/docs/docs/guide/portal-engine.md`
- Modify: `apps/docs/docs/guide/portal-designer.md`
- Modify: `apps/docs/docs/guide/development.md`
- Modify (local only, not committed): `.codex/testing.md`
- Modify (local only, not committed): `.codex/verification.md`

- [ ] **Step 1: 更新最终接入文档**

必须写清：

- root / designer / internal 的最终职责。
- admin 扩展分类与物料的最小步骤。
- `minimal-example.ts` 的路径与推荐复制方式。
- “开发阶段不保留旧 public 命名”的边界。

- [ ] **Step 2: 更新验证门禁说明**

`apps/docs/docs/guide/development.md` 至少补齐：

- `pnpm -C packages/portal-engine run verify:materials`
- `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts`
- `pnpm -C apps/admin run test:run -- src/modules/PortalManagement/engine/register.unit.test.ts`

- [ ] **Step 3: 最终回归**

Run:

```bash
pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine typecheck
pnpm -C packages/portal-engine lint
pnpm -C apps/admin run test:run -- src/modules/PortalManagement/engine/register.unit.test.ts
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

Expected:

- 全部通过。

- [ ] **Step 4: 记录验证结论**

同步更新：

- `.codex/testing.md`
- `.codex/verification.md`

- [ ] **Step 5: 提交**

```bash
git add apps/docs/docs/guide/portal-engine.md \
  apps/docs/docs/guide/portal-designer.md \
  apps/docs/docs/guide/development.md
git commit -m "docs: 更新 portal 后续优化接入与验证说明"
```

## 执行顺序建议

1. **先做 Chunk 1**
   - 这是所有后续优化的硬前提。
   - 不先切断 root 的实现语义，后面的类型语义化和 helper 文档会继续漂移。
2. **Chunk 2 与 Chunk 3 并行**
   - 两者只共享最终 public 边界，不共享实现文件主写集。
   - Chunk 2 偏导出与类型；Chunk 3 偏 extension 协议与 admin 默认入口。
3. **最后做 Chunk 4**
   - 统一把 B/C 的结果固化到 admin 集成测试、文档示例和门禁说明。

## 风险与检查点

- **风险 1：root 收口过猛导致内部消费误伤**
  - 检查点：在 Chunk 1 回归里必须跑 `public-designer.test.ts + verify:materials + typecheck`。
- **风险 2：helper 过度抽象反而增加心智负担**
  - 检查点：helper 只保留 3 个，且全部放在 `materials/extensions.ts`，不再分散。
- **风险 3：文档与最终实现再次漂移**
  - 检查点：Chunk 4 必须补 `apps/docs/docs/guide/development.md` 的验证门禁说明，并更新 `.codex/testing.md` / `.codex/verification.md`。

## 交付标准

- root 不再暴露设计器实现语义组件/composable。
- 业务页面默认只需要记住：
  - `@one-base-template/portal-engine/designer`
  - `setupPortalEngineForAdmin()`
  - `materialExtensions`
- admin 可以独立扩展**分类**，不必强绑定“当下就要加物料”。
- 新增分类 + 新增物料有一份最小完整示例可直接复制。
- 集成测试与 `verify:materials` 能拦住导出边界、helper 协议与 admin 注册入口回归。
