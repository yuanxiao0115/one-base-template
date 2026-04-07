---
outline: [2, 3]
---

# ObCard（卡片）

`ObCard` 是轻量卡片容器，统一标题区与内容区样式。

## Props

| 属性    | 类型     | 默认值 | 说明                              |
| ------- | -------- | ------ | --------------------------------- |
| `title` | `string` | `''`   | 标题文案；也可由 `title` 插槽覆盖 |

## Slots

| 插槽名    | 说明   |
| --------- | ------ |
| `title`   | 标题区 |
| `default` | 内容区 |

## Emits / Expose

- 无自定义 emits
- 无 defineExpose API

## 示例

```vue
<template>
  <ObCard title="基础信息">
    <p>这里是内容区</p>
  </ObCard>

  <ObCard>
    <template #title>
      <span>自定义标题</span>
    </template>
    <p>自定义标题内容</p>
  </ObCard>
</template>
```
