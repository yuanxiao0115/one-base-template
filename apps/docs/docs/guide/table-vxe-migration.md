# 统一表格迁移指南（ObTableBox + useTable）

本模板当前提供两套统一表格壳组件：

- `ObTable`：基于 `Element Plus el-table + el-pagination`，适合绝大多数常规列表与树表页面
- `ObVxeTable`：保留给需要 VXE 专属能力的场景

迁移目标保持不变：

- 保留旧业务页核心交互（搜索/筛选/分页/多选）
- 将主要改动收敛在「标签替换 + 导入替换」
- 支持后续大批量迁移，不在业务页重复造轮子

> 默认采用“容器自适应撑满”布局：在 `ObPageContainer + ObTableBox` 结构下，表格区域自动填充 `one-table-bar__content`，分页器固定显示在底部。
>
> `ObTableBox` 默认采用“搜索框 + 筛选图标按钮”样式；统一表格壳组件默认视觉向旧 puretable 页靠拢（浅灰表头、底部分页左总数右分页）。
>
> 当数据超出可视区时，滚动区域在表格主体（body）内，分页器不跟随内容滚动。
>
> 表格视觉基线（默认内置）：字号 `14px`、表头字重 `600`、内容字重 `500`、行高 `56px`；表头背景 `#f8f8f8`、表头/内容文字颜色 `#333`；滚动条颜色 `#DCDEE0`、宽 `8px`、圆角 `6px`。
>
> 共享表格 token 统一维护在 `packages/ui/src/styles/table-theme.css`；VXE 专属变量继续维护在 `packages/ui/src/styles/vxe-theme.css`。
>
> `ObTable` 内置中文分页、空态图片、空值占位、超长省略 tooltip、普通树表与懒加载树表桥接；`ObVxeTable` 继续保留 VXE 专属能力。

## 组件与 Hook 对应关系

| 能力             | 新实现                                  | 兼容目标                                       |
| ---------------- | --------------------------------------- | ---------------------------------------------- |
| 表格头工具条     | `ObTableBox` / `TableBox`（导出名）     | 保留旧 ObTableBox 的快捷搜索、抽屉筛选、已选条 |
| 表格主体（默认） | `ObTable` / `Table`                     | 对齐常规列表/树表页常用 props/events/expose    |
| 表格主体（扩展） | `ObVxeTable` / `VxeTable`               | 对齐 VXE 专属交互与大批量历史迁移              |
| 表格数据管理     | `useTable`（`@one-base-template/core`） | 旧 API 不破坏 + 新 API 增量能力                |

## ObTable 现状与接入建议

`ObTable` 的目标是提供“**同契约、低心智、样式统一**”的默认表格底座：

- **交互契约**：已对齐 `selection-change`、`page-size-change`、`page-current-change`、`sort-change`，并保留 `getTableRef()`、`setAdaptive()`、`clearSelection()`。
- **分页体验**：使用 `Element Plus` 的 `el-pagination`，并固定使用 `zh-cn` locale，分页文案统一中文展示。
- **主题策略**：`packages/ui/src/styles/table-theme.css` 为共享表格 token 层，`ObTable` 与 `ObVxeTable` 同时消费，避免视觉体系分叉。
- **树形能力**：支持 `treeConfig`（含 `expandAll/lazy/loadMethod/childrenField/hasChildField`），满足菜单管理、组织管理类页面迁移需求。
- **列宽契约**：支持消费列定义中的 `width/minWidth`，避免配置失效。
- **列内容可读性**：支持 `showOverflowTooltip/ellipsis` 控制超长省略；鼠标悬浮自动展示 tooltip（操作列默认关闭）。
- **空态视觉**：无数据时统一展示组件级空态图片 + 文案“暂未生产任何数据”，树表/普通表同时生效，且空态内容保持居中。
- **空值兜底**：默认空值展示 `---`，可通过 `showEmptyValue` 关闭，或通过 `emptyValueText` 自定义占位文案；空态文案可通过 `emptyText` 自定义。

推荐接入顺序：

1. 普通列表与树表优先使用 `ObTable`；
2. 仅当页面明确依赖 VXE 专属能力时再使用 `ObVxeTable`；
3. 对照关键交互（排序、多选、分页、树展开）做页面回归；
4. 若页面稳定，再按模块批量推广。

最小替换示例：

```vue
<ObTable
  :data="dataList"
  :columns="columns"
  :pagination="pagination"
  :loading="loading"
  row-key="id"
/>
```

可选的编程式控制（与 `useTable` 兼容）：

