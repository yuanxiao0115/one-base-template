---
outline: [2, 3]
---

# ObTable

`ObTable` 是后台默认表格组件，封装了空态、首屏骨架、分页、树表、拖拽排序与自适应高度。

## Props

| 属性                      | 类型                                            | 默认值                                                | 说明                                                                 |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| `data`                    | `Record<string, unknown>[]`                     | `[]`                                                  | 表格数据                                                             |
| `columns`                 | `TableColumnList`                               | `[]`                                                  | 列配置                                                               |
| `loading`                 | `boolean`                                       | `false`                                               | 加载态                                                               |
| `loadingConfig`           | `TableLoadingConfig`                            | `{}`                                                  | Element Loading 配置（文案、背景等）                                 |
| `enableFirstLoadSkeleton` | `boolean`                                       | `true`                                                | 是否启用首屏骨架屏                                                   |
| `skeletonRows`            | `number`                                        | `8`                                                   | 骨架屏行数                                                           |
| `skeletonDelayMs`         | `number`                                        | `120`                                                 | 骨架显示延迟                                                         |
| `skeletonMinDurationMs`   | `number`                                        | `200`                                                 | 骨架最小展示时长                                                     |
| `pagination`              | `TablePagination \| false \| null`              | `null`                                                | 分页配置；`null/false` 表示不显示分页                                |
| `paginationSmall`         | `boolean`                                       | `undefined`                                           | 强制分页大小（优先于 `pagination.small`）                            |
| `rowKey`                  | `string`                                        | `'id'`                                                | 行唯一键                                                             |
| `tableKey`                | `string \| number`                              | 自动生成                                              | 多表场景下建议显式传入，避免注册冲突                                 |
| `tableLayout`             | `'fixed' \| 'auto'`                             | `'fixed'`                                             | 表格布局模式                                                         |
| `showOverflowTooltip`     | `boolean`                                       | `true`                                                | 默认开启溢出提示                                                     |
| `showEmptyValue`          | `boolean`                                       | `true`                                                | 空值是否显示占位文本                                                 |
| `emptyValueText`          | `string`                                        | `'---'`                                               | 空值占位文本                                                         |
| `emptyText`               | `string`                                        | `'暂未生产任何数据'`                                  | 空态文案                                                             |
| `alignWhole`              | `'left' \| 'center' \| 'right'`                 | `'left'`                                              | 全表默认对齐                                                         |
| `headerAlign`             | `'left' \| 'center' \| 'right'`                 | `undefined`                                           | 表头默认对齐（未传时沿用列或全表配置）                               |
| `stripe`                  | `boolean`                                       | `false`                                               | 斑马纹                                                               |
| `border`                  | `boolean`                                       | `false`                                               | 边框                                                                 |
| `adaptive`                | `boolean`                                       | `false`                                               | 是否开启自适应高度                                                   |
| `adaptiveConfig`          | `AdaptiveConfig`                                | `{ offsetBottom: 110, fixHeader: true, timeout: 16 }` | 自适应参数                                                           |
| `treeConfig`              | `Record<string, unknown>`                       | `undefined`                                           | 树表配置（`children/hasChildren/lazy/load/indent/defaultExpandAll`） |
| `reserveSelection`        | `boolean`                                       | `false`                                               | 勾选列跨页保留（需配合 `rowKey`）                                    |
| `rowHoverBgColor`         | `string`                                        | `''`                                                  | 行 hover 背景色变量覆盖                                              |
| `locale`                  | `'zhCn' \| 'zhTw' \| 'en' \| TableLocaleObject` | `'zhCn'`                                              | 分页语言                                                             |
| `rowDrag`                 | `boolean`                                       | `false`                                               | 是否启用行拖拽排序                                                   |
| `rowDragConfig`           | `TableRowDragConfig`                            | `{}`                                                  | 拖拽参数（`handle/animation/class`）                                 |
| `tooltipRenderThreshold`  | `number`                                        | `0`                                                   | 行数不超过阈值时启用富文本 tooltip 渲染                              |

