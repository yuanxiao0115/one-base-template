# portal-engine 能力边界

> 适用范围：`packages/portal-engine`、`apps/admin/src/modules/portal`、`apps/portal/src/modules/portal`

`portal-engine` 是门户设计器与渲染能力的共享引擎包，目标是让 admin 与 portal 复用同一套编辑/渲染核心，而不是在应用层重复实现。

## 这页解决什么问题

- 这个包负责什么，**不负责**什么。
- admin 与 portal 应该怎样依赖它。
- 新增物料、扩展动作、接入 API 时，代码应该落在哪里。

## 目录与职责

```text
packages/portal-engine/src/
  actions/       # 页面动作解析与目标注册
  composables/   # 复用式组合能力（如 schema 配置读取）
  container/     # CMS 容器与通用渲染容器
  editor/        # 设计器能力（布局编辑、属性面板、物料面板）
  materials/     # 物料组件与动态加载
  registry/      # 物料注册表
  renderer/      # 门户渲染器
  schema/        # 共享协议类型
  stores/        # 设计器状态
```

## 应用分层约定

- `packages/portal-engine`
  - 负责编辑器/渲染器/物料注册等共享能力。
  - 允许依赖 Vue、Element Plus、grid-layout-plus。
  - 禁止依赖 `apps/*`。
- `apps/admin`
  - 负责后台管理端编排（路由、页面壳、接口注入）。
  - 通过 `apps/admin/src/modules/portal/materials/useMaterials.ts` 适配本地 API 与行为。
- `apps/portal`
  - 负责消费者渲染入口与前台分流。
  - 复用 `portal-engine` 渲染器，不复制引擎内部逻辑。

## 常用接入点

1. 物料接入：`packages/portal-engine/src/materials/cms/<material>/`
2. 物料注册：`packages/portal-engine/src/registry/materials-registry.ts`
3. 行为扩展：`packages/portal-engine/src/materials/navigation.ts`
4. 页面渲染：`packages/portal-engine/src/renderer/PortalGridRenderer.vue`

## 维护建议

- 新能力先判断是否可沉淀为共享引擎能力，再决定是否留在 `apps/admin`。
- 引擎包变更后，至少回归：

```bash
pnpm -C packages/portal-engine typecheck
pnpm -C apps/admin typecheck
pnpm -C apps/portal typecheck
pnpm -C apps/docs build
```

- 如果变更了物料命名/协议字段，必须同步更新 `portal-designer` 文档和本页。
