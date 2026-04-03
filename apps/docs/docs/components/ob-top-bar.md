---
outline: [2, 3]
---

# ObTopBar

`ObTopBar` 是后台顶部栏组件，负责系统切换、用户菜单（个性设置/退出登录）和头部视觉样式。

> 定位：**架构壳层组件（一般不直接用于业务页面）**。

## Props / Emits / Slots / Expose

- Props：无
- Emits：无
- Slots：无
- Expose：无

## 行为说明

1. 组件依赖 `authStore/layoutStore/menuStore/systemStore` 与 `tagStore`。
2. 多系统场景下，按 `layoutStore.systemSwitchStyle` 自动切换“下拉式”或“菜单式”系统切换 UI。
3. 切换系统时会尝试跳转系统首页；若不可达则回退到当前菜单首个可访问叶子路由。
4. 退出登录会清理菜单、系统与标签页状态并跳回 `/login`。

## 示例

```vue
<template>
  <!-- 通常由布局组件统一挂载 -->
  <ObTopBar />
</template>
```
