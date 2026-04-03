---
outline: [2, 3]
---

# ObFilePreview

`ObFilePreview` 是统一文件在线预览组件，面向“已上传文件”的前端直渲染场景，支持 `URL` 与 `File` 两类输入，并提供嵌入式预览、全屏弹窗和下载能力。

## 适用范围

- 后台业务页内的附件在线查看（合同、方案、台账、图片等）。
- 已有文件 URL（对象存储、文件服务）或本地 `File` 的二次预览。
- 需要统一“支持格式识别 + 不支持降级 + 下载兜底”的页面。

## 前置条件

1. 应用已注册 `OneUiObTablePlugin`（全局可直接使用 `ObFilePreview`）。
2. 预览 URL 可被浏览器直接访问（鉴权、CORS、跨域头已正确配置）。
3. OFD 预览依赖运行时资源可正常加载（`ofdview-vue3 + parser_x.js`）。

## Props

| 属性             | 类型                                | 默认值      | 说明                     |
| ---------------- | ----------------------------------- | ----------- | ------------------------ |
| `source`         | `{ url: string } \| { file: File }` | -           | 必填，二选一             |
| `fileName`       | `string`                            | `''`        | 可选，优先于自动推断名称 |
| `mimeType`       | `string`                            | `''`        | 可选，优先参与格式识别   |
| `height`         | `number \| string`                  | `520`       | 嵌入式预览区域高度       |
| `fullscreenable` | `boolean`                           | `true`      | 是否显示全屏按钮与弹窗   |
| `downloadable`   | `boolean`                           | `true`      | 是否显示下载按钮         |
| `fit`            | `'contain' \| 'cover'`              | `'contain'` | 图片预览填充模式         |

## Emits

| 事件名        | 参数                                | 说明                       |
| ------------- | ----------------------------------- | -------------------------- |
| `ready`       | `{ engine; fileName; sourceType }`  | 当前引擎渲染完成           |
| `error`       | `{ engine; fileName; error }`       | 预览引擎渲染失败           |
| `unsupported` | `{ fileName; extension; mimeType }` | 不支持该格式，已进入降级态 |

### `ready` 事件载荷

```ts
{
  engine: 'pdf' | 'office-docx' | 'office-excel' | 'office-pptx' | 'ofd' | 'image' | 'unsupported';
  fileName: string;
  sourceType: 'url' | 'file';
}
```

### `error` 事件载荷

```ts
{
  engine: 'pdf' | 'office-docx' | 'office-excel' | 'office-pptx' | 'ofd' | 'image' | 'unsupported';
  fileName: string;
  error: unknown;
}
```

## Slots

当前版本不提供自定义插槽。

## Expose

当前版本不暴露实例方法。

## 支持格式与引擎路由

| 格式                            | 路由引擎                     | 说明                           |
| ------------------------------- | ---------------------------- | ------------------------------ |
| `pdf`                           | `@vue-office/pdf`            | PDF 文档预览                   |
| `doc/docx`                      | `@vue-office/docx`           | Word 预览                      |
| `xls/xlsx`                      | `@vue-office/excel`          | Excel 预览                     |
| `ppt/pptx`                      | `@vue-office/pptx`           | PPT 预览                       |
| `ofd`                           | `ofdview-vue3 + parser_x.js` | OFD 预览                       |
| `png/jpg/jpeg/gif/bmp/webp/svg` | 图片引擎                     | 图片直显                       |
| 其他                            | `unsupported`                | 显示“不支持在线预览”并保留下载 |

识别优先级：

1. 先看 `mimeType`（若传入）。
2. 再看文件扩展名（URL / FileName / File）。
3. 均无法识别则进入 `unsupported`。

## 示例

### 1. URL 预览（推荐）

```vue
<script setup lang="ts">
function handleReady(payload: { engine: string; fileName: string }) {
  console.log('预览完成', payload.engine, payload.fileName);
}

function handleUnsupported(payload: { fileName: string; extension: string }) {
  console.warn('不支持在线预览，建议下载查看', payload.fileName, payload.extension);
}
</script>

<template>
  <ObFilePreview
    :source="{ url: 'https://example.com/files/方案.docx' }"
    file-name="方案.docx"
    :height="560"
    :fullscreenable="true"
    :downloadable="true"
    @ready="handleReady"
    @unsupported="handleUnsupported"
  />
</template>
```

### 2. 本地 File 预览

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';

const currentFile = ref<File | null>(null);
const previewSource = computed(() => (currentFile.value ? { file: currentFile.value } : null));

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  currentFile.value = input.files?.[0] ?? null;
}
</script>

<template>
  <input type="file" @change="onFileChange" />

  <ObFilePreview v-if="previewSource" :source="previewSource" :fullscreenable="false" />
</template>
```

## 风险与限制

1. `doc/docx/xls/xlsx/ppt/pptx` 属于前端解析渲染，大文件会增加首屏等待与内存占用。
2. URL 若不可匿名访问，需保证鉴权态在浏览器侧可用，否则会触发 `error`。
3. 部分 OFD 文件可能存在样式兼容差异，建议在业务侧监听 `error/unsupported` 做下载兜底提示。

## 排障建议

1. **页面空白**：先看是否触发 `error`，再检查 URL 可访问性与跨域响应头。
2. **格式识别不正确**：显式传入 `mimeType` 或 `fileName` 覆盖自动推断。
3. **仅想下载不想预览**：可直接隐藏组件，或将 `fullscreenable/downloadable` 按业务需求关闭。
