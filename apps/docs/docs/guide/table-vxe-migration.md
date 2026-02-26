# VXE 表格迁移指南（OneTableBar + useTable）

本模板已提供 **puretable -> VXE** 的高兼容迁移基建，目标是：

- 保留旧业务页核心交互（搜索/筛选/分页/多选）
- 将主要改动收敛在「标签替换 + 导入替换」
- 支持后续大批量迁移，不在业务页重复造轮子

> 说明：`ObVxeTable` 内部已补齐 VXE 分页组件注册与样式引入，业务页无需再手动额外引入分页器资源。
> 
> 默认采用“容器自适应撑满”布局：在 `PageContainer + OneTableBar` 结构下，表格区域会自动填充 `one-table-bar__content`，分页器固定显示在底部。
>
> `OneTableBar` 默认采用“搜索框 + 筛选图标按钮”样式，`ObVxeTable` 默认视觉向旧 puretable 页靠拢（浅灰表头、底部分页左总数右分页）。
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

## 组件与 Hook 对应关系

| 能力 | 新实现 | 兼容目标 |
| --- | --- | --- |
| 表格头工具条 | `ObOneTableBar` / `OneTableBar` | 保留旧 OneTableBar 的快捷搜索、抽屉筛选、已选条 |
| 表格主体 | `ObVxeTable` / `VxeTable` | 对齐 pure-table 常用 props/events/expose |
| 旧标签过渡 | `PureTableCompat`（admin 内） | 允许局部继续使用 `<PureTableCompat>` 过渡 |
| 表格数据管理 | `useTable`（`@one-base-template/utils`） | 旧 API 不破坏 + 新 API 增量能力 |

## 首期迁移策略

推荐默认采用：

1. `pure-table` -> `ObVxeTable`
2. 页面外层统一使用 `PageContainer` 承载滚动与高度（`padding="0"`）
3. 继续保留 `OneTableBar` 包裹布局
4. 页面内继续调用 `@/hooks/table`（内部已兼容转发到新版 `useTable`）

> 如果某页短期不能改标签，可临时使用 `apps/admin/src/components/table/PureTableCompat.vue` 过渡。

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

## 列定义兼容

`ObVxeTable` 可直接识别旧列结构：

- `slot`：单元格具名插槽（如 `action`）
- `headerSlot`：表头插槽
- `cellRenderer`：函数式渲染
- `children`：多级表头
- `hide`：列隐藏（支持布尔值与函数）

示例（旧写法可直接复用）：

```ts
import type { TableColumnList } from '@one-base-template/ui'

export const columns: TableColumnList = [
  { type: 'selection', width: 56 },
  { label: '登录账号', prop: 'userAccount', minWidth: 150 },
  { label: '登录时间', prop: 'createTime', sortable: 'custom' },
  { label: '操作', slot: 'action', fixed: 'right', width: 140 }
]
```

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

## useTable：新旧双模式

### 旧模式（兼容）

```ts
import useTable from '@/hooks/table'

const { dataList, pagination, onSearch, resetForm, handleSizeChange, handleCurrentChange } =
  useTable({
    searchApi: loginLogApi.list,
    searchForm,
    paginationFlag: true
  }, tableRef)
```

### 新模式（推荐）

```ts
import { useTable } from '@one-base-template/utils'

const table = useTable({
  core: {
    apiFn: loginLogApi.list,
    apiParams: { status: 1 },
    paginationKey: { current: 'current', size: 'size' },
    paginationAlias: {
      current: ['page', 'currentPage'],
      size: ['pageSize']
    }
  },
  performance: {
    enableCache: true,
    debounceTime: 300
  }
})
```

新增能力：

- 统一响应适配器（默认支持 `data.records/list/rows`）
- 请求缓存 + 缓存清理策略
- 防抖查询
- 5 种刷新策略：`refreshCreate / refreshUpdate / refreshRemove / refreshData / refreshSoft`

## 已落地样板页

- 页面：`/demo/login-log-vxe`
- 路由名：`DemoLoginLogMigration`
- 容器结构：`PageContainer + OneTableBar + ObVxeTable`
- 代码位置：
  - `apps/admin/src/modules/demo/pages/DemoLoginLogMigrationPage.vue`
  - `apps/admin/src/modules/demo/login-log/columns.tsx`
  - `apps/admin/src/modules/demo/login-log/api.ts`

## 常见迁移问题

### 1) 分页参数后端字段不一致

优先在 `useTable` 新模式配置 `paginationKey + paginationAlias`，避免在每个页面手写转换。

### 2) 多选清空失效

请统一通过 `onSelectionCancel` 调用表格实例 `clearSelection`（兼容层已处理 VXE 的 `clearCheckboxRow`）。

### 3) 高级筛选抽屉保留

继续使用 `OneTableBar` 的 `drawer` 插槽即可，无需改业务表单结构。

## 验证建议

在仓库根目录执行：

```bash
pnpm -C packages/ui typecheck
pnpm -C packages/utils typecheck
pnpm -C apps/admin typecheck
pnpm -C apps/admin build
pnpm -C apps/docs build
```
