# PortalManagement / Portal Engine 并行收敛 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `apps/admin/src/modules/PortalManagement` 收敛为轻量消费者，同时把 `packages/portal-engine` 升级为可实例化、可测试、可按场景加载的门户引擎，并把启动包体与编辑态同步成本拉回可控范围。

**Architecture:** 采用“五线并行、两轮汇合”的推进方式。第一轮并行完成 `引擎上下文`、`物料加载/注册`、`质量门禁` 三条基础线；第二轮在基础线稳定后推进 `admin 消费者化` 与 `预览桥/性能收口`。所有改动遵循“admin 只组装、不承载内核状态；portal-engine 提供明确上下文与薄导出边界；物料与预览链路按场景最小加载/最小同步”的原则。

**Tech Stack:** Vue 3 + TypeScript + Vite + Vitest + pnpm Monorepo + Element Plus

---

## 范围与验收基线

**必须解决的问题：**

- `PortalManagement` 页面层过厚，仍直接承载预览通信、页面设置会话、页面树编排、保存流程。
- `portal-engine` 仍依赖全局单例注入与默认 registry，无法做实例隔离和清晰测试。
- `useMaterials` 采用“静态兜底 + eager glob 全扫 + 运行时补别名”的重模型，新增物料成本高，预览/渲染场景也被迫加载编辑配置组件。
- `pnpm check:admin:bundle` 当前失败：`startup dependency map js gzip: 848.3 KiB / 预算 820.0 KiB`。
- `packages/portal-engine` 缺少独立 `test/test:run` 门禁。

**最终验收目标：**

- `pnpm check:admin:bundle` 通过。
- `pnpm -C packages/portal-engine run test:run` 可执行且通过。
- `PortalTemplateSettingPage.vue` 收敛到约 `300~400` 行。
- `PortalPageEditPage.vue` 收敛到约 `250~350` 行。
- 预览态不再同步加载 `style/content/editor` 全套物料组件。
- 文档与代码目录、别名、注册规则一致。

**统一验证命令：**

- `pnpm -C packages/portal-engine typecheck`
- `pnpm -C packages/portal-engine lint`
- `pnpm -C packages/portal-engine run test:run`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin lint:arch`
- `pnpm check:admin:bundle`
- `pnpm -C apps/docs build`

---

## Chunk 1: 基线冻结与改造边界清单

### Task 1: 冻结当前基线，生成后续对比口径

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`
- Create: `.codex/context-portal-refactor-baseline.md`

