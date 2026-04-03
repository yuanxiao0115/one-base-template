---
outline: [2, 3]
---

# ObCardTable

`ObCardTable` 以卡片网格方式展示数据，内置分页和空态。

## Props

| 属性               | 类型                               | 默认值       | 说明               |
| ------------------ | ---------------------------------- | ------------ | ------------------ |
| `data`             | `Record<string, unknown>[]`        | `[]`         | 卡片数据           |
| `loading`          | `boolean`                          | `false`      | 加载态             |
| `pagination`       | `TablePagination \| null \| false` | `null`       | 分页配置           |
| `paginationSmall`  | `boolean`                          | `undefined`  | 强制分页尺寸       |
| `pageSizes`        | `number[]`                         | `undefined`  | 覆盖分页 size 选项 |
| `emptyDescription` | `string`                           | `'暂无数据'` | 空态说明           |
| `minCardWidth`     | `string`                           | `'210px'`    | 最小卡片宽度       |
| `gap`              | `string`                           | `'14px'`     | 卡片间距           |

## Emits

| 事件名                | 参数             | 说明         |
| --------------------- | ---------------- | ------------ |
| `page-current-change` | `(page: number)` | 当前页变化   |
| `page-size-change`    | `(size: number)` | 每页条数变化 |

## Slots

| 插槽名    | 作用域           | 说明         |
| --------- | ---------------- | ------------ |
| `toolbar` | `-`              | 顶部工具区   |
| `default` | `{ row, index }` | 卡片内容渲染 |

## 示例

```vue
<script setup lang="ts">
import { ref } from 'vue';

const rows = ref([
  { id: 1, title: '通知 A' },
  { id: 2, title: '通知 B' }
]);
const pagination = ref({ total: 2, currentPage: 1, pageSize: 12, pageSizes: [12, 24, 48] });
</script>

<template>
  <ObCardTable
    :data="rows"
    :pagination="pagination"
    min-card-width="240px"
    @page-current-change="(page) => (pagination.currentPage = page)"
    @page-size-change="(size) => (pagination.pageSize = size)"
  >
    <template #toolbar>
      <el-button type="primary">新建卡片</el-button>
    </template>

    <template #default="{ row }">
      <ObCard :title="String(row.title)"> 卡片内容 </ObCard>
    </template>
  </ObCardTable>
</template>
```