## `pagination` 对象字段

`pagination` 继承 `PaginationConfig` 并扩展以下字段：

- 基础字段：`total`、`currentPage`、`pageSize`、`pageSizes`、`layout`、`background`、`small`
- 扩展字段：`size`、`align`、`class`、`style`、`defaultPageSize`、`defaultCurrentPage`、`pageCount`、`pagerCount`、`popperClass`、`prevText`、`nextText`、`disabled`、`hideOnSinglePage`

## `columns` 常用字段

- 基础列：`label`、`prop`、`type`(`selection/index/expand`)、`width`、`minWidth`、`fixed`、`sortable`
- 展示控制：`align`、`headerAlign`、`showOverflowTooltip`、`showEmptyValue`、`emptyValueText`
- 渲染扩展：`slot`、`headerSlot`、`expandSlot`、`cellRenderer`、`headerRenderer`、`formatter`
- 结构能力：`children`（多级表头）、`hide`（布尔/函数）

## `treeConfig` 常用字段

| 字段               | 类型                                                          | 说明                                   |
| ------------------ | ------------------------------------------------------------- | -------------------------------------- |
| `children`         | `string`                                                      | 子节点字段名，默认 `children`          |
| `hasChildren`      | `string`                                                      | 是否有子节点字段名，默认 `hasChildren` |
| `lazy`             | `boolean`                                                     | 是否启用懒加载树表                     |
| `load`             | `(row, treeNode, resolve) => Promise<Row[]> \| Row[] \| void` | 懒加载函数                             |
| `indent`           | `number`                                                      | 缩进宽度，默认 `16`                    |
| `defaultExpandAll` | `boolean`                                                     | 是否默认展开全部                       |

## `rowDragConfig` 字段

| 字段          | 类型     | 默认值                    | 说明                       |
| ------------- | -------- | ------------------------- | -------------------------- |
| `handle`      | `string` | `undefined`               | 指定拖拽手柄选择器（推荐） |
| `animation`   | `number` | `180`                     | 拖拽动画时长               |
| `ghostClass`  | `string` | `'ob-table__drag-ghost'`  | 占位行 class               |
| `chosenClass` | `string` | `'ob-table__drag-chosen'` | 被选中行 class             |
| `dragClass`   | `string` | `'ob-table__dragging'`    | 正在拖拽行 class           |

## Emits

| 事件名                | 参数                                            | 说明                             |
| --------------------- | ----------------------------------------------- | -------------------------------- |
| `selection-change`    | `(selection: RowRecord[])`                      | 勾选行变化                       |
| `page-current-change` | `(page: number)`                                | 当前页变化                       |
| `page-size-change`    | `(size: number)`                                | 每页条数变化                     |
| `sort-change`         | `(payload: Record<string, unknown>)`            | 排序变化（透传 Element payload） |
| `row-drag-sort`       | `(payload: { oldIndex; newIndex; row?; rows })` | 行拖拽完成                       |

## Slots

| 插槽名                 | 说明                                     |
| ---------------------- | ---------------------------------------- |
| `empty`                | 空态区域（覆盖默认插图 + 文案）          |
| `append`               | 表格底部追加内容（`el-table` append 槽） |
| `columns[].slot`       | 列单元格插槽（按 `slot` 字段名匹配）     |
| `columns[].headerSlot` | 列表头插槽（按 `headerSlot` 字段名匹配） |
| `columns[].expandSlot` | 展开行插槽（仅 `type: 'expand'`）        |

## Expose

| 方法/字段                          | 说明                               |
| ---------------------------------- | ---------------------------------- |
| `getTableRef()`                    | 获取底层 `el-table` 实例           |
| `getTableDoms()`                   | 获取表格 DOM 信息（来自布局 hook） |
| `setAdaptive()`                    | 手动触发自适应重算                 |
| `setHeaderSticky(zIndex?, fixed?)` | 手动设置表头 sticky                |
| `clearSelection()`                 | 清空勾选                           |