- [ ] **Step 1: 记录当前 bundle / 测试 / 页面厚度基线**
      Run:
  - `pnpm -C apps/admin lint:arch`
  - `pnpm check:admin:bundle`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/admin typecheck`
    Expected:
  - `lint:arch` PASS
  - `check:admin:bundle` FAIL，失败项固定为 `startup dependency map js gzip`

- [ ] **Step 2: 记录关键文件基线**
      记录以下文件的当前行数与职责：
  - `apps/admin/src/modules/PortalManagement/designPage/pages/PortalTemplateSettingPage.vue`
  - `apps/admin/src/modules/PortalManagement/designPage/pages/PortalPageEditPage.vue`
  - `packages/portal-engine/src/renderer/PortalPreviewPanel.vue`
  - `packages/portal-engine/src/materials/useMaterials.ts`
  - `packages/portal-engine/src/schema/page-settings.ts`

- [ ] **Step 3: 记录不允许打破的兼容边界**
      包括：
  - admin 仍通过注册入口注入 API
  - 现有 schema 名称与 `base-*` 兼容链路不能直接打断
  - `apps/portal` 仍可复用渲染器

- [ ] **Step 4: 提交（中文 commit）**

---

## Chunk 2: 引擎上下文化（并行线 A）

### Task 2: 新增 `PortalEngineContext`，替代进程级全局单例

**Files:**

- Create: `packages/portal-engine/src/runtime/context.ts`
- Create: `packages/portal-engine/src/runtime/context.test.ts`
- Modify: `packages/portal-engine/src/materials/api/index.ts`
- Modify: `packages/portal-engine/src/services/page-settings.ts`
- Modify: `packages/portal-engine/src/materials/navigation.ts`
- Modify: `packages/portal-engine/src/registry/materials-registry.ts`
- Modify: `packages/portal-engine/src/index.ts`

- [ ] **Step 1: 先写失败测试**
      覆盖：
  - 多个 context 实例不会互相污染
  - 默认 fallback 只属于当前实例
  - registry / cmsApi / navigation / pageSettingsApi 都通过 context 访问

- [ ] **Step 2: 运行测试确认失败**
      Run: `pnpm -C packages/portal-engine exec vitest run src/runtime/context.test.ts`

- [ ] **Step 3: 实现 context 工厂**
      最小接口应包含：
  - `createPortalEngineContext()`
  - `providePortalEngineContext()`
  - `usePortalEngineContext()`
  - `createPortalMaterialRegistry(...)`
  - 可注入 `cmsApi/pageSettingsApi/cmsNavigation/materialRegistry`

- [ ] **Step 4: 兼容旧 API，但降级为 wrapper**
      要求：
  - `setPortalCmsApi / setPortalPageSettingsApi / setPortalCmsNavigation` 仍可用
  - 旧 API 内部委托到默认 context
  - 新能力优先使用显式 context

- [ ] **Step 5: 回归测试**
      Run:
  - `pnpm -C packages/portal-engine exec vitest run src/runtime/context.test.ts`
  - `pnpm -C packages/portal-engine typecheck`

- [ ] **Step 6: 提交（中文 commit）**

### Task 3: admin 注册入口改为“显式创建 context + 显式注入”

**Files:**

- Modify: `apps/admin/src/modules/PortalManagement/engine/register.ts`
- Modify: `apps/admin/src/modules/PortalManagement/module.ts`
- Create: `apps/admin/src/modules/PortalManagement/engine/context.ts`

- [ ] **Step 1: 新增 admin 专用 context 持有层**
      约定：
  - 模块初始化时只创建轻量 context
  - 真正的依赖注入在显式 `setupPortalEngineForAdmin()` 中完成

- [ ] **Step 2: 去掉模块顶层重型副作用**
      [module.ts](/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/PortalManagement/module.ts:7) 不再直接触发会放大启动依赖的初始化逻辑

- [ ] **Step 3: 验证 admin 类型与架构边界**
      Run:
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`

- [ ] **Step 4: 提交（中文 commit）**

---

## Chunk 3: 物料 manifest 化与按场景加载（并行线 B）

### Task 4: 为物料建立显式 manifest 协议

**Files:**

- Create: `packages/portal-engine/src/materials/manifest.ts`
- Create: `packages/portal-engine/src/materials/manifest.test.ts`
- Modify: `packages/portal-engine/src/registry/materials-registry.types.ts`
- Modify: `packages/portal-engine/src/registry/materials-registry.ts`
- Modify: `packages/portal-engine/src/materials/useMaterials.ts`

- [ ] **Step 1: 先写失败测试**
      覆盖：
  - manifest 可描述 `type / category / index / content / style / runtime`
  - 注册校验会验证 `config.name === defineOptions({ name })`
  - 别名规则可在 manifest 中声明而不是运行时猜测

- [ ] **Step 2: 运行测试确认失败**
      Run: `pnpm -C packages/portal-engine exec vitest run src/materials/manifest.test.ts`

- [ ] **Step 3: 实现 manifest 模型**
      目标：
  - 每个物料通过一个 manifest 导出完整元数据
  - registry 消费 manifest，而不是自己从目录和 fallback 中二次推断

- [ ] **Step 4: 回归验证**
      Run:
  - `pnpm -C packages/portal-engine exec vitest run src/materials/manifest.test.ts`
  - `pnpm -C packages/portal-engine typecheck`

