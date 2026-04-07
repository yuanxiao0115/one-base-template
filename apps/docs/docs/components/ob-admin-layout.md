---
outline: [2, 3]
---

# ObAdminLayout（后台布局壳）

`ObAdminLayout` 是后台应用入口布局壳组件，会根据 `layoutStore.mode` 在侧栏布局与顶部布局间切换。

> 定位：**架构壳层组件（一般不直接用于业务页面）**。

## Props / Emits / Slots / Expose

- Props：无
- Emits：无
- Slots：无
- Expose：无

## 行为说明

1. 当 `layoutStore.mode === 'top'` 时渲染顶部布局（`TopLayout`）。
2. 其他情况默认渲染侧栏布局（`SideLayout`）。
3. 组件自身不处理业务逻辑，只负责布局模式分发。

## 示例

```vue
<template>
  <!-- 通常放在应用壳层入口，不直接放业务模块页面 -->
  <ObAdminLayout />
</template>
```
