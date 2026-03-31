# VXE 表格迁移指南（ObTableBox + useTable）

本模板已提供 **puretable -> VXE** 的高兼容迁移基建，目标是：

- 保留旧业务页核心交互（搜索/筛选/分页/多选）
- 将主要改动收敛在「标签替换 + 导入替换」
- 支持后续大批量迁移，不在业务页重复造轮子

> 说明：`ObVxeTable` 内部已补齐 VXE 分页组件注册与样式引入，业务页无需再手动额外引入分页器资源。
>
> 默认采用“容器自适应撑满”布局：在 `ObPageContainer + ObTableBox` 结构下，表格区域会自动填充 `one-table-bar__content`，分页器固定显示在底部。
>
> `ObTableBox` 默认采用“搜索框 + 筛选图标按钮”样式，`ObVxeTable` 默认视觉向旧 puretable 页靠拢（浅灰表头、底部分页左总数右分页）。
>
> 当数据超出可视区时，滚动区域在表格主体（body）内，分页器不跟随内容滚动。
>
> 当前实现为“**分页器与表格主体拆分渲染**”：`VxeGrid` 只负责表体，`VxePager` 独立在底部区域渲染，避免同层滚动导致分页器漂移。
>
> 表格视觉基线（默认内置）：**颜色全部走主题 token**（如 `--one-table-header-bg`、`--one-table-header-border-bottom-color`、`--el-bg-color-overlay`），不在组件内重复维护独立色值；行高 `56px`，不绘制左右边框，最后一行不绘制底部边框。
>
> VXE 主题变量统一在 `packages/ui/src/styles/vxe-theme.css` 维护，并在 `packages/ui/src/index.ts` 于 `vxe-table/lib/style.css` 之后引入。业务页如需主题化，请优先扩展该文件，而不是在 `ObVxeTable` 内局部覆盖 `--vxe-ui-*`。
>
> 宽度策略：表格会默认以 `min-width: 100%` 撑满可用宽度（列总宽不足时自动铺满，不留右侧空白带）。
>
> 滚动条策略：纵向滚动条使用窄轨道样式（默认 `8~10px` 视觉宽度），避免粗滚动条破坏整体视觉。
>
> 树形策略：`ObVxeTable` 支持 `treeConfig` 透传，可直接迁移组织管理类「树表 + 懒加载」页面。
>
> **并存策略补充（2026-03-31）**：`packages/ui` 已新增 `ObTanStackTable`（导出名 `TanStackTable`），与 `ObVxeTable` 并存，便于分页面灰度验证性能与交互一致性。

## 组件与 Hook 对应关系

| 能力             | 新实现                                  | 兼容目标                                       |
| ---------------- | --------------------------------------- | ---------------------------------------------- |
| 表格头工具条     | `ObTableBox` / `TableBox`（导出名）     | 保留旧 ObTableBox 的快捷搜索、抽屉筛选、已选条 |
| 表格主体         | `ObVxeTable` / `VxeTable`               | 对齐 pure-table 常用 props/events/expose       |
| 表格主体（灰度） | `ObTanStackTable` / `TanStackTable`     | 与 `ObVxeTable` 保持同一契约，按需灰度替换     |
| 表格数据管理     | `useTable`（`@one-base-template/core`） | 旧 API 不破坏 + 新 API 增量能力                |

## TanStack 封装现状与接入建议

`ObTanStackTable` 的目标不是立即替换所有 VXE 页面，而是先提供“**同契约、可灰度**”的备选实现：

- **交互契约**：已对齐 `selection-change`、`page-size-change`、`page-current-change`、`sort-change`，并保留 `getTableRef()`、`setAdaptive()`、`clearSelection()`。
- **分页体验**：改为 `Element Plus` 的 `el-pagination`，并在组件内固定使用 `zh-cn` locale，分页文案统一中文展示。
- **主题策略**：`packages/ui/src/styles/table-theme.css` 为共享表格 token 层，`ObVxeTable` 与 `ObTanStackTable` 同时消费，避免两套视觉体系分叉。
- **滚动稳定性（2026-03-31）**：TanStack 粘性表头与 fixed 列改为“前景色 + `surface` 底色”叠层背景，避免纵向/横向滚动时出现透底。
- **树形能力**：支持 `treeConfig`（含 `expandAll/lazy/loadMethod/childrenField/hasChildField/trigger/reserve`）与 `treeNode` 列标记，满足菜单管理、组织管理类页面迁移需求。
- **树表视觉对齐（2026-03-31）**：树节点列已补齐表头偏移对齐；展开按钮改为设计稿 SVG（未展开/已展开），并统一为 `14px` 字号（表头 `600`、内容 `400`）。
- **列宽契约（2026-03-31）**：`width/minWidth` 改为优先消费列定义与手动拖拽值，避免被默认宽度覆盖导致配置不生效。
- **列内容可读性（2026-03-31）**：列支持 `showOverflowTooltip/ellipsis` 控制超长省略；鼠标悬浮时自动展示 tooltip（操作列默认关闭）。
- **空态视觉（2026-03-31）**：无数据时统一改为组件级空态图片 + 文案“暂未生产任何数据”（树表/普通表均生效），并改为居中 overlay 渲染；空态时自动禁用横向滚动条，避免空态内容跟随横向滚动。
- **空值兜底（2026-03-31）**：新增空值占位配置，默认空值展示 `---`，可通过 `showEmptyValue` 关闭，或通过 `emptyValueText` 自定义占位文案；空态文案可通过 `emptyText` 自定义。
- **性能补充（2026-03-31）**：树数据同步仅在 `treeConfig.lazy + loadMethod` 时深拷贝；非 lazy 场景改为浅同步并关闭深度监听。`tableLayout` 在“虚拟滚动 / 手动列宽 / 显式列宽”场景会自动收口到 `fixed`，减少大表布局抖动。

