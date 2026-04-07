---
outline: [2, 3]
---

# ObCommandPalette（菜单搜索面板）

`ObCommandPalette` 是后台顶栏的全局菜单搜索组件，支持快捷键唤起（`Ctrl/Cmd + K`）、关键字过滤、最近访问历史与回车快速跳转。

## Props

| 属性              | 类型            | 默认值                                  | 说明                                      |
| ----------------- | --------------- | --------------------------------------- | ----------------------------------------- |
| `modelValue`      | `boolean`       | `false`                                 | 是否显示弹层（支持 `v-model`）            |
| `menuItems`       | `AppMenuItem[]` | `[]`                                    | 当前系统菜单树                            |
| `includeExternal` | `boolean`       | `false`                                 | 是否包含外链菜单                          |
| `excludePaths`    | `string[]`      | `[]`                                    | 排除路径                                  |
| `placeholder`     | `string`        | `输入菜单名称或路径，按 Enter 快速跳转` | 输入框占位                                |
| `dialogTitle`     | `string`        | `菜单搜索`                              | 弹层标题                                  |
| `historyKeyBase`  | `string`        | `ob_command_palette_history`            | 历史缓存 key（组件内部会自动 namespaced） |
| `maxHistory`      | `number`        | `8`                                     | 历史条数上限                              |
| `suggestionLimit` | `number`        | `24`                                    | 默认建议列表上限                          |
| `shortcut`        | `boolean`       | `true`                                  | 是否启用 `Ctrl/Cmd + K`                   |
| `showTrigger`     | `boolean`       | `true`                                  | 是否显示触发按钮                          |
| `triggerText`     | `string`        | `菜单搜索`                              | 触发按钮文案                              |

## Emits

| 事件名              | 参数                         | 说明                 |
| ------------------- | ---------------------------- | -------------------- |
| `update:modelValue` | `(visible: boolean)`         | 弹层显隐同步         |
| `navigate`          | `({ path, external, item })` | 选择菜单后的跳转事件 |
| `open`              | -                            | 弹层打开             |
| `close`             | -                            | 弹层关闭             |
| `search`            | `(keyword: string)`          | 搜索词变化           |

## 示例

```vue
<script setup lang="ts">
import { useMenuStore } from '@one-base-template/core';
import { useRoute, useRouter } from 'vue-router';

const menuStore = useMenuStore();
const router = useRouter();
const route = useRoute();

async function onNavigate(payload: { path: string; external: boolean }) {
  if (payload.external) {
    window.open(payload.path, '_blank', 'noopener');
    return;
  }
  if (payload.path && payload.path !== route.path) {
    await router.replace(payload.path);
  }
}
</script>

<template>
  <ObCommandPalette
    :menu-items="menuStore.menus"
    history-key-base="ob_admin_command_palette"
    @navigate="onNavigate"
  />
</template>
```

## 相关导出

从 `@one-base-template/ui` 可直接导出：

- `CommandPalette`
- `buildCommandPaletteItemsFromMenus`
- `filterCommandPaletteItems`
- `normalizeCommandPaletteKeyword`
- `useCommandPalette`
