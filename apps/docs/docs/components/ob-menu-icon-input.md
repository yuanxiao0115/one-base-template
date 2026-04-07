---
outline: [2, 3]
---

# ObMenuIconInput（菜单图标输入）

`ObMenuIconInput` 是菜单图标输入壳，支持直接输入图标值，也支持弹窗选择 Iconfont / Iconify 图标。

## Props

| 属性          | 类型      | 默认值                                        | 说明                                                    |
| ------------- | --------- | --------------------------------------------- | ------------------------------------------------------- |
| `modelValue`  | `string`  | 必填                                          | 图标值（支持 class / url / minio id / `ep:*` / `ri:*`） |
| `disabled`    | `boolean` | `false`                                       | 是否禁用                                                |
| `placeholder` | `string`  | `'支持 class / url / minio id / ep:* / ri:*'` | 输入框占位文案                                          |

## 行为说明

- 前缀会实时预览当前图标（复用 `ObMenuIcon` 渲染逻辑）。
- 点击尾部选择按钮会打开图标选择弹窗。
- 弹窗支持分类：
  - Iconfont：`CP / DJ / OM / OD`
  - Iconify：`EP / RI`
- Iconfont 候选元数据由 `packages/ui/src/assets/iconfont/*/iconfont.json` 内置提供，运行时不依赖应用层 `public/fonts/*/iconfont.json`。
- 选择后点击“应用图标”会写回 `modelValue`。

## 示例

```vue
<script setup lang="ts">
import { reactive } from 'vue';

const formModel = reactive({
  icon: ''
});
</script>

<template>
  <ObMenuIconInput
    v-model="formModel.icon"
    placeholder="支持 iconfont class、ep:*、ri:*、url 或 minio id"
  />
</template>
```
