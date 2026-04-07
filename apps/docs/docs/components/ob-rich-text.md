---
outline: [2, 3]
---

# ObRichText（富文本编辑器）

`ObRichText` 是基于 `wangEditor` 的富文本组件，内置上传接入点、内容净化与简版工具栏配置。

## Props

| 属性             | 类型                                           | 默认值         | 说明                                              |
| ---------------- | ---------------------------------------------- | -------------- | ------------------------------------------------- |
| `modelValue`     | `string`                                       | `''`           | 双向绑定 HTML 内容                                |
| `readOnly`       | `boolean`                                      | `false`        | 只读模式                                          |
| `minHeight`      | `number`                                       | `420`          | 编辑区最小高度                                    |
| `placeholder`    | `string`                                       | `'请输入内容'` | 占位文本                                          |
| `upload`         | `(payload: { file; type }) => Promise<string>` | `undefined`    | 自定义上传函数（返回可访问 URL）                  |
| `profile`        | `'full' \| 'simple'`                           | `'full'`       | 工具栏档位（`simple` 会隐藏视频、表格、代码块等） |
| `sanitize`       | `boolean`                                      | `true`         | 写入模型前是否做净化                              |
| `imageMaxSizeMb` | `number`                                       | `10`           | 图片上传体积上限                                  |
| `videoMaxSizeMb` | `number`                                       | `200`          | 视频上传体积上限                                  |

## 上传回调约定

```ts
type RichTextUploadHandler = (payload: { file: File; type: 'image' | 'video' }) => Promise<string>;
```

- 返回值必须是可访问的资源 URL。
- 组件会做基础体积与 MIME 检查，不合规时直接提示并中断上传。

## 工具函数（`@one-base-template/ui`）

| 方法                                     | 说明                              |
| ---------------------------------------- | --------------------------------- |
| `sanitizeRichTextHtml(html)`             | 调用 core 的 HTML 安全净化        |
| `normalizeRichTextHtml(html)`            | 将仅占位的“空富文本”归一为 `''`   |
| `toSafeRichTextHtml(html)`               | 先净化再归一化（推荐渲染前使用）  |
| `getRichTextToolbarExcludeKeys(profile)` | 获取工具栏排除项（`full/simple`） |

## 示例

### 1. 表单中使用

```vue
<script setup lang="ts">
import { reactive } from 'vue';

const formModel = reactive({
  content: ''
});

async function uploadToServer(payload: { file: File; type: 'image' | 'video' }) {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('type', payload.type);
  // 替换为真实上传接口
  return Promise.resolve('https://cdn.example.com/demo/file.png');
}
</script>

<template>
  <ObRichText
    v-model="formModel.content"
    placeholder="请输入正文内容"
    profile="full"
    :upload="uploadToServer"
  />
</template>
```

### 2. 只读渲染 + 安全输出

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { toSafeRichTextHtml } from '@one-base-template/ui';

const html = '<p>示例内容</p>';
const safeHtml = computed(() => toSafeRichTextHtml(html));
</script>

<template>
  <div v-html="safeHtml" />
</template>
```
