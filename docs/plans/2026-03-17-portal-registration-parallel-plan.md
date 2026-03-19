# Portal 注册体系并行收敛 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `PortalManagement` / `portal-engine` 的物料注册体系收敛为“默认内聚 + admin 可声明扩展 + 对外导出语义清晰”的共享能力，并提供可并行推进的实施路径。

**Architecture:** 以 `PortalEngineContext -> Material Registry -> Material Catalog -> Scene Loader` 为唯一数据链路。`packages/portal-engine` 内置默认分类与默认物料，同时暴露声明式 `extensions` 能力给 `apps/admin` 扩展分类与物料；根出口优先暴露场景语义 API，内部实现语义下沉到子路径或 `internal`。

**Tech Stack:** Vue 3 + TypeScript + Vite + Vitest + pnpm Monorepo

---

## 背景结论

当前实现存在 4 个会直接影响同事接入体验的问题：

1. `admin` 扩展物料写入的是 `context` 级 registry，但编辑页读取的还是默认全局 `portalMaterialsRegistry.categories`，链路不一致。
2. `admin` 侧仍保留 `useMaterials/useEditorMaterials/useRendererMaterials` 三层 wrapper，以及 `admin-material-registration.ts` 这类半壳层实现，入口不清晰。
3. `portal-engine` 对外暴露大量 `Workbench / Controller / ByRoute` 命名，偏实现语义，不利于业务同事一眼判断用途。
4. 新增一个物料仍需理解 registry、glob、fallback、alias、校验脚本等多处机制，产品化程度不够。

## 并行策略总览

本计划拆成 4 条泳道：

- 泳道 A：**上下文化分类链路**，修复 `categories` 与 `materialsMap` 的同源读取问题。
- 泳道 B：**声明式扩展协议**，把 admin 扩展分类/物料收敛为 `extensions`。
- 泳道 C：**语义化公共导出**，重命名 public API，让组件用途一眼可读。
- 泳道 D：**文档与门禁**，同步文档、测试、校验脚本，保证长期可维护。

依赖关系：

- A 必须最先完成，因为 B/C 都依赖“当前 context 真的生效”。
- B 与 C 可以在 A 完成后并行。
- D 可以从第一个改动开始持续并行，但最终收口要在 B/C 完成后统一执行。

## 文件结构与职责调整

### 新增 / 收敛后的职责

- `packages/portal-engine/src/materials/usePortalMaterialCatalog.ts`
  - 场景化返回 `{ categories, materialsMap }`
  - 输入 `context + scene`
- `packages/portal-engine/src/materials/extensions.ts`
  - 定义 `PortalMaterialExtension`、`PortalMaterialDescriptor`
- `packages/portal-engine/src/materials/registerMaterialExtensions.ts`
  - 把 `extensions` 展开为分类注册、物料注册、组件注册
- `packages/portal-engine/src/public-designer.ts`
  - 面向业务同事的语义化 designer/page-designer 导出
- `packages/portal-engine/src/internal/index.ts`
  - 下沉 `Workbench / Controller / ByRoute` 等实现语义导出
- `apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`
  - admin 侧唯一扩展入口，只声明业务扩展

### 现有文件职责调整

- `packages/portal-engine/src/registry/materials-registry.ts`
  - 继续维护默认分类与默认物料
  - 不再承担“业务侧如何直接调用”的职责
- `packages/portal-engine/src/materials/useEditorMaterials.ts`
  - 专注 editor 场景组件映射
- `packages/portal-engine/src/materials/useRendererMaterials.ts`
  - 专注 renderer 场景组件映射
- `apps/admin/src/modules/PortalManagement/engine/register.ts`
  - 只做 admin API 注入 + 声明式扩展接入
- `apps/admin/src/modules/PortalManagement/materials/admin-material-registration.ts`
  - 计划废弃，由 package 内扩展注册器替代

## Chunk 1: 泳道 A - 上下文化分类链路

### Task 1: 新增统一的 Material Catalog 读取层

**Files:**

- Create: `packages/portal-engine/src/materials/usePortalMaterialCatalog.ts`
- Modify: `packages/portal-engine/src/materials/useEditorMaterials.ts`
- Modify: `packages/portal-engine/src/materials/useRendererMaterials.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Test: `packages/portal-engine/src/materials/usePortalMaterialCatalog.test.ts`

- [ ] **Step 1: 写失败测试，证明分类与组件映射必须来自同一个 context**

测试点：

- 同一个 `context` 注册新分类后，`categories` 能拿到新增分类
- 同一个 `context` 注册新物料后，`materialsMap` 能解析到对应组件
- `scene='renderer'` 只返回 renderer 所需组件
- `scene='editor'` 返回 editor 所需全量组件

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm -C packages/portal-engine exec vitest run src/materials/usePortalMaterialCatalog.test.ts
```

