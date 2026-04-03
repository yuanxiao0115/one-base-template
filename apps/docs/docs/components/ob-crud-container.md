---
outline: [2, 3]
---

# ObCrudContainer

`ObCrudContainer` 统一新增/编辑/详情容器，可在 `dialog` 与 `drawer` 间切换。

## Props

| 属性                | 类型                             | 默认值       | 说明                                          |
| ------------------- | -------------------------------- | ------------ | --------------------------------------------- |
| `modelValue`        | `boolean`                        | 必填         | 可见状态（`v-model`）                         |
| `mode`              | `'create' \| 'edit' \| 'detail'` | `'create'`   | 业务模式                                      |
| `container`         | `'dialog' \| 'drawer'`           | `undefined`  | 容器类型；未传时走全局配置（默认 `drawer`）   |
| `title`             | `string`                         | `''`         | 标题                                          |
| `loading`           | `boolean`                        | `false`      | 确认按钮加载态（`detail` 模式不展示 loading） |
| `showFooter`        | `boolean`                        | `true`       | 是否显示底部操作区                            |
| `showCancelButton`  | `boolean`                        | `true`       | 是否显示取消按钮                              |
| `showConfirmButton` | `boolean`                        | `true`       | 是否显示确认按钮                              |
| `cancelText`        | `string`                         | `'取消'`     | 取消文案                                      |
| `confirmText`       | `string`                         | `'确定'`     | 新增/编辑确认文案                             |
| `detailConfirmText` | `string`                         | `'我知道了'` | 详情模式确认文案                              |
| `dialogWidth`       | `string \| number`               | `760`        | Dialog 宽度                                   |
| `dialogFullscreen`  | `boolean`                        | `false`      | Dialog 全屏                                   |
| `drawerSize`        | `string \| number`               | `400`        | Drawer 宽度                                   |
| `drawerColumns`     | `1 \| 2`                         | `1`          | Drawer 表单列数                               |
| `appendToBody`      | `boolean`                        | `true`       | 是否挂载到 body                               |
| `destroyOnClose`    | `boolean`                        | `true`       | 关闭后销毁内容                                |
| `closeOnClickModal` | `boolean`                        | `false`      | 点击遮罩关闭                                  |

## Emits

| 事件名              | 参数               | 说明                       |
| ------------------- | ------------------ | -------------------------- |
| `update:modelValue` | `(value: boolean)` | 同步显示状态               |
| `close`             | `-`                | 容器关闭时触发             |
| `cancel`            | `-`                | 点击取消时触发（随后关闭） |
| `confirm`           | `-`                | 点击确认时触发             |

## Slots

| 插槽名    | 作用域                              | 说明                                 |
| --------- | ----------------------------------- | ------------------------------------ |
| `default` | `-`                                 | 新增/编辑主体内容                    |
| `detail`  | `-`                                 | 详情模式专用内容（有则覆盖 default） |
| `footer`  | `{ mode, loading, close, confirm }` | 自定义底部操作区                     |

## 示例

```vue
<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const saving = ref(false);

function onConfirm() {
  saving.value = true;
  setTimeout(() => {
    saving.value = false;
    visible.value = false;
  }, 600);
}
</script>

<template>
  <el-button type="primary" @click="visible = true">新增</el-button>

  <ObCrudContainer
    v-model="visible"
    mode="create"
    container="drawer"
    title="新增用户"
    :loading="saving"
    :drawer-columns="2"
    @confirm="onConfirm"
  >
    <el-form label-position="top">
      <el-form-item label="姓名"><el-input /></el-form-item>
      <el-form-item label="手机号"><el-input /></el-form-item>
    </el-form>
  </ObCrudContainer>
</template>
```
