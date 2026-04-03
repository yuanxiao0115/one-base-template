---
outline: [2, 3]
---

# ObSidebarMenu

`ObSidebarMenu` 是侧边菜单组件，默认消费 `menuStore.menus`，并根据当前路由自动展开父级菜单。

> 定位：**架构壳层组件（一般不直接用于业务页面）**。

## Props

| 属性        | 类型            | 默认值      | 说明                                         |
| ----------- | --------------- | ----------- | -------------------------------------------- |
| `menus`     | `AppMenuItem[]` | `undefined` | 外部传入菜单；未传时回退到 `menuStore.menus` |
| `collapsed` | `boolean`       | `false`     | 是否折叠侧栏                                 |

## Emits / Slots / Expose

- Emits：无
- Slots：无
- Expose：无

## 行为说明

1. 激活路径优先取 `route.meta.activePath`，否则使用当前 `route.path`。
2. 点击外链菜单（`item.external`）会在新窗口打开。
3. 点击内部菜单会执行 `router.push(index)`。
4. 自动计算 `default-openeds`，保证刷新后父菜单保持展开。

## 示例

```vue
<script setup lang="ts">
import { ref } from 'vue';

const collapsed = ref(false);
</script>

<template>
  <ObSidebarMenu :collapsed="collapsed" />
</template>
```