Expected:

- FAIL，至少出现“仍读取默认全局 registry / 无法感知 context 扩展分类”的断言失败

- [ ] **Step 3: 实现 `usePortalMaterialCatalog(context, scene)`**

要求：

- `categories` 一律来自 `getPortalMaterialRegistryController(context).categories`
- `materialsMap` 构建过程接收同一个 `context`
- `scene='editor' | 'renderer'`
- 不在调用方散落拼接分类和组件映射

- [ ] **Step 4: 改造 `useEditorMaterials` / `useRendererMaterials`**

要求：

- `useEditorMaterials` 返回 `usePortalMaterialCatalog({ context, scene: 'editor' })`
- `useRendererMaterials` 返回 `usePortalMaterialCatalog({ context, scene: 'renderer' })`
- 旧 API 保持兼容，但内部统一委托给新 catalog

- [ ] **Step 5: 回归验证**

Run:

```bash
pnpm -C packages/portal-engine exec vitest run src/materials/usePortalMaterialCatalog.test.ts
pnpm -C packages/portal-engine typecheck
pnpm -C packages/portal-engine lint
```

Expected:

- 全部通过

- [ ] **Step 6: 提交**

```bash
git add packages/portal-engine/src/materials/usePortalMaterialCatalog.ts \
  packages/portal-engine/src/materials/useEditorMaterials.ts \
  packages/portal-engine/src/materials/useRendererMaterials.ts \
  packages/portal-engine/src/index.ts \
  packages/portal-engine/src/materials/usePortalMaterialCatalog.test.ts
git commit -m "feat: 打通 portal 物料分类与组件映射上下文化读取"
```

### Task 2: admin / portal 消费端切到统一 catalog

**Files:**

- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalPageEditPage.vue`
- Modify: `apps/admin/src/modules/PortalManagement/materials/useEditorMaterials.ts`
- Modify: `apps/admin/src/modules/PortalManagement/materials/useRendererMaterials.ts`
- Modify: `apps/admin/src/modules/PortalManagement/materials/useMaterials.ts`
- Modify: `apps/portal/src/modules/portal/materials/useMaterials.ts`

- [ ] **Step 1: 让 admin 编辑页不再直接读取默认全局 registry**

要求：

- 删除 `portalMaterialsRegistry.categories` 的直接使用
- 改为从统一 catalog 拿到 `{ categories, materialsMap }`

- [ ] **Step 2: portal 渲染端也切到统一 catalog**

要求：

- 避免 admin / portal 两套用法再度漂移

- [ ] **Step 3: 回归验证**

Run:

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C packages/portal-engine typecheck
```

Expected:

- 全部通过

- [ ] **Step 4: 提交**

```bash
git add apps/admin/src/modules/PortalManagement/designPage/pages/PortalPageEditPage.vue \
  apps/admin/src/modules/PortalManagement/materials/useEditorMaterials.ts \
  apps/admin/src/modules/PortalManagement/materials/useRendererMaterials.ts \
  apps/admin/src/modules/PortalManagement/materials/useMaterials.ts \
  apps/portal/src/modules/portal/materials/useMaterials.ts
git commit -m "refactor: 统一 portal admin 与 portal 的物料目录消费链路"
```

## Chunk 2: 泳道 B - admin 声明式扩展分类与物料

### Task 3: 定义 `PortalMaterialExtension` 协议

**Files:**

- Create: `packages/portal-engine/src/materials/extensions.ts`
- Create: `packages/portal-engine/src/materials/extensions.test.ts`
- Modify: `packages/portal-engine/src/index.ts`

- [ ] **Step 1: 写失败测试，定义 extension 的最小语义**

测试点：

- 一个 extension 可以声明一个新分类和多个物料
- 支持只向已存在分类追加物料
- 支持分类元信息：`id/name/title/cmptTypeName`
- 支持排序字段：`index` 或 `after`

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm -C packages/portal-engine exec vitest run src/materials/extensions.test.ts
```

Expected:

- FAIL，extension 协议尚不存在

- [ ] **Step 3: 实现 extension 类型定义**

至少包含：

- `PortalMaterialDescriptor`
- `PortalMaterialExtension`
- `PortalMaterialExtensionCategory`
- `PortalMaterialScene`

- [ ] **Step 4: 回归验证**

Run:

```bash
pnpm -C packages/portal-engine exec vitest run src/materials/extensions.test.ts
pnpm -C packages/portal-engine typecheck
```

- [ ] **Step 5: 提交**

```bash
git add packages/portal-engine/src/materials/extensions.ts \
  packages/portal-engine/src/materials/extensions.test.ts \
  packages/portal-engine/src/index.ts
