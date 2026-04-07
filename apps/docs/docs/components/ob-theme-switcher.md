---
outline: [2, 3]
---

# ObThemeSwitcher（主题切换器）

`ObThemeSwitcher` 是主题设置面板组件，提供预设主题切换、自定义主色与灰色模式开关。

> 定位：基础能力组件，通常由顶栏“个性设置”入口触发，不直接用于业务页。

## Props / Emits / Slots / Expose

- Props：无
- Emits：无
- Slots：无
- Expose：无

## 行为说明

1. 依赖 `themeStore` 提供主题集合、当前主题与灰度状态。
2. 切换预设主题时会将 `themeMode` 收敛到 `preset`。
3. 支持在开启 `allowCustomPrimary` 时微调主色，并可一键恢复预设。
4. 所有写入行为带异常保护，失败时通过 `ElMessage.error` 提示。

## 示例

```vue
<template>
  <ObThemeSwitcher />
</template>
```