- [ ] **Step 5: 提交（中文 commit）**

### Task 5: 拆出 editor / renderer 两套物料加载器

**Files:**

- Modify: `packages/portal-engine/src/materials/useMaterials.ts`
- Create: `packages/portal-engine/src/materials/useEditorMaterials.ts`
- Create: `packages/portal-engine/src/materials/useRendererMaterials.ts`
- Create: `packages/portal-engine/src/materials/useRendererMaterials.test.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalPageEditPage.vue`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalPreviewRenderPage.vue`
- Modify: `packages/portal-engine/src/renderer/PortalPreviewPanel.vue`

- [ ] **Step 1: 先写失败测试**
      断言：
  - renderer 只会暴露 `index/runtime` 必要组件
  - editor 才会加载 `content/style` 配置组件
  - 不再使用 `import.meta.glob(..., { eager: true })` 全量扫全场景组件

- [ ] **Step 2: 运行测试确认失败**
      Run: `pnpm -C packages/portal-engine exec vitest run src/materials/useRendererMaterials.test.ts`

- [ ] **Step 3: 实现双加载器**
      目标：
  - `useEditorMaterials()` 给编辑器
  - `useRendererMaterials()` 给预览器/渲染器
  - 兼容旧调用方的迁移窗口，但默认新页面全部走显式加载器

- [ ] **Step 4: 接入 admin / renderer**
  - 页面编辑器使用 editor loader
  - 预览页与 `PortalPreviewPanel` 使用 renderer loader

- [ ] **Step 5: 回归 bundle 与类型**
      Run:
  - `pnpm -C packages/portal-engine exec vitest run src/materials/useRendererMaterials.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm check:admin:bundle`

- [ ] **Step 6: 提交（中文 commit）**

### Task 6: 把物料一致性校验提到 CI

**Files:**

- Create: `scripts/check-portal-materials.mjs`
- Modify: `packages/portal-engine/package.json`
- Modify: `package.json`

- [ ] **Step 1: 新增校验脚本**
      脚本检查：
  - manifest 中声明的组件是否存在
  - `config.json` / `defineOptions({ name })` / registry name 是否一致
  - 历史别名是否明确声明

- [ ] **Step 2: portal-engine 增加脚本**
      新增：
  - `test`
  - `test:run`
  - `verify:materials`

- [ ] **Step 3: 根脚本纳入 verify**
      要求：根 `verify` 能间接覆盖 portal-engine 校验

- [ ] **Step 4: 回归**
      Run:
  - `pnpm -C packages/portal-engine run verify:materials`
  - `pnpm -C packages/portal-engine run test:run`

- [ ] **Step 5: 提交（中文 commit）**

---

## Chunk 4: admin 消费者化（并行线 C，依赖 Chunk 2）

### Task 7: 抽出模板工作台 controller / composable

**Files:**

- Create: `packages/portal-engine/src/workbench/template-workbench-controller.ts`
- Create: `packages/portal-engine/src/workbench/template-workbench-controller.test.ts`
- Create: `packages/portal-engine/src/workbench/useTemplateWorkbench.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalTemplateSettingPage.vue`

- [ ] **Step 1: 先写失败测试**
      覆盖：
  - 模板详情加载
  - 当前 tab 切换
  - 当前页动作分发
  - 页面设置会话入口
  - 预览壳配置同步入口

- [ ] **Step 2: 运行测试确认失败**
      Run: `pnpm -C packages/portal-engine exec vitest run src/workbench/template-workbench-controller.test.ts`

- [ ] **Step 3: 实现 controller/composable**
      admin 页面只保留：
  - route/router
  - 消息提示
  - API 注入
  - UI 壳层布局

- [ ] **Step 4: 页面替换接入**
      目标：
  - `PortalTemplateSettingPage.vue` 去掉业务算法与大段 watch/clone/runtime 代码
  - 改为消费 `useTemplateWorkbench()`

- [ ] **Step 5: 回归**
      Run:
  - `pnpm -C packages/portal-engine exec vitest run src/workbench/template-workbench-controller.test.ts`
  - `pnpm -C apps/admin typecheck`

- [ ] **Step 6: 提交（中文 commit）**

### Task 8: 抽出页面编辑器 controller / composable

**Files:**

- Create: `packages/portal-engine/src/workbench/page-editor-controller.ts`
- Create: `packages/portal-engine/src/workbench/page-editor-controller.test.ts`
- Create: `packages/portal-engine/src/workbench/usePageEditorWorkbench.ts`
- Modify: `packages/portal-engine/src/editor/PortalPageEditorWorkbench.vue`
- Modify: `packages/portal-engine/src/index.ts`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalPageEditPage.vue`