git commit -m "feat: 定义 portal 物料声明式扩展协议"
```

### Task 4: 实现 package 内扩展注册器，替换 admin 侧半壳层

**Files:**

- Create: `packages/portal-engine/src/materials/registerMaterialExtensions.ts`
- Create: `packages/portal-engine/src/materials/registerMaterialExtensions.test.ts`
- Modify: `apps/admin/src/modules/PortalManagement/engine/register.ts`
- Create: `apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`
- Deprecate: `apps/admin/src/modules/PortalManagement/materials/admin-material-registration.ts`

- [ ] **Step 1: 写失败测试，证明 extension 能展开为分类 + 物料 + 组件注册**

测试点：

- 注册 extension 后新增分类能出现在 registry
- 物料元数据正确写入分类
- `index/content/style` 组件都能注册成功
- 重复注册策略默认 reject，显式配置才 replace

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm -C packages/portal-engine exec vitest run src/materials/registerMaterialExtensions.test.ts
```

- [ ] **Step 3: 实现 `registerMaterialExtensions()`**

要求：

- 输入 `context + extensions`
- 由 package 内统一完成：
  - 分类创建/更新
  - 物料元数据注册
  - `index/content/style` 组件注册
  - alias 处理

- [ ] **Step 4: 改造 admin 注册入口**

要求：

- `setupPortalEngineForAdmin()` 新增 `materialExtensions`
- admin 只维护 `materials/extensions/index.ts`
- `registerDemoMaterial` 从正式入口移除，改到示例或 docs

- [ ] **Step 5: 回归验证**

Run:

```bash
pnpm -C packages/portal-engine exec vitest run src/materials/registerMaterialExtensions.test.ts
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
```

- [ ] **Step 6: 提交**

```bash
git add packages/portal-engine/src/materials/registerMaterialExtensions.ts \
  packages/portal-engine/src/materials/registerMaterialExtensions.test.ts \
  apps/admin/src/modules/PortalManagement/engine/register.ts \
  apps/admin/src/modules/PortalManagement/materials/extensions/index.ts \
  apps/admin/src/modules/PortalManagement/materials/admin-material-registration.ts
git commit -m "feat: 支持 admin 声明式扩展 portal 物料分类与物料"
```

## Chunk 3: 泳道 C - 对外导出语义化

### Task 5: 建立 public designer export 层

**Files:**

- Create: `packages/portal-engine/src/public-designer.ts`
- Create: `packages/portal-engine/src/internal/index.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Test: `packages/portal-engine/src/public-designer.test.ts`

- [ ] **Step 1: 写失败测试，约束 public export 只暴露语义化命名**

测试点：

- 根出口存在语义化别名
- `Workbench / ByRoute / Controller` 不再是主推荐入口
- `internal` 子路径保留实现语义导出

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm -C packages/portal-engine exec vitest run src/public-designer.test.ts
```

- [ ] **Step 3: 新增语义化导出别名**

首批别名建议：

- `PortalTemplateWorkbenchShell` -> `PortalTemplateDesignerLayout`
- `PortalDesignerHeaderBar` -> `PortalTemplateDesignerHeader`
- `PortalDesignerTreePanel` -> `PortalTemplateDesignerSidebar`
- `PortalDesignerActionStrip` -> `PortalTemplateDesignerToolbar`
- `PortalDesignerPreviewFrame` -> `PortalTemplateDesignerPreview`
- `PortalPageEditorWorkbench` -> `PortalPageDesignerLayout`
- `MaterialLibrary` -> `PortalMaterialPalette`
- `PropertyPanel` -> `PortalPropertyInspector`
- `useTemplateWorkbenchPageByRoute` -> `usePortalTemplateDesignerRoute`
- `usePageEditorWorkbenchByRoute` -> `usePortalPageDesignerRoute`

- [ ] **Step 4: 保留旧名一版兼容**

要求：

- 旧名字继续可用
- 在注释或文档中标记推荐迁移路径

- [ ] **Step 5: 回归验证**

Run:

```bash
pnpm -C packages/portal-engine exec vitest run src/public-designer.test.ts
pnpm -C packages/portal-engine typecheck
```

- [ ] **Step 6: 提交**

