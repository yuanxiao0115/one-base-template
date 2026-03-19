# 门户体系（Portal）总览

> 适用范围：`apps/admin/src/modules/PortalManagement`、`packages/portal-engine`、`apps/portal/src/modules/portal`

## TL;DR

- **管理端编排** 在 `PortalManagement`，负责路由、页面组装与能力注入。
- **共享引擎能力** 在 `portal-engine`，负责设计器/渲染器/物料体系。
- 文档按“使用者视角”分层，避免在一页里混合历史、实现细节和接入步骤。

## 文档分层

| 文档                               | 适合读者       | 解决问题                             |
| ---------------------------------- | -------------- | ------------------------------------ |
| `/guide/portal/`（本页）           | 所有人         | 先看全局入口与阅读顺序               |
| `/guide/portal/admin-designer`     | admin 业务开发 | 如何在 PortalManagement 接入与改造   |
| `/guide/portal/engine-boundary`    | 引擎维护者     | `portal-engine` 的边界、导出层与约束 |
| `/guide/portal/material-extension` | 物料扩展开发   | 如何新增分类/物料并注册到 admin      |

## 快速阅读路径

1. 只做管理端页面联调：先看 `admin-designer`。
2. 要改共享能力（工作台/渲染器/协议）：看 `engine-boundary`。
3. 只新增物料或分类：看 `material-extension`。

## 代码目录地图

```text
apps/admin/src/modules/PortalManagement
  api/                            # 领域 API（portal/cms/authority）
  designPage/                     # 管理端三大页面入口（设计/编辑/预览）
  templatePage/                   # 模板列表与权限配置（含 composables 拆分）
  engine/register.ts              # admin 注入 portal-engine 的唯一入口
  materials/extensions/index.ts   # admin 扩展物料声明唯一入口

packages/portal-engine/src
  editor/                         # 设计器工作台能力
  renderer/                       # 预览与运行态渲染
  materials/ + registry/          # 物料定义、加载与注册
  workbench/                      # 路由与页面编排控制器
```

## 2026-03-18 并行优化结果

- 权限能力：`PagePermissionDialog`、`PortalAuthorityDialog` 的 payload 归一化与数据源请求已抽离到 `templatePage/components/permission/*`。
- 物料入口：admin 侧改为统一 `usePortalMaterials(scene)`，编辑态与预览态通过场景参数切换，不再维护三个并行 wrapper。
- 协议兼容：模板详情接口的 `whiteList -> whiteDTOS` 兼容逻辑已下沉到 `packages/adapters`，`PortalManagement` 模块内不再保留同类 `compat` 映射文件。

## 路由总览（管理端）

| 路由                                       | 作用                   |
| ------------------------------------------ | ---------------------- |
| `/portal/setting`                          | 门户模板列表           |
| `/portal/design?id=...`                    | 门户设计工作台         |
| `/portal/page/edit?id=...&tabId=...`       | 页面深度编辑           |
| `/portal/preview?templateId=...&tabId=...` | 预览渲染（匿名可访问） |

## 兼容入口说明

历史页面仍保留以避免外链失效：

- `/guide/portal-designer`
- `/guide/portal-engine`

它们已收敛为“兼容入口页”，主内容以 `guide/portal/*` 为准。
