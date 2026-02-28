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