```bash
git add packages/portal-engine/src/public-designer.ts \
  packages/portal-engine/src/internal/index.ts \
  packages/portal-engine/src/index.ts \
  packages/portal-engine/src/public-designer.test.ts
git commit -m "refactor: 新增 portal 设计器语义化公共导出"
```

### Task 6: admin 页面切换到语义化导出

**Files:**

- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalTemplateSettingPage.vue`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalPageEditPage.vue`

- [ ] **Step 1: 切换 import 到语义化命名**

要求：

- 页面 import 读起来直接体现用途
- 不再优先暴露 `Workbench / ByRoute`

- [ ] **Step 2: 回归验证**

Run:

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
```

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/modules/PortalManagement/designPage/pages/PortalTemplateSettingPage.vue \
  apps/admin/src/modules/PortalManagement/designPage/pages/PortalPageEditPage.vue
git commit -m "refactor: admin 使用语义化 portal 设计器导出"
```

## Chunk 4: 泳道 D - 文档与门禁

### Task 7: 更新文档，明确“默认内聚 + admin 扩展”口径

**Files:**

- Modify: `apps/docs/docs/guide/portal-engine.md`
- Modify: `apps/docs/docs/guide/portal-designer.md`
- Modify: `apps/docs/docs/guide/development.md`

- [ ] **Step 1: 更新 portal-engine 接入文档**

必须说明：

- 默认分类由 package 内置
- admin 通过 `materialExtensions` 扩展分类/物料
- `context` 是唯一有效注册作用域

- [ ] **Step 2: 更新 portal designer 文档**

必须说明：

- 编辑器如何读取分类
- 语义化 public API 推荐用法
- internal API 与 public API 边界

- [ ] **Step 3: 验证文档构建**

Run:

```bash
pnpm -C apps/docs build
```

- [ ] **Step 4: 提交**

```bash
git add apps/docs/docs/guide/portal-engine.md \
  apps/docs/docs/guide/portal-designer.md \
  apps/docs/docs/guide/development.md
git commit -m "docs: 更新 portal 注册扩展与语义化导出说明"
```

### Task 8: 校验脚本补齐 extension / public export 约束

**Files:**

- Modify: `scripts/check-portal-materials.mjs`
- Modify: `packages/portal-engine/package.json`
- Modify: `package.json`

- [ ] **Step 1: 校验脚本扩展**

新增检查：

- extension 中声明的组件是否存在
- 新增分类信息是否合法
- public designer 导出是否覆盖推荐别名

- [ ] **Step 2: 验证脚本通过**

Run:

```bash
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine run test:run
```

- [ ] **Step 3: 根验证串联**

Run:

```bash
pnpm verify
```

- [ ] **Step 4: 提交**

```bash
git add scripts/check-portal-materials.mjs \
  packages/portal-engine/package.json \
  package.json
git commit -m "chore: 补齐 portal 扩展分类与公共导出校验门禁"
```

## 并行执行建议

### 第一轮并行

- Agent A：Task 1
- Agent B：Task 3
- Agent C：Task 7

说明：

- Task 1 是主干
- Task 3 是协议定义，可独立推进
- Task 7 可先更新文档骨架与待确认章节，不阻塞代码

### 第二轮并行

- Agent A：Task 2
- Agent B：Task 4
- Agent C：Task 5

前提：

- Task 1 完成

### 第三轮并行

- Agent A：Task 6
- Agent B：Task 8

前提：

- Task 4、Task 5 完成

## 最终验收

必须全部通过：

```bash
pnpm -C packages/portal-engine exec vitest run src/materials/usePortalMaterialCatalog.test.ts
pnpm -C packages/portal-engine exec vitest run src/materials/extensions.test.ts
pnpm -C packages/portal-engine exec vitest run src/materials/registerMaterialExtensions.test.ts
pnpm -C packages/portal-engine exec vitest run src/public-designer.test.ts
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine typecheck
pnpm -C packages/portal-engine lint
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/docs build
```

验收标准：

- admin 扩展的新分类能真实出现在物料库
- 新分类下物料可拖拽、可预览、可保存
- portal 渲染端不受影响
- admin 页面 import 语义清晰
- 根出口 API 一眼能看出用途

## 风险与回滚

- 风险：`context` 与默认单例混用处可能还有遗漏。
  - 回滚：保留旧 API 兼容一版，但所有新调用统一走 catalog。
- 风险：语义化改名导致历史 import 大量变更。
  - 回滚：只先加 alias，不立即物理重命名文件。
- 风险：extension 收敛后，示例物料入口失效。
  - 回滚：示例迁到 docs/example，避免继续污染正式注册入口。