- [ ] **Step 1: 先写失败测试**
      覆盖：
  - 页面详情加载
  - 布局更新
  - 保存
  - 打开预览
  - 接收 preview ready / ack

- [ ] **Step 2: 运行测试确认失败**
      Run: `pnpm -C packages/portal-engine exec vitest run src/workbench/page-editor-controller.test.ts`

- [ ] **Step 3: 实现 controller/composable**
      admin 页面只保留：
  - route/router
  - 通知
  - context/api 注入

- [ ] **Step 4: 页面替换接入**
      要求：
  - [PortalPageEditPage.vue](/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/PortalManagement/designPage/pages/PortalPageEditPage.vue) 不再直接维护窗口、timer、deep watch

- [ ] **Step 5: 回归**
      Run:
  - `pnpm -C packages/portal-engine exec vitest run src/workbench/page-editor-controller.test.ts`
  - `pnpm -C apps/admin typecheck`

- [ ] **Step 6: 提交（中文 commit）**

---

## Chunk 5: 预览桥增量同步与性能收口（并行线 D，依赖 Chunk 2/3/4）

### Task 9: 重构 preview bridge 协议为 `init / ack / patch`

**Files:**

- Modify: `packages/portal-engine/src/editor/preview-bridge.ts`
- Create: `packages/portal-engine/src/editor/preview-bridge.test.ts`
- Modify: `packages/portal-engine/src/renderer/PortalPreviewPanel.vue`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalPageEditPage.vue`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalTemplateSettingPage.vue`

- [ ] **Step 1: 先写失败测试**
      覆盖：
  - 初次建立连接使用 `init`
  - 预览页返回 `ack`
  - 普通更新使用 `patch`
  - 不再依赖 `180ms/520ms` 补发

- [ ] **Step 2: 运行测试确认失败**
      Run: `pnpm -C packages/portal-engine exec vitest run src/editor/preview-bridge.test.ts`

- [ ] **Step 3: 实现新协议**
      约束：
  - 页面设置、壳配置、布局数据分开 patch
  - 降低消息体大小
  - 保留必要兼容层，避免一次性打断旧逻辑

- [ ] **Step 4: 替换 admin 页面接入**
      要求：
  - 去掉页面层 `setTimeout` 补发模型
  - 减少全量 `JSON.stringify/parse` 深拷贝

- [ ] **Step 5: 回归**
      Run:
  - `pnpm -C packages/portal-engine exec vitest run src/editor/preview-bridge.test.ts`
  - `pnpm -C apps/admin typecheck`

- [ ] **Step 6: 提交（中文 commit）**

### Task 10: 减少 deep watch / deep clone 写放大

**Files:**

