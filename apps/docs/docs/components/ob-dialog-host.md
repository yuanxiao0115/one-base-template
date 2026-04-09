---
outline: [2, 3]
---

# ObDialogHost（弹层宿主）

`ObDialogHost` 是基于队列的弹层宿主组件，统一承载 `openDialog/closeDialog/closeAllDialogs` 打开的 `dialog/drawer`。

> 定位：业务高频组件。用于把“弹层状态管理”从页面中收口，页面只保留触发动作。

## Props / Emits / Slots / Expose

- Props：无
- Emits：无
- Slots：无
- Expose：无

## 配套 API

从 `@one-base-template/ui` 导入：

- `openDialog(options)`：打开弹层并返回 `id`
- `closeDialog(id, reason?)`：关闭指定弹层
- `closeAllDialogs(reason?)`：关闭全部弹层
- `DialogHostOpenOptions`：弹层配置类型

## 最小接入

```vue
<script setup lang="ts">
import { ObThemeSwitcher, closeDialog, openDialog } from '@one-base-template/ui';

const THEME_DIALOG_ID = 'topbar-theme-switcher';

function openThemeDialog() {
  openDialog({
    id: THEME_DIALOG_ID,
    title: '个性设置',
    container: 'drawer',
    size: 400,
    showFooter: false,
    component: ObThemeSwitcher
  });
}

function closeThemeDialog() {
  closeDialog(THEME_DIALOG_ID);
}
</script>

<template>
  <el-button @click="openThemeDialog">个性设置</el-button>
  <ObDialogHost />
</template>
```

## 行为约定

1. `id` 相同的弹层会覆盖旧实例，避免同一弹层重复打开。
2. `container='dialog'` 走 `el-dialog`，`container='drawer'` 走 `el-drawer`。
3. 关闭流程按 `beforeClose -> onClose -> onClosed` 顺序执行，支持异步钩子。
4. 当页面销毁时，建议调用 `closeDialog(id)` 或 `closeAllDialogs()` 做显式清理。
