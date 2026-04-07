---
outline: [2, 3]
---

# ObKeepAliveView（缓存视图）

`ObKeepAliveView` 是路由渲染容器：根据标签页状态自动维护 KeepAlive include 列表，并解决“组件名与路由名不一致”导致缓存失效的问题。

> 定位：**架构壳层组件（一般不直接用于业务页面）**。

## Props / Emits / Slots / Expose

- Props：无
- Emits：无
- Slots：无
- Expose：无

## 行为说明

1. 仅缓存 `tagStore.multiTags` 中 `meta.keepAlive === true` 的路由。
2. 使用 `route.name` 生成包装组件名，确保 `keep-alive :include` 稳定命中。
3. 非 keepAlive 路由直接渲染原组件，不进入缓存。

## 示例

```vue
<template>
  <!-- 通常位于主内容区路由出口 -->
  <ObKeepAliveView />
</template>
```
