---
outline: [2, 3]
---

# ObFontIcon（字体图标）

`ObFontIcon` 是字体图标统一封装，支持 `cp/dj/om` 三套图标库前缀与基类映射。

> 定位：基础能力组件，可在业务页面按需使用。

## Props

| 属性      | 类型                   | 默认值      | 说明                         |
| --------- | ---------------------- | ----------- | ---------------------------- |
| `name`    | `string`               | 必填        | 图标名（可传完整前缀或裸名） |
| `library` | `'cp' \| 'dj' \| 'om'` | `'cp'`      | 图标库                       |
| `size`    | `string \| number`     | `undefined` | 字号                         |
| `color`   | `string`               | `undefined` | 颜色                         |
| `tag`     | `string`               | `'i'`       | 渲染标签名                   |

## Emits / Slots / Expose

- Emits：无
- Slots：无
- Expose：无

## 示例

```vue
<template>
  <ObFontIcon name="home" library="cp" :size="16" color="#1677ff" />
  <ObFontIcon name="dj-icon-user" library="dj" tag="span" />
</template>
```
