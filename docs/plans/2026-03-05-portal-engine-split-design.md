# 门户引擎抽包与 Portal 独立应用设计稿

> 状态：设计稿（待你确认后进入实施）
> 决策日期：2026-03-05
> 适用范围：`apps/admin`、`apps/portal(新增)`、`packages/portal-engine(新增)`、`packages/adapters`

## 1. 背景与问题定义

当前 `apps/admin/src/modules/portal` 是半成品，但已经具备：

- 物料三段式结构（`index/content/style`）
- schema 驱动编辑与渲染
- 预览页匿名渲染链路

同时存在两个长期风险：

1. 物料能力仍绑在 admin 模块目录，无法被“前台消费者”直接复用。
2. 未来若 portal 独立为单独应用，容易再次复制一套组件，形成双维护。

用户明确目标：

- 前端并行推进。
- 优先复用老项目逻辑。
- 先迁移 `party-building` 组件，并改名为 `cms`。
- 老项目通用 `Container` 必须迁入并沉淀为共享容器。
- 物料能力抽离，portal 独立出来。

## 2. 范围冻结（Freeze Scope）

### 2.1 本期必须做

1. 新增独立应用：`apps/portal`（门户消费者应用）。
2. 新增共享包：`packages/portal-engine`（设计器/渲染器/物料注册能力）。
3. 将现有 portal 半成品从 `apps/admin` 抽到 `packages/portal-engine`。
4. 首批迁移 `party-building` -> `cms` 组件族，并完成命名收敛。
5. 迁移老项目通用 `Container`，落为可复用 `CmsContainer`。
6. `apps/admin` 保留门户设计器编排；`apps/portal` 负责门户渲染消费。

### 2.2 本期不做

1. 不一次性迁移老项目全部 componentConfig 物料。
2. 不做移动端门户设计器/渲染器。
3. 不做跨仓库发布与 npm 发包，仅限 monorepo workspace 内复用。
4. 不做历史 schema 的无限兼容，仅保证当前已落地 portal schema 可迁移。

## 3. 架构决策（推荐方案）

## 3.1 方案对比

### A. 继续留在 admin 内，不拆 app

- 优点：改动最少。
- 缺点：portal 消费端无法天然独立部署；后续拆分仍要二次迁移。

### B. `apps/portal` 独立 + `packages/portal-engine` 抽包（推荐）

- 优点：
  - portal 与 admin 职责边界清晰（设计器 vs 消费者）。
  - 物料与渲染引擎单一来源，避免双实现。
  - 可并行迁移，风险可控。
- 缺点：初期目录与依赖改动较大。

### C. 两个 app 各自维护一套物料

- 优点：短期“看起来快”。
- 缺点：长期必然失控（组件、schema、bug 修复双倍成本）。

结论：采用 **B 方案**。

## 4. 目标结构

```text
apps/
  admin/                      # 门户设计器编排端
  portal/                     # 门户消费者渲染端（新增）
packages/
  portal-engine/              # 新增：物料/编辑器/渲染器/schema 引擎
  adapters/                   # portal API 适配（与后端协议收口）
  core/ui/tag/utils           # 保持现有边界
```

## 5. portal-engine 分层设计

## 5.1 包内分层

```text
packages/portal-engine/src/
  api-contracts/              # portal/template/tab 的领域接口（不绑具体后端 URL）
  schema/                     # layout/schema 类型与版本迁移
  materials/                  # cms 物料（index/content/style/config）
  registry/                   # 物料注册表与工厂
  editor/                     # GridLayoutEditor/MaterialLibrary/PropertyPanel
  renderer/                   # PortalGridRenderer + 预览渲染壳
  container/                  # CmsContainer（从老项目 Container 去耦迁移）
  stores/                     # 页面布局状态（可复用）
  composables/                # useMaterials/useSchemaConfig 等
  index.ts                    # 对外导出
```

## 5.2 关键边界

1. `portal-engine` 可以依赖 Vue/ElementPlus/grid-layout-plus，但不能依赖 `apps/*`。
2. 具体 API URL 与字段映射放到 `packages/adapters`，由 app 注入给 engine。
3. engine 仅定义“需要哪些能力”（如 `loadTabDetail/updateTabDetail`），不关心后端来源。

## 6. 命名与兼容策略（party-building -> cms）

## 6.1 命名重构

- 目录重命名：`materials/party-building/**` -> `materials/cms/**`
- 分类命名：`CMS专区` 保持业务语义，去掉“党建”语义耦合。