```ts
const tableRef = ref<{ getTableRef: () => Record<string, unknown> } | null>(null);

const table = tableRef.value?.getTableRef();
table?.clearSelection?.();
```

## 首期迁移策略

推荐默认采用：

1. `pure-table` -> `ObTable`
2. 页面外层统一使用 `ObPageContainer` 承载滚动与高度（`padding="0"`）
3. 继续保留 `ObTableBox` 包裹布局
4. 页面内直接调用 `@one-base-template/core` 的 `useTable`（不再经过 admin 本地 wrapper）

## ObTable 默认配置（建议先用默认）

为了减少迁移页模板样板代码，`ObTable` 已内置常用默认值：

- `tableLayout='auto'`
- `showOverflowTooltip=true`
- `showEmptyValue=true`
- `emptyValueText='---'`
- `emptyText='暂未生产任何数据'`
- `stripe=false`
- `border=false`
- `rowKey='id'`
- 分页器固定为 `Element Plus el-pagination`，且文案中文化
- 当传入 `size='small'` 且未手动指定 `paginationSmall` 时，分页自动切小尺寸

推荐先只传核心参数：`data`、`columns`、`pagination`、`loading`，其余按需覆盖。

## 树形表格迁移（组织管理）

组织管理等树形页建议使用：

- `pagination=false`（树形通常不分页）
- 根节点查询 `parentId` 优先取登录用户 `companyId`（无值回退 `0`）
- 关键字搜索同样透传 `parentId`，保证“按所属公司范围”搜索，避免跨树污染结果
- `treeConfig.lazy=true`
- `treeConfig.hasChildField='hasChildren'`
- `treeConfig.childrenField='children'`
- `treeConfig.loadMethod`（异步加载下级节点）
- 若 `/children` 接口未返回 `hasChildren`，在模块 API 统一补 `hasChildren: true`；`loadMethod` 返回空数组时回写 `row.hasChildren = false`

与两套表格底座的关键差异：

- `ObTable`：`lazy + load + tree-props` 后，默认首列即可显示树图标
- `ObVxeTable`：除 `treeConfig` 外，还要在列上显式声明 `treeNode: true`
- 建议在 API 层做一次转换（如 `toOrgRows`），把 `id/parentId/hasChildren/children` 统一成树表标准字段

菜单权限类页面（树 + 条件筛选切列表）可沿用同一套底座策略：

- 无筛选条件：拉取权限树并开启 `treeConfig`
- 有筛选条件：切换到列表接口并关闭 `treeConfig`
- 操作列建议保留“新建子级/平级 + 编辑 + 查看 + 删除”交互，便于复用老业务逻辑

## 操作按钮容器（ObActionButtons）

为减少业务页手动处理“删除置右 + 超出折叠”的样板逻辑，`@one-base-template/ui` 提供 `ObActionButtons`：

- 默认最多直出 `4` 个按钮；
- 超过 `4` 个时：直出 `3` 个按钮，并在最右侧自动追加“更多”下拉；
- 会自动把“删除（danger/文案含删除）”按钮放到直出区域最右侧；
- 用法保持零负担：业务页只需把所有按钮放在一个插槽里。

```vue
<template #operation="{ row }">
  <ObActionButtons>
    <el-button link type="primary" @click="onView(row)">查看</el-button>
    <el-button link type="primary" @click="onEdit(row)">编辑</el-button>
    <el-button link type="primary" @click="onDisable(row)">停用</el-button>
    <el-button link type="primary" @click="onGrant(row)">授权</el-button>
    <el-button link type="danger" @click="onDelete(row)">删除</el-button>
  </ObActionButtons>
</template>
```

示例（简化）：

```vue
<ObVxeTable
  :data="dataList"
  :columns="columns"
  :pagination="false"
  row-key="id"
  :tree-config="{
    lazy: true,
    hasChildField: 'hasChildren',
    childrenField: 'children',
    loadMethod: loadTreeChildren
  }"
/>
```

## 列定义兼容

`ObVxeTable` 可直接识别旧列结构：

- `slot`：单元格具名插槽（如 `action`）
- `headerSlot`：表头插槽
- `cellRenderer`：函数式渲染
- `children`：多级表头
- `hide`：列隐藏（支持布尔值与函数）

示例（旧写法可直接复用）：

```ts
import type { TableColumnList } from '@one-base-template/ui';

export const columns: TableColumnList = [
  { type: 'selection', width: 56 },
  { label: '登录账号', prop: 'userAccount', minWidth: 150 },
  { label: '登录时间', prop: 'createTime', sortable: 'custom' },
  { label: '操作', slot: 'action', fixed: 'right', width: 140 }
];
```

