---
outline: [2, 3]
---

# ObPageContainer

`ObPageContainer` 是页面骨架容器，负责统一“页头 / 左栏 / 主内容 / 页脚”布局。

## Props

| 属性        | 类型                             | 默认值    | 说明                             |
| ----------- | -------------------------------- | --------- | -------------------------------- |
| `padding`   | `string`                         | `'0'`     | 主内容区内边距（作用于 `main`）  |
| `overflow`  | `'auto' \| 'scroll' \| 'hidden'` | `'auto'`  | 主内容区滚动策略                 |
| `leftWidth` | `string`                         | `'216px'` | 左栏宽度（有 `left` 插槽时生效） |

## Slots

| 插槽名    | 说明         |
| --------- | ------------ |
| `header`  | 页面头部区域 |
| `left`    | 左侧栏区域   |
| `default` | 主内容区域   |
| `footer`  | 页面底部区域 |

## 示例

```vue
<template>
  <ObPageContainer padding="16px" overflow="hidden" left-width="240px">
    <template #header>
      <h3>用户管理</h3>
    </template>

    <template #left>
      <ObTree :data="treeData" />
    </template>

    <ObTableBox title="用户列表">
      <template #default>
        <ObTable :data="rows" :columns="columns" />
      </template>
    </ObTableBox>

    <template #footer>
      <span>共 {{ rows.length }} 条</span>
    </template>
  </ObPageContainer>
</template>
```
