# CmsManagement Publicity 迁移设计

## 背景

- 来源老项目：`/Users/haoqiuzhi/code/sczfw/standard-oa-web-sczfw`
- 来源模块：`src/views/PortalManagement/PortalModules/publicity/**`
- 目标模块：`apps/admin/src/modules/CmsManagement/**`
- 目标：将老项目 `publicity`（栏目管理/内容管理/审核管理）迁移到 admin 新模块体系，风格统一到 `ObPageContainer + ObTableBox + ObVxeTable + ObCrudContainer`。

## 范围冻结

### 必迁移

1. 栏目管理
- 路由：`/publicity/column`
- 能力：树表展示、关键字搜索、显示状态筛选、新增/编辑/删除栏目、跳转文章列表。

2. 内容管理
- 路由：`/publicity/content`
- 能力：文章列表分页查询、按标题/栏目/类型/审核状态筛选、新增/编辑/查看、删除。

3. 审核管理
- 路由：`/publicity/audit`
- 能力：文章审核（通过/驳回）、评论审核（通过/驳回）与评论删除。

4. 文章列表（栏目入口）
- 路由：`/publicity/article-list/:categoryId`
- 能力：复用内容管理列表，默认带栏目筛选。

### 本次不迁移

1. 老项目 `OneEditor` 富文本与附件上传链路（先用文本域 + 封面 URL 保证可用闭环）。
2. 栏目拖拽排序（先保留树表结构与 CRUD 主流程，排序接口后续批次接入）。
3. 审核历史时间轴与复杂弹窗布局（本次保留审核主流程）。
4. 老项目 one-ui 私有组件样式实现（统一替换为 one-base-template 现有 Ob 组件体系）。

## 架构与落点

- 模块注册：`apps/admin/src/modules/CmsManagement/module.ts`
- 路由清单：`apps/admin/src/modules/CmsManagement/routes.ts`
- 页面：`apps/admin/src/modules/CmsManagement/{column,content,audit}/**`
- API 与字段映射：模块内 `api.ts + form.ts + columns.ts`
- 启用策略：更新 `apps/admin/public/platform-config.json` 的 `enabledModules`，新增 `cms-management`。

## 权限与路由策略

- 采用静态路由注册到模块 Manifest。
- 当前后端菜单未必已配置新路径，本次页面统一设置 `meta.skipMenuAuth = true`，保证登录可访问。
- 后续若后端菜单补齐，可收敛为 `meta.activePath` 归属。

## 验收标准

1. `CmsManagement` 模块可被路由注册并通过 `enabledModules` 启用。
2. 三个主页面与一条隐藏文章列表路由均可访问。
3. 关键操作可用：栏目 CRUD、内容 CRUD、文章审核、评论审核/删除。
4. 全部改动通过：
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs build`
