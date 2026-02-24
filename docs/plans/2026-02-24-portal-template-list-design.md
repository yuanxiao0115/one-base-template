# PC 门户模板列表（表格版）Design

## 目标

把管理侧 `/portal/templates` 从占位页升级为**表格列表**（不再使用卡片），在不改后端接口的前提下，提供最小可用的管理闭环：

- 搜索（名称关键字）
- 发布状态筛选（全部/草稿/已发布）
- 分页
- 行内操作：配置、预览、发布/取消发布、删除

## 范围与约束

- **只做 PC 管理侧**，页面挂在 `AdminLayout` 内（需要登录 + 菜单权限）。
- 不实现：新增/编辑弹窗、复制、批量删除、分享、封面卡片、抽屉高级筛选。
- 预览页继续复用既有顶层路由：`/portal/preview/:tabId?templateId=<id>`（允许匿名访问）。
- 不新增后端接口；只使用既有接口：
  - `GET /cmict/portal/template/page`
  - `GET /cmict/portal/template/detail`
  - `GET /cmict/portal/template/publish/{status}`
  - `POST /cmict/portal/template/delete`

## 交互设计

### 顶部筛选区（单行）

- 门户名称：`searchKey`（回车触发查询）
- 发布状态：`publishStatus`（undefined 表示全部）
- 按钮：查询 / 重置

### 表格列与操作

表格列：

- 门户名称 `templateName`
- 描述 `description`（为空显示 `-`）
- 状态 `publishStatus`（ElTag：草稿/已发布）
- 操作：
  - 配置：跳转 `/portal/designer?templateId=<id>`
  - 预览：调用 `template.detail(id)`，从 `tabList` 找到第一个 `tabType===2` 的 tabId（找不到则提示）；再 `window.open('/portal/preview/<tabId>?templateId=<id>')`
  - 发布/取消发布：`template.publish({ id, status: publishStatus===1 ? 0 : 1 })`，成功后刷新列表
  - 删除：确认后 `template.delete({ id })`，成功后刷新列表；若删除后本页无数据且 `currentPage>1`，自动回退上一页再查询

### 数据兼容

兼容后端不同分页字段命名：

- `records`（列表数据）
- `total` 或 `totalCount`（总数）

## 验证方式

- `pnpm -w typecheck`
- `pnpm -w lint`
- `pnpm -w build`
- `pnpm -C apps/docs build`
- 本地访问 `http://127.0.0.1:5174/portal/templates` 手动验证操作链路

