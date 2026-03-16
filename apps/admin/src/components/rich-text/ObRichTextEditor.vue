<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue';
import { useFormItem } from 'element-plus';
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import { Editor as WangEditor, Toolbar as WangToolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { message } from '@one-base-template/ui';

interface RichTextUploadPayload {
  file: File;
  type: 'image' | 'video';
}

type RichTextInsertFn = (url: string, alt: string, href: string) => void;

type RichTextUploadHandler = (payload: RichTextUploadPayload) => Promise<string>;

const props = withDefaults(
  defineProps<{
    readOnly?: boolean;
    minHeight?: number;
    placeholder?: string;
    upload?: RichTextUploadHandler;
  }>(),
  {
    readOnly: false,
    minHeight: 420,
    placeholder: '请输入内容'
  }
);

const model = defineModel<string>({
  default: ''
});

const { formItem } = useFormItem();

const editorRef = shallowRef<IDomEditor>();
const mode = 'default' as const;

const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ['fullScreen']
};

const editorStyle = computed(() => ({
  minHeight: `${props.minHeight}px`,
  maxHeight: '60vh',
  overflowY: 'auto',
  overflowX: 'hidden'
}));

const editorConfig = computed<Partial<IEditorConfig>>(() => ({
  placeholder: props.placeholder,
  readOnly: props.readOnly,
  MENU_CONF: {
    uploadImage: {
      customUpload: async (file: File, insertFn: RichTextInsertFn) => {
        await handleCustomUpload(file, insertFn, 'image');
      },
      base64LimitSize: 5 * 1024
    },
    uploadVideo: {
      customUpload: async (file: File, insertFn: RichTextInsertFn) => {
        await handleCustomUpload(file, insertFn, 'video');
      }
    }
  }
}));

function normalizeEditorHtml(html: string): string {
  const text = html
    .replace(/<[^<p>]+>/g, '')
    .replace(/<[</p>$]+>/g, '')
    .replace(/&nbsp;/gi, '')
    .replace(/<[^<br/>]+>/g, '')
    .trim();

  return text ? html : '';
}

async function handleCustomUpload(file: File, insertFn: RichTextInsertFn, type: 'image' | 'video') {
  if (!props.upload) {
    message.error('富文本未配置上传能力');
    return;
  }

  try {
    const url = await props.upload({ file, type });
    if (!url) {
      throw new Error('上传成功但未返回可用地址');
    }
    insertFn(url, file.name, url);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '上传失败';
    message.error(errorMessage);
  }
}

function handleCreated(editor: IDomEditor) {
  editorRef.value = editor;
}

function handleChange(editor: IDomEditor) {
  model.value = normalizeEditorHtml(editor.getHtml());
  formItem?.validate('change');
}

function handleBlur() {
  formItem?.validate('blur');
}

onBeforeUnmount(() => {
  editorRef.value?.destroy();
  editorRef.value = undefined;
});
</script>

<template>
  <div class="ob-rich-text-editor">
    <WangToolbar
      v-if="!props.readOnly"
      class="ob-rich-text-editor__toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <WangEditor
      v-model="model"
      class="ob-rich-text-editor__editor"
      :style="editorStyle"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
      @onBlur="handleBlur"
    />
  </div>
</template>

<style scoped>
.ob-rich-text-editor {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.ob-rich-text-editor__toolbar {
  border-bottom: 1px solid var(--el-border-color);
}

.ob-rich-text-editor__editor {
  width: 100%;
}
</style>

<style>
.w-e-text-placeholder {
  top: 10px !important;
  color: var(--el-text-color-secondary) !important;
  font-style: inherit !important;
}

.w-e-text-container,
.w-e-text-container p,
.w-e-text-container td,
.w-e-text-container th {
  word-wrap: break-word !important;
  word-break: break-word !important;
  overflow-wrap: break-word !important;
}

.w-e-text-container img,
.w-e-text-container video {
  max-width: 100% !important;
  height: auto !important;
}
</style>