## 6.2 兼容别名（过渡期）

- registry 中保留旧 type alias：
  - 例如 `pb-related-links` 映射到 `cms-related-links`。
- 读取旧 layout schema 时自动迁移 type/name 到新命名。
- 过渡期结束后再删除 alias（单独里程碑）。

## 6.3 动作协议与 target 注册（A+B 落地）

为解决“组件强耦合业务跳转”问题，采用 **A+B 组合方案**：

1. A：引擎内定义统一动作协议（组件只声明动作）。
2. B：应用侧维护业务 target 映射（组件不感知路由细节）。

### 动作类型（v1）

- `navigate`：站内路由跳转
- `open-url`：外链/新窗口跳转
- `emit`：向宿主抛业务事件（由 app 接管）

### target 命名规则

- 使用**业务语义命名**，规则：`模块_动作`
- 示例：`cms_detail`、`cms_list`、`todo_open`
- 禁止在 target 中出现路由路径语义（如 `portal_cms_detail_route`）

### 参数模型

动作参数支持模板变量，来源限定为：

- `$item.*`（当前列表项）
- `$context.*`（页面上下文，如 tabId/templateId）
- `$route.*`（当前路由信息）
- `$user.*`（当前用户信息）

### 未映射行为（用户确认）

- 当 `target` 在当前 app 的 registry 中不存在时：**阻断并提示**
- 不允许自动回退首页或 404，避免静默错误掩盖配置问题

### 执行链路

1. 组件触发动作声明（不直接 `router.push`）。
2. portal-engine 解析模板变量并构造 payload。
3. portal-engine 读取 app 注入的 `targetRegistry`。
4. 命中映射后执行；未命中则阻断并提示。

该策略保证“同一组件跨 app 复用”，且不同 app 能按自身路由与权限策略执行同一业务 target。

## 7. 通用容器迁移（Container）

老项目 `componentConfig/component/container.vue` 复用广、价值高，但当前耦合：

- 直接依赖 `@/hooks/drawer`
- 直接读 token
- 直接路由跳转

本期策略：迁移为 `CmsContainer`，做三点去耦：

1. 链接跳转能力改为 `props/hook` 注入（而非直接 `router/getToken`）。
2. 弹层能力改为引擎内部统一抽象（避免依赖 admin 私有 hooks）。
3. 保留 header/content/footer 插槽与 schema 外观参数，保证老组件可快速接入。

## 8. 应用职责

## 8.1 `apps/admin`

- 只承载门户模板列表、tab 树、页面编辑编排。
- 页面组件改为消费 `@one-base-template/portal-engine`。
- 设计器路由保持在 admin 域。

## 8.2 `apps/portal`

- 独立路由与发布产物。
- 承载门户预览/正式渲染页面。
- 复用 engine 渲染组件与 cms 物料。

## 9. 并行实施切片

### 并行泳道 A（引擎抽包）

- 把现有 admin portal 的 editor/renderer/materials/store/composables 迁入 `packages/portal-engine`。

### 并行泳道 B（portal 应用初始化）

- 基于 `apps/template` 复制/重命名为 `apps/portal`，完成基础路由、core/bootstrap。

### 并行泳道 C（cms 首批物料迁移）

- 先迁移现有五个 party-building 组件并完成命名替换。
- 同步迁移 `CmsContainer` 并替换首批组件容器。

### 并行泳道 D（admin 接入改造）

- admin portal 页面改为引用 engine 导出，不再直接读 `modules/portal/materials`。

## 10. 验收口径

1. 同一份 cms 组件代码可被 `apps/admin`（设计器预览）与 `apps/portal`（消费者渲染）同时使用。
2. `apps/admin` 与 `apps/portal` 均可渲染同一条 `pageLayout` 数据。
3. 老命名 `pb-*` 数据仍可渲染（通过 alias/迁移）。
4. 跳转行为不再写死在组件内部，首批 cms 组件改为动作协议驱动。
5. 全仓验证通过：
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm build`
   - `pnpm -C apps/docs build`

## 11. 风险与回滚

1. 风险：抽包后路径变动大，短期容易出现 import 断裂。  
   回滚：分阶段导出兼容入口，先“可运行”再删旧路径。

2. 风险：Container 去耦过程中行为差异（外链、弹层）。  
   回滚：先保留 legacy mode 适配层，逐步替换为新 props API。

3. 风险：pb -> cms 重命名触发历史数据不兼容。  
   回滚：保留 alias 映射，增加 schema migration 函数。
