# UserManagement 用户管理迁移设计（User 模块 + 导入上传组件）

## 背景与目标

本次在 `apps/admin/src/modules/UserManagement` 下完整迁移老项目用户管理能力（`/system/user`），并在 `packages/ui` 沉淀可配置上传组件 `ObImportUpload`。目标是保持老项目操作习惯，同时收敛到当前仓库统一架构：

- 页面编排：`PageContainer + OneTableBar + ObVxeTable + ObCrudContainer`
- 状态管理：`useTable + useCrudContainer`
- 目录结构：feature-first
- 文档与组件沉淀：同步 `apps/docs`

## 范围

### 必做能力（按用户确认）

1. 用户列表完整能力：
   - 组织树筛选 + 关键字/高级筛选
   - 分页、勾选、批量启用/停用
   - 新增、编辑、查看、删除（强确认输入姓名）
   - 重置密码、修改账号
   - 关联账号（企业账号）
   - 组织内拖拽排序
2. 导入能力：
   - 模板下载放页面层（不放上传组件）
   - 上传组件支持配置：数量、大小、类型，默认与当前习惯一致
3. UI 组件沉淀：
   - `packages/ui/src/components/upload/ImportUpload.vue`
   - 导出并注册为 `ObImportUpload`（支持别名）

### 非目标

- 不新增用户管理 mock（按约束默认直连真实后端）
- 不做历史配置兼容分叉（按当前方案收敛）

## 方案选型

### 方案 A（推荐，采用）

在当前仓库按模块化重新实现：保留老项目接口与交互语义，重构为当前标准组件与 hooks 架构。

优点：
- 与 `position/org` 结构一致，维护成本低
- 业务行为可对齐老项目，体验一致
- 可复用能力（导入组件）可沉淀到 `packages/ui`

缺点：
- 首次迁移工作量较大，需要完整字段映射与表单拆分

### 方案 B（不采用）

直接复制老项目页面并最小改造。

缺点：
- 架构不统一，后续维护困难
- 会引入大量旧项目壳组件依赖，不符合仓库边界约束

## 模块设计

### 1) User 模块目录

```text
apps/admin/src/modules/UserManagement/user/
├── api.ts
├── columns.tsx
├── const.ts
├── form.ts
├── page.vue
├── utils/
│   ├── buildUserListParams.ts
│   └── dragSort.ts
└── components/
    ├── UserSearchForm.vue
    ├── UserEditForm.vue
    ├── UserAccountForm.vue
    └── UserBindAccountForm.vue
```

### 2) 上传组件目录

```text
packages/ui/src/components/upload/
└── ImportUpload.vue
```

并在 `packages/ui/src/index.ts` 与 `packages/ui/src/plugin.ts` 中导出/注册。

## 关键交互与数据流

1. **列表查询**
   - 组织树节点 -> `searchForm.orgId`
   - `buildUserListParams(searchForm)` 统一构建查询参数（含日期范围）
   - `useTable` 负责分页与刷新
2. **新增/编辑/查看**
   - `useCrudContainer` 托管弹层生命周期
   - `form.ts` 负责 `detail -> form` 与 `form -> payload`
3. **删除**
   - 先弹确认，再二次输入姓名匹配后调用删除接口
4. **拖拽排序**
   - 仅在已选组织下启用
   - 拖拽后调用 `adjust-org-sort`，失败回滚（重新查询）
5. **导入**
   - 页面层模板下载按钮
   - `ObImportUpload` 负责校验与上传调用

## ObImportUpload API 设计

- `request: (file: File) => Promise<unknown>`（必填）
- `limit?: number`（默认 `1`）
- `maxSizeMb?: number`（默认 `10`）
- `accept?: string`（默认 Excel）
- `extensions?: string[]`（默认 `['xls','xlsx']`）
- `showFileList?: boolean`（默认 `false`）
- `disabled?: boolean`
- `buttonText?: string`（默认 `导入`）
- `buttonIcon?: Component`
- `successCode?: number | string`（默认 `200`）
- `resolveSuccess?: (response: unknown) => boolean`
- `successMessage?: string`
- `errorMessage?: string`

事件：
- `uploaded(response)`
- `failed(error)`

## 风险与应对

1. **后端字段差异风险**：通过 `api.ts` 统一 normalize，避免页面直接依赖原始字段。
2. **复杂表单可维护性风险**：拆分为独立表单组件，页面仅做编排。
3. **拖拽稳定性风险**：仅在组织筛选场景启用；失败强制刷新回滚。
4. **上传成功判定差异**：提供 `resolveSuccess/successCode` 双策略。

## 验证策略

- `pnpm -C packages/ui typecheck`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs build`

