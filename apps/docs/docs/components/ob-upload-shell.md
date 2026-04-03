---
outline: [2, 3]
---

# ObUploadShell

`ObUploadShell` 是通用上传壳组件，基于 `el-upload` 封装统一校验、统一事件与可复用触发器。

## Props

| 属性              | 类型                                                  | 默认值       | 说明                                    |
| ----------------- | ----------------------------------------------------- | ------------ | --------------------------------------- |
| `fileList`        | `UploadUserFile[]`                                    | `[]`         | 双向绑定上传列表（`v-model:file-list`） |
| `request`         | `(options: UploadRequestOptions) => Promise<unknown>` | `undefined`  | 自定义上传请求函数                      |
| `action`          | `string`                                              | `''`         | 原生上传地址（未传 `request` 时可用）   |
| `name`            | `string`                                              | `'file'`     | 上传字段名                              |
| `accept`          | `string`                                              | `''`         | 可选文件类型                            |
| `limit`           | `number`                                              | `1`          | 文件数量限制                            |
| `multiple`        | `boolean`                                             | `false`      | 是否多选                                |
| `drag`            | `boolean`                                             | `false`      | 是否启用拖拽上传面板                    |
| `disabled`        | `boolean`                                             | `false`      | 是否禁用                                |
| `autoUpload`      | `boolean`                                             | `true`       | 是否自动上传                            |
| `showFileList`    | `boolean`                                             | `true`       | 是否展示文件列表                        |
| `listType`        | `'text' \| 'picture' \| 'picture-card'`               | `'text'`     | 列表样式                                |
| `withCredentials` | `boolean`                                             | `false`      | 是否携带 cookie                         |
| `headers`         | `Record<string, unknown>`                             | `undefined`  | 请求头                                  |
| `data`            | `Record<string, unknown>`                             | `undefined`  | 额外参数                                |
| `buttonText`      | `string`                                              | `'点击上传'` | 默认按钮文案                            |
| `buttonType`      | `ButtonType`                                          | `'default'`  | 默认按钮类型                            |
| `buttonIcon`      | `Component`                                           | `Upload`     | 默认按钮图标                            |
| `tip`             | `string`                                              | `''`         | 默认提示文案                            |
| `maxSizeMb`       | `number`                                              | `0`          | 文件大小上限（0 表示不限制）            |
| `extensions`      | `string[]`                                            | `[]`         | 扩展名白名单（如 `['png','jpg']`）      |
| `beforeUpload`    | `UploadProps['beforeUpload']`                         | `undefined`  | 额外上传前校验                          |

## Emits

| 事件名     | 参数                      | 说明     |
| ---------- | ------------------------- | -------- |
| `uploaded` | `(response, file, files)` | 上传成功 |
| `failed`   | `(error, file, files)`    | 上传失败 |
| `remove`   | `(file, files)`           | 删除文件 |
| `change`   | `(file, files)`           | 文件变化 |
| `preview`  | `(file)`                  | 预览文件 |
| `exceed`   | `(files, filesList)`      | 超出限制 |

## Slots

| 插槽      | 作用域        | 说明               |
| --------- | ------------- | ------------------ |
| `default` | `{ loading }` | 自定义上传触发器   |
| `tip`     | -             | 自定义提示文案区域 |

## Expose

| 方法                   | 说明         |
| ---------------------- | ------------ |
| `submit()`             | 手动触发上传 |
| `clearFiles()`         | 清空列表     |
| `abort(file?)`         | 中断上传     |
| `handleStart(rawFile)` | 手动触发开始 |
| `handleRemove(file)`   | 手动移除     |
| `loading`              | 上传中状态   |

## 示例

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { UploadRequestOptions, UploadUserFile } from 'element-plus';

const files = ref<UploadUserFile[]>([]);

async function uploadRequest(options: UploadRequestOptions) {
  const formData = new FormData();
  formData.append('file', options.file);
  // 替换为真实上传请求
  return Promise.resolve({ code: 200, url: 'https://cdn.example.com/a.png' });
}
</script>

<template>
  <ObUploadShell
    v-model:file-list="files"
    :request="uploadRequest"
    :max-size-mb="20"
    :extensions="['png', 'jpg', 'jpeg']"
    tip="仅支持 png/jpg/jpeg，大小不超过 20MB"
  />
</template>
```
