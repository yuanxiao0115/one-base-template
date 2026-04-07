---
outline: [2, 3]
---

# ObTableBox（表格工具容器）

`ObTableBox` 是列表页工具栏与内容区容器，内置关键字搜索、已选数量区和高级筛选抽屉。

## Props

| 属性              | 类型                              | 默认值               | 说明                                         |
| ----------------- | --------------------------------- | -------------------- | -------------------------------------------- |
| `title`           | `string`                          | `'列表'`             | 标题                                         |
| `tableRef`        | `Record<string, unknown> \| null` | `null`               | 预留表格引用（当前内部未直接使用）           |
| `columns`         | `TableColumnList`                 | `[]`                 | 列配置，会以 `dynamicColumns` 透出给默认插槽 |
| `placeholder`     | `string`                          | `'请输入关键字搜索'` | 快速搜索输入框占位文案                       |
| `selectedNum`     | `number`                          | `0`                  | 已选条数（>0 时显示“已选 x 项”）             |
| `showQuickSearch` | `boolean`                         | `true`               | 是否显示快速搜索输入框                       |
| `showSearchBar`   | `boolean`                         | `true`               | 是否显示搜索区域                             |
| `keyword`         | `string`                          | `''`                 | 受控关键字                                   |
| `maxlength`       | `number`                          | `30`                 | 关键字输入最大长度                           |

## Emits

| 事件名            | 参数                | 说明                           |
| ----------------- | ------------------- | ------------------------------ |
| `update:keyword`  | `(keyword: string)` | 输入变化时触发                 |
| `search`          | `(keyword: string)` | 回车、点击筛选确定、清空时触发 |
| `selectionCancel` | `()`                | 点击“取消选择”触发             |
| `resetForm`       | `()`                | 高级筛选抽屉中点击“重置”触发   |

## Slots

| 插槽名       | 作用域                     | 说明                           |
| ------------ | -------------------------- | ------------------------------ |
| `title`      | `-`                        | 自定义标题                     |
| `searchForm` | `-`                        | 自定义搜索表单（显示在搜索区） |
| `buttons`    | `-`                        | 工具栏右侧按钮区               |
| `default`    | `{ size, dynamicColumns }` | 内容区（通常放 `ObTable`）     |
| `drawer`     | `-`                        | 高级筛选抽屉内容               |

## 示例

```vue
<script setup lang="ts">
import { ref } from 'vue';

const keyword = ref('');
const selectedNum = ref(0);
const rows = ref([{ id: 1, name: '张三' }]);

const columns = [
  { type: 'selection', width: 56 },
  { label: '姓名', prop: 'name' }
];
</script>

<template>
  <ObTableBox
    title="用户列表"
    :columns="columns"
    :keyword="keyword"
    :selected-num="selectedNum"
    @update:keyword="keyword = $event"
    @search="() => {}"
    @selection-cancel="selectedNum = 0"
  >
    <template #buttons>
      <el-button type="primary">新增</el-button>
    </template>

    <template #default="{ size, dynamicColumns }">
      <ObTable :size="size" :columns="dynamicColumns" :data="rows" />
    </template>

    <template #drawer>
      <el-form label-position="top">
        <el-form-item label="状态"><el-select /></el-form-item>
      </el-form>
    </template>
  </ObTableBox>
</template>
```
