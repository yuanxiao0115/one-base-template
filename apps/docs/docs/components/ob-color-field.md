---
outline: [2, 3]
---

# ObColorField

`ObColorField` 组合了颜色选择器与文本输入框，支持透明色快捷设置和颜色格式规范化。

## Props

| 属性          | 类型      | 默认值      | 说明                                                                |
| ------------- | --------- | ----------- | ------------------------------------------------------------------- |
| `modelValue`  | `string`  | `''`        | 颜色值（支持 `#RGB/#RRGGBB/#RRGGBBAA`、`rgba(...)`、`transparent`） |
| `showAlpha`   | `boolean` | `false`     | 是否支持透明度                                                      |
| `placeholder` | `string`  | `'#FFFFFF'` | 输入框占位                                                          |

## Emits

| 事件名              | 参数              | 说明       |
| ------------------- | ----------------- | ---------- |
| `update:modelValue` | `(value: string)` | 颜色值变更 |

## 行为说明

1. 输入裸十六进制（如 `fff`/`ffffff`）会在失焦后规范为带 `#` 的大写格式。
2. `rgba(..., 0)` 或点击“透明”会收敛为 `transparent`。
3. `showAlpha = false` 时，透明选择会退化到不带透明度的可见色值。

## 示例

```vue
<script setup lang="ts">
import { ref } from 'vue';

const color = ref('#1677FF');
</script>

<template>
  <ObColorField v-model="color" :show-alpha="true" placeholder="#1677FF" />
</template>
```