### 列对齐规范（统一）

- 表头：全部左对齐（`headerAlign: 'left'`）
- 数量/金额等数值列：右对齐（`align: 'right'`）
- 操作列：右对齐（通常同时 `fixed: 'right'`）
- 其余常规列：左对齐（`align: 'left'`）

## 事件与暴露方法兼容

`ObVxeTable` 已桥接以下旧事件：

- `selection-change`
- `page-size-change`
- `page-current-change`
- `sort-change`

并暴露：

- `getTableRef()`
- `setAdaptive()`
- `clearSelection()`

用于兼容旧 `useTable` 中 `tableRef.value?.setAdaptive?.()` / `getTableRef().clearSelection()`。

## useTable：分区配置

```ts
import { useTable } from '@one-base-template/core';

const table = useTable({
  query: {
    api: loginLogApi.list,
    params: searchForm,
    pagination: true,
    paginationKey: { current: 'current', size: 'size' },
    paginationAlias: {
      current: ['page', 'currentPage'],
      size: ['pageSize']
    },
    enableCache: true,
    debounceTime: 300
  },
  remove: {
    api: loginLogApi.remove,
    idKey: 'id',
    payloadKey: 'id',
    onSuccess: () => message.success('删除成功')
  }
});
```

新增能力：

- 统一响应适配器（默认支持 `data.records/list/rows`）
- 请求缓存 + 缓存清理策略
- 防抖查询
- 5 种刷新策略：`refreshCreate / refreshUpdate / refreshRemove / refreshData / refreshSoft`

## 已落地样板页

- 页面 1：`/system/log/login-log`（分页表格）
  - 路由名：`SystemLoginLogManagement`
  - 2026-03-31：`apps/admin` 版本已切换为 `ObTable`，保留原有分页与操作列交互
  - 代码位置：
    - `apps/admin/src/modules/LogManagement/login-log/list.vue`
    - `apps/admin/src/modules/LogManagement/login-log/columns.tsx`
    - `apps/admin/src/modules/LogManagement/login-log/api.ts`
- 页面 2：`/system/org`（树形组织管理）
  - 路由名：`SystemOrgManagement`
  - 2026-03-31：`apps/admin` 版本已切换为 `ObTable`，保留树形 `treeConfig` 与操作列交互
  - 代码位置：
    - `apps/admin/src/modules/adminManagement/org/list.vue`
    - `apps/admin/src/modules/adminManagement/org/columns.tsx`
    - `apps/admin/src/modules/adminManagement/org/api.ts`
- 页面 3：`/system/permission`（权限管理）
  - 路由名：`SystemMenuManagement`
  - 2026-03-31：`apps/admin` 版本已切换为 `ObTable`，保留树形 `treeConfig` 与操作列交互
  - 代码位置：
    - `apps/admin/src/modules/adminManagement/menu/list.vue`
    - `apps/admin/src/modules/adminManagement/menu/columns.ts`
    - `apps/admin/src/modules/adminManagement/menu/api.ts`
- 页面 4：`/system/role/management`（角色管理）
  - 路由名：`SystemRoleManagement`
  - 2026-03-31：`apps/admin` 版本已切换为 `ObTable`
  - 代码位置：
    - `apps/admin/src/modules/adminManagement/role/list.vue`
    - `apps/admin/src/modules/adminManagement/role/columns.tsx`
    - `apps/admin/src/modules/adminManagement/role/api.ts`
- 页面 5：`/system/role/assign`（角色分配）
  - 路由名：`SystemRoleAssign`
  - 2026-03-31：`apps/admin` 版本已切换为 `ObTable`
  - 代码位置：
    - `apps/admin/src/modules/adminManagement/role-assign/list.vue`
    - `apps/admin/src/modules/adminManagement/role-assign/columns.tsx`
    - `apps/admin/src/modules/adminManagement/role-assign/api.ts`

## 常见迁移问题

### 1) 分页参数后端字段不一致

优先在 `useTable` 新模式配置 `paginationKey + paginationAlias`，避免在每个页面手写转换。

### 2) 多选清空失效

请统一通过 `onSelectionCancel` 调用表格实例 `clearSelection`（兼容层已处理 VXE 的 `clearCheckboxRow`）。

### 3) 高级筛选抽屉保留

继续使用 `ObTableBox` 的 `drawer` 插槽即可，无需改业务表单结构。

## 验证建议

在仓库根目录执行：

```bash
pnpm -C packages/ui typecheck
pnpm -C packages/core typecheck
pnpm -C apps/admin typecheck
pnpm -C apps/admin build
pnpm -C apps/docs build
```