本轮已补齐的常用能力（用户点选 2/3/4/5/9）：

- **2）列显隐**：支持 `setColumnVisibility` / `toggleColumnVisibility` / `getColumnVisibility`。
- **3）列宽调整**：支持表头右侧拖拽列宽；`selection/index/expand` 列默认不参与 resize。
- **4）列顺序拖拽**：支持拖拽表头调整列顺序；并暴露 `setColumnOrder` / `getColumnOrder`。
- **5）虚拟滚动**：支持 `virtualConfig`（`enabled`、`y.rowHeight`、`y.overscan`）按需开启大数据量渲染优化。
- **9）跨页选择**：新增 `reserveSelection`，并提供 `getSelectedRowKeys` / `setSelectedRowKeys`。

建议约束：

- 启用跨页选择时，`row-key` 必须稳定且全局唯一（推荐后端主键）。
- 虚拟滚动建议先在“固定行高”列表页灰度，避免动态高度场景下滚动抖动。

推荐接入顺序：

1. 先在单个列表页把 `ObVxeTable` 替换为 `ObTanStackTable`，其余参数保持不变；
2. 对照关键交互（排序、多选、分页、树展开）做页面回归；
3. 若页面稳定，再按模块批量推广。

最小替换示例：

```vue
<ObTanStackTable
  :data="dataList"
  :columns="columns"
  :pagination="pagination"
  :loading="loading"
  :reserve-selection="true"
  :virtual-config="{ enabled: true, y: { rowHeight: 44, overscan: 8 } }"
  row-key="id"
/>
```

可选的编程式控制（与 VXE 迁移期兼容）：

```ts
const tableRef = ref<{ getTableRef: () => Record<string, unknown> } | null>(null);

const table = tableRef.value?.getTableRef();
table?.toggleColumnVisibility?.('userName', false);
table?.setColumnOrder?.(['userName', 'phone', 'status']);
table?.setSelectedRowKeys?.(['1001', '1002']);
```

## 首期迁移策略

推荐默认采用：

1. `pure-table` -> `ObVxeTable`
2. 页面外层统一使用 `ObPageContainer` 承载滚动与高度（`padding="0"`）
3. 继续保留 `ObTableBox` 包裹布局
4. 页面内直接调用 `@one-base-template/core` 的 `useTable`（不再经过 admin 本地 wrapper）

## ObVxeTable 默认配置（建议先用默认）

为了减少迁移页模板样板代码，`ObVxeTable` 已内置常用默认值：

- `tableLayout='auto'`
- `showOverflowTooltip=true`
- `stripe=false`
- `border=false`
- `rowKey='id'`
- 分页器 `autoHidden=false`（有分页配置时默认展示）
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
- `treeNode=true` 必须加在“树展示列”（通常第一列），否则 VXE 不会渲染展开图标
- 若 `/children` 接口未返回 `hasChildren`，在模块 API 统一补 `hasChildren: true`；`loadMethod` 返回空数组时回写 `row.hasChildren = false`

与 Element Table 的关键差异：

- Element：`lazy + load + tree-props` 后，默认首列就能显示树图标
- VXE：除 `treeConfig` 外，还要在列上显式声明 `treeNode: true`
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
  - 2026-03-31 灰度：`apps/admin` 版本已切换为 `ObTanStackTable`，保留原有分页与操作列交互
  - 代码位置：
    - `apps/admin/src/modules/LogManagement/login-log/list.vue`
    - `apps/admin/src/modules/LogManagement/login-log/columns.tsx`
    - `apps/admin/src/modules/LogManagement/login-log/api.ts`
- 页面 2：`/system/org`（树形组织管理）
  - 路由名：`SystemOrgManagement`
  - 2026-03-31 灰度：`apps/admin` 版本已切换为 `ObTanStackTable`，保留树形 `treeConfig` 与操作列交互
  - 代码位置：
    - `apps/admin/src/modules/adminManagement/org/list.vue`
    - `apps/admin/src/modules/adminManagement/org/columns.tsx`
    - `apps/admin/src/modules/adminManagement/org/api.ts`
- 页面 3：`/system/permission`（权限管理）
  - 路由名：`SystemMenuManagement`
  - 2026-03-31 灰度：`apps/admin` 版本已切换为 `ObTanStackTable`，保留树形 `treeConfig` 与操作列交互
  - 代码位置：
    - `apps/admin/src/modules/adminManagement/menu/list.vue`
    - `apps/admin/src/modules/adminManagement/menu/columns.ts`
    - `apps/admin/src/modules/adminManagement/menu/api.ts`
- 页面 4：`/system/role/management`（角色管理）
  - 路由名：`SystemRoleManagement`
  - 2026-03-31 灰度：`apps/admin` 版本已切换为 `ObTanStackTable`
  - 代码位置：
    - `apps/admin/src/modules/adminManagement/role/list.vue`
    - `apps/admin/src/modules/adminManagement/role/columns.tsx`
    - `apps/admin/src/modules/adminManagement/role/api.ts`
- 页面 5：`/system/role/assign`（角色分配）
  - 路由名：`SystemRoleAssign`
  - 2026-03-31 灰度：`apps/admin` 版本已切换为 `ObTanStackTable`
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