## 场景示例

### 1. 勾选（含跨页保留）

```vue
<script setup lang="ts">
import { ref } from 'vue';

const tableRef = ref<{
  clearSelection?: () => Promise<void>;
} | null>(null);

const rows = ref([
  { id: 'u-1', name: '张三', status: '启用' },
  { id: 'u-2', name: '李四', status: '停用' }
]);

const selectedRows = ref<Record<string, unknown>[]>([]);

const columns = [
  { type: 'selection', width: 56 },
  { label: '姓名', prop: 'name', minWidth: 140 },
  { label: '状态', prop: 'status', minWidth: 120 }
];
</script>

<template>
  <el-space direction="vertical" fill>
    <el-button @click="tableRef?.clearSelection?.()">清空勾选</el-button>

    <ObTable
      ref="tableRef"
      row-key="id"
      :reserve-selection="true"
      :data="rows"
      :columns="columns"
      @selection-change="(rows) => (selectedRows = rows)"
    />
  </el-space>
</template>
```

### 2. 树形 + 懒加载

```vue
<script setup lang="ts">
import { ref } from 'vue';

interface TreeRow {
  id: string;
  parentId: string;
  name: string;
  hasChildren?: boolean;
  children?: TreeRow[];
}

const rows = ref<TreeRow[]>([
  { id: 'org-1', parentId: '0', name: '综合处', hasChildren: true },
  { id: 'org-2', parentId: '0', name: '督办处', hasChildren: true }
]);

const columns = [{ label: '组织名称', prop: 'name', minWidth: 220 }];

async function loadTreeNode(row: TreeRow) {
  // 替换为真实接口
  return Promise.resolve<TreeRow[]>([
    {
      id: `${row.id}-u-1`,
      parentId: row.id,
      name: `${row.name}-成员 A`,
      hasChildren: false
    }
  ]);
}

const treeConfig = {
  children: 'children',
  hasChildren: 'hasChildren',
  lazy: true,
  load: (row: TreeRow) => loadTreeNode(row)
};
</script>

<template>
  <ObTable row-key="id" :data="rows" :columns="columns" :tree-config="treeConfig" />
</template>
```

### 3. 插槽懒加载（重组件按需加载）

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const AsyncDetailCell = defineAsyncComponent(() => import('./cells/AsyncDetailCell.vue'));

const rows = [{ id: '1', name: '示例记录' }];
const columns = [
  { label: '名称', prop: 'name', minWidth: 180 },
  { label: '详情', slot: 'detail', minWidth: 260 }
];
</script>

<template>
  <ObTable :data="rows" :columns="columns">
    <template #detail="{ row }">
      <AsyncDetailCell :row-id="row.id" />
    </template>
  </ObTable>
</template>
```

### 4. 行拖拽排序（`row-drag-sort`）

```vue
<script setup lang="ts">
import { ref } from 'vue';

const rows = ref([
  { id: '1', name: '任务 1' },
  { id: '2', name: '任务 2' },
  { id: '3', name: '任务 3' }
]);

const columns = [
  { label: '', slot: 'drag', width: 48, align: 'center' },
  { label: '名称', prop: 'name', minWidth: 220 }
];

function onRowDragSort(payload: { rows: typeof rows.value }) {
  rows.value = payload.rows;
}
</script>

<template>
  <ObTable
    row-key="id"
    row-drag
    :row-drag-config="{ handle: '.drag-handle' }"
    :data="rows"
    :columns="columns"
    @row-drag-sort="onRowDragSort"
  >
    <template #drag>
      <span class="drag-handle">⋮⋮</span>
    </template>
  </ObTable>
</template>
```

> 注意：`rowDrag` 在树表模式下默认不启用（`treeConfig` 存在时会自动关闭）。
