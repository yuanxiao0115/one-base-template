---
outline: [2, 3]
---

# CRUD 模块最佳实践（基于 Position 模块）

本文以 `Position`（职位管理）为蓝本，沉淀一套可复用的 CRUD 模块落地规范，目标是：

- **业务页只做编排**，不堆积数据转换和弹层状态机
- **目录清晰且可迁移**，便于后续批量复制到组织、用户、字典等模块
- **统一交互与视觉**，保持 `OneTableBar + ObVxeTable + ObCrudContainer` 一致体验

参考实现：

- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/position/page.vue`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/position/api.ts`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/position/form.ts`

## 1. 标准目录与职责分层

推荐按 feature-first 组织（与 Position 一致）：

```text
modules/<FeatureName>/<EntityName>/
├── page.vue                    # 页面编排层（表格 + 搜索 + 容器）
├── api.ts                      # 接口层（请求参数/响应类型/接口函数）
├── form.ts                     # 表单模型、规则、映射函数
├── columns.tsx                 # 表格列定义
└── components/
    ├── <Entity>EditForm.vue    # 编辑/查看表单
    └── <Entity>SearchForm.vue  # 高级筛选表单
```

职责边界：

- `api.ts`：只关心接口契约与字段映射，**不写页面状态逻辑**
- `form.ts`：统一做 `detail -> form`、`form -> payload` 转换
- `page.vue`：只做 orchestration（编排），不堆积字段清洗细节

## 2. API 与类型契约规范

### 2.1 必备类型

每个模块建议定义以下类型：

- `BizResponse<T>`：统一响应包裹（`code/data/message`）
- `XXXRecord`：表格行数据
- `XXXPageParams` / `XXXPageData`：分页查询入参与出参
- `XXXSavePayload`：新增/编辑提交体

### 2.2 参数清洗与字段收敛

参考 Position：

- 查询文本统一 `trimText()` 后再传给后端
- 数值字段在 `toPayload()` 中显式 `Number(...)`
- 避免在页面里散落 `trim/Number`，全部收敛到 `form.ts`

## 3. 页面编排基线（强推荐）

统一采用：

`PageContainer` + `OneTableBar` + `ObVxeTable` + `ObCrudContainer`

### 3.1 列表层

`page.vue` 保持以下最小职责：

1. 定义 `searchForm`（`reactive`）
2. 定义 `tableOpt` 并调用 `useTable`
3. 绑定分页事件 `handleSizeChange / handleCurrentChange`
4. 在 `operation` 插槽编排行操作（编辑/查看/删除）

### 3.2 删除交互

遵循 Position 的删除链路：

1. `obConfirm.warn(...)` 二次确认
2. 调用 `deleteRow(row)`（由 `useTable` 托管）
3. 成功/失败统一 `message.success/error`

建议保留 `deletePayloadBuilder`，避免页面反复写 `id` 提取逻辑。

## 4. CRUD 状态机：统一使用 useCrudContainer

推荐最小配置（Position 同款）：

```ts
const crud = useCrudContainer<FormModel, RowModel>({
  entityName: '实体中文名',
  createForm: () => ({ ...defaultForm }),
  formRef: editFormRef,
  loadDetail: async ({ row }) => row,
  mapDetailToForm: ({ detail }) => toForm(detail),
  beforeSubmit: ({ form }) => toPayload(form),
  submit: async ({ mode, payload }) => {
    const res = mode === 'create' ? await api.add(payload) : await api.update(payload)
    if (res.code !== 200) throw new Error(res.message || '保存失败')
    return res
  },
  onSuccess: async ({ mode }) => {
    message.success(mode === 'create' ? '新增成功' : '更新成功')
    await onSearch(false)
  }
})
```

关键点：

- `detail` 模式只读由 `crud.readonly` 统一控制
- `crud.confirm()` 内部已串联校验 + 提交 + 关闭
- 如无特殊需求，优先使用默认错误提示；只有需要分阶段提示时再传 `onError`

## 5. 表单模型与组件约束

### 5.1 form.ts 只做三件事

1. `defaultForm`
2. `formRules`
3. `toForm / toPayload`

### 5.2 EditForm 组件实现要求

与 Position 一致：

- 使用 `defineModel<Form>({ required: true })`
- 暴露 `CrudFormLike`（`validate/clearValidate/resetFields`）
- 只负责字段渲染，不处理接口和弹层状态

### 5.3 SearchForm 组件实现要求

- 使用 `defineModel<SearchForm>({ required: true })`
- 暴露 `resetFields` 供 `OneTableBar` 的重置动作调用
- 仅承载筛选项 UI，不耦合查询触发逻辑

## 6. 表格列与操作区规范

### 6.1 列定义

- 列集中在 `columns.tsx`
- `operation` 列固定在右侧，明确 `slot: 'operation'`
- `minWidth` 优先于固定宽度，减少拥挤
- 对齐规则统一：**表头全部左对齐**；数量/金额等数值列右对齐；操作列右对齐；其余常规列左对齐

### 6.2 行操作按钮

推荐使用 `ObActionButtons` 包裹操作按钮：

- 默认处理“超过阈值折叠更多”
- 自动保持删除按钮在直出区最右侧
- 降低每页手写按钮排序逻辑成本

## 7. 命名与复用建议

遵循项目既有命名约定（短、清楚、动词 + 名词）：

- API：`page/add/update/remove/checkUnique`
- 转换：`toXxxForm/toXxxPayload`
- 事件：`onResetSearch/handleDelete/tableSearchByName`

避免：

- `resolve/assemble/orchestrate` 连续堆叠
- 页面内重复定义同构 `onError`/`payload` 转换逻辑

## 8. 新 CRUD 模块落地清单（可直接照抄）

1. 复制 Position 目录骨架（`api.ts + form.ts + columns.tsx + page.vue + components/*`）
2. 替换实体字段与接口地址，优先改 `form.ts` 映射函数
3. 接入路由（`routes.ts`）并设置 `meta.title/keepAlive`
4. 在页面只保留编排：`useTable + useCrudContainer + slots`
5. 跑验证命令并补文档

推荐验证命令：

```bash
pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck
pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint
pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build
```

## 9. 什么时候偏离 Position 模板

仅在以下场景允许偏离：

- 编辑表单字段明显超多，需 `drawerColumns=2` 或拆分子表单组件
- 编辑前必须拉取字典/树数据，需在 `beforeOpen` 预加载
- 删除接口入参不是 `id`，需定制 `deletePayloadBuilder`

如果不满足上述条件，**默认按 Position 模板收敛实现**，可最大化减少页面差异与维护成本。

## 10. 组织管理完整迁移补充（UserManagement/org）

当你迁移的是“树形 + 多弹窗协作”的复杂 CRUD（例如组织管理），建议在 Position 模板基础上补齐以下能力：

- **树表模式切换**：无关键字时走懒加载树表；有关键字时走扁平搜索列表（`search` 接口）。
- **懒加载缓存**：按 `parentId` 做节点缓存，并设置过期时间（例如 5 分钟），减少重复请求。
- **组织表单约束**：`parentId` 支持树选择，编辑时禁选自身与子孙节点，避免形成环。
- **名称唯一性**：在提交前与字段 blur 双重校验（`/org/unique/check`），保证交互及时与提交安全。
- **能力分层弹窗**：主编辑用 `ObCrudContainer`；组织管理员与等级管理拆成独立组件，页面只保留编排逻辑。

参考实现（本仓库）：

- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/org/page.vue`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/org/components/OrgEditForm.vue`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/org/components/OrgManagerDialog.vue`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/org/components/OrgLevelManageDialog.vue`

## 11. 用户管理完整迁移补充（UserManagement/user）

当你迁移的是“组织树 + 复杂表单 + 批量操作 + 导入”的场景（例如用户管理），建议在 Position 模板基础上补齐以下能力：

- **树筛选 + 分页列表联动**：左侧组织树仅负责写入 `searchForm.orgId`，列表查询统一走 `buildUserListParams`，避免页面散落时间/布尔字段转换。
- **日期入参兜底过滤**：`startDate/endDate` 仅在存在有效值时透传给 `userApi.page`，避免把空字符串传给后端导致报错。
- **复杂表单分层**：主表单拆成 `UserEditForm`（用户信息）、`UserAccountForm`（修改账号）、`UserBindAccountForm`（关联账号），页面只保留编排和事件路由。
- **确认交互统一封装**：UserManagement 模块不直接调用 `ElMessageBox`，统一使用 `obConfirm`（包含输入型删除确认）。
- **操作列统一收敛**：使用 `ObActionButtons` 后不再叠加手写 `el-dropdown`，更多操作交给组件内置折叠能力。
- **复杂逻辑下沉 actions.ts**：除标准 CRUD 外（批量启停、重置密码、导入映射、命名确认删除等）统一抽离到 `actions.ts`，页面脚本只做编排。
- **批量操作统一入口**：启用/停用、重置密码、删除二次确认全部收敛到页面脚本函数，保持提示文案和异常处理一致。
- **组织内拖拽排序**：仅在已选组织时启用拖拽，失败后强制重新查询回滚，避免“前端排序成功、后端失败”导致的数据错位。
- **导入能力组件化**：将上传校验（数量/大小/类型）沉淀到 `ObImportUpload`，页面只负责模板下载和上传成功后的刷新动作。
- **高级筛选抽屉宽度约束**：抽屉内容区默认限制 `width/max-width: 100%` 并关闭横向滚动；底部“重置/确定”按钮统一右对齐，避免布局漂移。
- **左树右表标准布局**：优先使用 `PageContainer` 的 `#left` 插槽承载树，树组件统一使用 `ObTree`（仅叶子节点溢出时 tooltip）。

参考实现（本仓库）：

- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/user/page.vue`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/user/api.ts`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/user/form.ts`
- `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/UserManagement/user/components/UserEditForm.vue`
- `/Users/haoqiuzhi/code/one-base-template/packages/ui/src/components/upload/ImportUpload.vue`