- Modify: `packages/portal-engine/src/editor/PropertyPanel.vue`
- Modify: `packages/portal-engine/src/stores/pageLayout.ts`
- Modify: `packages/portal-engine/src/composables/useSchemaConfig.ts`
- Modify: `packages/portal-engine/src/editor/TabContainerEditorItem.vue`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/components/portal-template/PortalPageSettingsDrawer.vue`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/components/portal-template/PortalShellSettingsDialog.vue`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/components/portal-template/PortalPageShellOverrideDialog.vue`

- [ ] **Step 1: 补最小单测或源代码约束测试**
      覆盖：
  - 同一字段输入不会触发多次无意义 clone / deepEqual
  - Tab 容器编辑不会因深监听回写形成环

- [ ] **Step 2: 收敛 watcher 策略**
      目标：
  - 能监听字段级 patch 的地方不再 `deep: true`
  - 能用局部 clone 的地方不做整棵 schema clone

- [ ] **Step 3: 回归**
      Run:
  - `pnpm -C packages/portal-engine run test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm check:admin:bundle`

- [ ] **Step 4: 提交（中文 commit）**

---

## Chunk 6: 导出面收口与文档同步（并行线 E）

### Task 11: 拆分 portal-engine 导出层级

**Files:**

- Modify: `packages/portal-engine/src/index.ts`
- Create: `packages/portal-engine/src/runtime/index.ts`
- Create: `packages/portal-engine/src/materials/index.ts`
- Create: `packages/portal-engine/src/workbench/index.ts`
- Create: `packages/portal-engine/src/renderer/index.public.ts`

- [ ] **Step 1: 设计导出层级**
      建议至少拆成：
  - runtime/context
  - schema/domain
  - materials
  - workbench/editor
  - renderer

- [ ] **Step 2: 收敛主入口**
      主入口保留高频稳定接口；实验性/底层接口改为子入口

- [ ] **Step 3: 回归**
      Run:
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/admin typecheck`

- [ ] **Step 4: 提交（中文 commit）**

### Task 12: 文档与记录同步

**Files:**

- Modify: `apps/docs/docs/guide/portal-engine.md`
- Modify: `apps/docs/docs/guide/portal-designer.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [ ] **Step 1: 文档更新**
      必须同步：
  - 新的 context 注册方式
  - editor / renderer 双加载器
  - manifest 注册方式
  - preview bridge 新协议
  - admin 如何作为消费者注册 portal-engine

- [ ] **Step 2: 更新 .codex 记录**
      补充：
  - 实施步骤
  - 验证结果
  - 已接受的兼容取舍

- [ ] **Step 3: 文档回归**
      Run: `pnpm -C apps/docs build`

- [ ] **Step 4: 提交（中文 commit）**

---

## 并行分派建议

### 第一轮并行

- Agent A：Chunk 2 `引擎上下文化`
- Agent B：Chunk 3 `物料 manifest + 双加载器`
- Agent C：Chunk 6 的 `Task 12` 先准备文档骨架与门禁补齐方案

### 第二轮并行

- Agent A：Chunk 4 `模板/页面工作台 controller`
- Agent B：Chunk 5 `preview bridge 增量同步`
- Agent C：Chunk 6 `导出面收口 + 文档同步`

### 每轮结束统一回归

- `pnpm -C packages/portal-engine run test:run`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint:arch`
- `pnpm check:admin:bundle`
- `pnpm -C apps/docs build`

---

## 风险与停机点

- 如果 Chunk 2 无法在兼容层内平滑承接旧 `setPortal*` API，先停在“默认 context + 显式 context 双轨”，不要一次删旧入口。
- 如果 Chunk 3 的 manifest 化改动过大，可先对 `base-*` 物料族试点，再扩展到全部物料。
- 如果 Chunk 5 预览桥重构引发兼容风险，先在 `PortalPageEditPage` 落地新协议，再迁移 `PortalTemplateSettingPage`。
- 如果 `check:admin:bundle` 改善不明显，优先检查 `module.ts` 顶层副作用、Portal 路由懒加载边界、`useRendererMaterials` 是否仍被编辑器链路反向引用。

---

## 完成定义

- portal-engine 成为“可实例化内核 + 分层导出 + 独立门禁”的共享包。
- PortalManagement 成为“薄页面壳 + API 注入 + 事件透传”的消费者。
- 预览/渲染链路实现按场景最小加载、按变更最小同步。
- 文档、测试、包体预算三条质量线全部闭环。
