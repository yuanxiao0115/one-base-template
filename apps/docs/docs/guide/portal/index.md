---
outline: [2, 3]
---

# 门户体系（Portal）总览

## TL;DR

- `PortalManagement`（`apps/admin`）负责管理端编排与接入。
- `portal-engine`（`packages/portal-engine`）负责设计器、渲染器、物料体系等共享能力。
- `apps/portal` 负责渲染端页面落地与运行态数据装配。

## 适用范围

- 适用于：门户管理端接入、引擎能力改造、物料扩展、渲染端联调。
- 涉及目录：
  - `apps/admin/src/modules/PortalManagement/**`
  - `packages/portal-engine/**`
  - `apps/portal/src/modules/portal/**`
- 不适用于：admin 常规模块 CRUD 场景（请走通用模块文档）。

## 前置条件

1. 已明确你要做的是“管理端接入 / 引擎改造 / 物料扩展”哪一类任务。
2. 已能本地启动 `apps/admin` 与 `apps/portal`。
3. 已阅读 [按水平进入（P2 / P4 / P6）](/guide/levels/) 对当前任务层级做判断。

## 阅读顺序（先选任务，再进子文档）

| 你要做的事                           | 先读文档                                                    | 读完后的动作                 |
| ------------------------------------ | ----------------------------------------------------------- | ---------------------------- |
| 管理端页面联调（设计/编辑/预览）     | [PortalManagement 管理端接入](/guide/portal/admin-designer) | 对照路由与页面入口跑一次联调 |
| 改共享引擎能力（工作台/渲染器/协议） | [portal-engine 边界与导出层](/guide/portal/engine-boundary) | 在 engine 包内改造并回归     |
| 新增分类或物料                       | [门户物料扩展与注册](/guide/portal/material-extension)      | 按约定目录新增物料并注册     |

## 最短执行路径（按任务）

### 1. 管理端接入链路

1. 先确认路由入口：`PortalManagement/routes/layout.ts` 与 `routes/standalone.ts`。
2. 确认引擎注入唯一入口：`PortalManagement/engine/register.ts`。
3. 在页面层只做路由参数、消息反馈、壳组件拼装，不散落注入逻辑。

### 2. 引擎能力改造链路

1. 先在 `packages/portal-engine` 内确定改动边界（editor/renderer/materials/workbench）。
2. 仅通过对外导出层暴露能力，避免让 admin 直接依赖内部实现细节。
3. 变更后回看管理端接入点，确认接口契约未漂移。

### 3. 物料扩展链路

1. 在 `PortalManagement/materials/**` 下按约定结构新增物料。
2. 通过 `materials/extensions/index.ts` 统一声明扩展入口。
3. 在编辑态/渲染态分别验证物料可见性与行为一致性。

## 代码目录地图

```text
apps/admin/src/modules/PortalManagement
  designPage/                     # 管理端三大页面入口（设计/编辑/预览）
  templatePage/                   # 模板列表与权限配置
  materialManagement/             # 素材管理
  engine/register.ts              # admin 注入 portal-engine 的唯一入口
  materials/extensions/index.ts   # admin 扩展物料声明入口

packages/portal-engine/src
  editor/                         # 设计器工作台
  renderer/                       # 预览与运行态渲染
  materials/ + registry/          # 物料定义、加载与注册
  workbench/                      # 页面编排与工作区控制器

apps/portal/src/modules/portal
  pages/PortalRenderPage.vue      # 渲染端入口
  materials/useMaterials.ts       # 渲染态物料与 cmsApi 注入
  services/portal-service.ts      # tab/template 接口封装
```

## 管理端核心路由

| 路由                                       | 作用                   |
| ------------------------------------------ | ---------------------- |
| `/portal/setting`                          | 门户模板列表           |
| `/material/index`                          | 素材管理（图片/图标）  |
| `/portal/design?id=...`                    | 门户设计工作台         |
| `/portal/page/edit?id=...&tabId=...`       | 页面深度编辑           |
| `/portal/preview?templateId=...&tabId=...` | 预览渲染（匿名可访问） |
| `/portal/login-page`                       | 登录页模板管理         |
| `/portal/login-notice`                     | 登录弹窗通知管理       |
| `/portal/login-page/preview/:id`           | 登录页模板预览         |

## 已落地收口（2026-03）

1. `PortalManagement` 引擎注入统一收敛到 `engine/register.ts`，页面层不再散落 `setPortal*` 注入。
2. 物料入口统一为 `usePortalMaterials(scene)`，不再维护多套并行 wrapper。
3. 模板兼容 `whiteList -> whiteDTOS` 已下沉到 adapters，模块内不再保留重复 compat 映射。
4. 素材管理页已收口到标准后台容器结构（`ObPageContainer` + `ObCardTable`）。

## 验证与验收

建议在仓库根目录执行：

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm -C apps/portal typecheck
pnpm -C apps/portal lint
pnpm -C apps/portal build
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

1. 管理端与渲染端构建通过。
2. 门户路由可访问，设计/编辑/预览链路可联调。
3. docs 构建通过，入口可达且无断链。

## FAQ

### 管理端可以直接调用 portal-engine 内部文件吗？

不建议。应通过 `portal-engine` 对外导出层消费能力，避免跨包内部耦合。

### 为什么强调 `engine/register.ts` 是唯一入口？

统一入口可以确保注入顺序、幂等行为和扩展注册一致，减少“页面能跑但行为不一致”的隐性问题。

### 我只想新增一个物料，需要先看全部门户文档吗？

不用。按本页任务路由直接进入 [门户物料扩展与注册](/guide/portal/material-extension) 即可。

## 相关阅读

- [PortalManagement 管理端接入](/guide/portal/admin-designer)
- [portal-engine 边界与导出层](/guide/portal/engine-boundary)
- [门户物料扩展与注册](/guide/portal/material-extension)
