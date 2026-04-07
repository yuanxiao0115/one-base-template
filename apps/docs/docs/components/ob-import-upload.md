---
outline: [2, 3]
---

# ObImportUpload（导入上传）

`ObImportUpload` 是导入上传封装组件，内置扩展名校验、大小校验、请求成功判定与统一消息反馈。

## Props

| 属性             | 类型                                                                     | 默认值                    | 说明               |
| ---------------- | ------------------------------------------------------------------------ | ------------------------- | ------------------ |
| `request`        | `(file: File) => Promise<unknown>`                                       | 必填                      | 上传请求函数       |
| `limit`          | `number`                                                                 | `1`                       | 最多上传数量       |
| `maxSizeMb`      | `number`                                                                 | `10`                      | 文件大小上限（MB） |
| `accept`         | `string`                                                                 | Excel MIME + `.xls/.xlsx` | 原生 accept        |
| `extensions`     | `string[]`                                                               | `['xls', 'xlsx']`         | 扩展名白名单       |
| `showFileList`   | `boolean`                                                                | `false`                   | 是否显示文件列表   |
| `disabled`       | `boolean`                                                                | `false`                   | 是否禁用           |
| `buttonText`     | `string`                                                                 | `'导入'`                  | 按钮文案           |
| `buttonType`     | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'default'` | `'default'`               | 按钮类型           |
| `buttonIcon`     | `Component`                                                              | `UploadIcon`              | 按钮图标           |
| `successCode`    | `number \| string`                                                       | `200`                     | 默认成功码         |
| `resolveSuccess` | `(response: unknown) => boolean`                                         | `undefined`               | 自定义成功判定     |
| `successMessage` | `string`                                                                 | `'导入成功'`              | 成功提示           |
| `errorMessage`   | `string`                                                                 | `''`                      | 失败兜底提示       |

## Emits

| 事件名     | 参数                  | 说明           |
| ---------- | --------------------- | -------------- |
| `uploaded` | `(response: unknown)` | 上传成功后触发 |
| `failed`   | `(error: Error)`      | 上传失败后触发 |

## Slots

| 插槽名    | 作用域        | 说明           |
| --------- | ------------- | -------------- |
| `default` | `{ loading }` | 自定义触发按钮 |

## Expose

| 方法/字段      | 说明                          |
| -------------- | ----------------------------- |
| `clearFiles()` | 清空已选文件                  |
| `upload()`     | 手动触发上传（调用 `submit`） |
| `loading`      | 当前上传状态 `Ref<boolean>`   |

## 示例

```vue
<script setup lang="ts">
async function uploadExcel(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  // 示例：替换成真实请求
  return { code: 200, message: 'ok' };
}
</script>

<template>
  <ObImportUpload
    :request="uploadExcel"
    :max-size-mb="20"
    :extensions="['xls', 'xlsx']"
    success-message="导入完成"
    @uploaded="() => {}"
    @failed="() => {}"
  />
</template>
```
