---
outline: [2, 3]
---

# ObTree

`ObTree` 是 `el-tree` 的轻封装，统一默认字段名并提供常用实例方法。

## Props

| 属性                | 类型                                        | 默认值                                     | 说明             |
| ------------------- | ------------------------------------------- | ------------------------------------------ | ---------------- |
| `data`              | `Record<string, unknown>[]`                 | `[]`                                       | 树数据           |
| `treeProps`         | `{ label?; children?; disabled?; isLeaf? }` | `{ label: 'label', children: 'children' }` | 字段映射配置     |
| `nodeKey`           | `string`                                    | `'id'`                                     | 节点唯一键       |
| `currentNodeKey`    | `string \| number`                          | `undefined`                                | 当前选中节点 key |
| `highlightCurrent`  | `boolean`                                   | `false`                                    | 是否高亮当前节点 |
| `defaultExpandAll`  | `boolean`                                   | `false`                                    | 是否默认展开全部 |
| `expandOnClickNode` | `boolean`                                   | `true`                                     | 点击节点是否展开 |
| `emptyText`         | `string`                                    | `'暂无数据'`                               | 空态文案         |

> 额外 `attrs` 会透传到 `el-tree`（组件设置了 `inheritAttrs: false` 并手动 `v-bind="attrs"`）。

## Emits

| 事件名       | 参数                             | 说明         |
| ------------ | -------------------------------- | ------------ |
| `node-click` | `(data, node, component, event)` | 节点点击事件 |

## Slots

| 插槽名    | 作用域           | 说明                                             |
| --------- | ---------------- | ------------------------------------------------ |
| `default` | `{ node, data }` | 自定义节点内容；未提供时显示内置 `TreeNodeLabel` |

## Expose

| 方法                                             | 说明                 |
| ------------------------------------------------ | -------------------- |
| `setCurrentKey(key?, shouldAutoExpandParent?)`   | 按 key 设置当前节点  |
| `setCurrentNode(node?, shouldAutoExpandParent?)` | 按 node 设置当前节点 |
| `getCurrentKey()`                                | 获取当前 key         |
| `getCurrentNode()`                               | 获取当前 node        |
| `filter(keyword)`                                | 触发树过滤           |

## 示例

```vue
<script setup lang="ts">
import { ref } from 'vue';

const treeRef = ref();
const data = [
  { id: 1, label: '组织 A', children: [{ id: 11, label: '部门 A-1' }] },
  { id: 2, label: '组织 B' }
];
</script>

<template>
  <ObTree ref="treeRef" :data="data" highlight-current @node-click="() => {}" />
</template>
```
