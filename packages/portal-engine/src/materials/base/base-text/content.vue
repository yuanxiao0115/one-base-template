<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="文字内容">
        <el-form-item label="渲染方式">
          <el-radio-group v-model="sectionData.text.asHtml">
            <el-radio :value="false">普通文本</el-radio>
            <el-radio :value="true">HTML 文本</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="文本内容">
          <el-input
            v-model="sectionData.text.value"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 14 }"
            maxlength="5000"
            show-word-limit
            :placeholder="
              sectionData.text.asHtml
                ? '请输入 HTML，例如：<p><strong>公告：</strong>...</p>'
                : '请输入文本内容'
            "
          />
        </el-form-item>

        <div class="tip">提示：开启 HTML 文本时会按 HTML 渲染，请仅输入可信内容。</div>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ObCard } from '@one-base-template/ui';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import {
  UnifiedContainerContentConfig,
  createDefaultUnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';

interface BaseTextContentData {
  container: UnifiedContainerContentConfigModel;
  text: {
    value: string;
    asHtml: boolean;
  };
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseTextContentData>({
  name: 'base-text-content',
  sections: {
    container: {},
    text: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.text = {
  value: typeof sectionData.text?.value === 'string' ? sectionData.text.value : '',
  asHtml: sectionData.text?.asHtml === true
};

const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
if (!sectionData.container.title.trim()) {
  sectionData.container.title = '文字组件';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '支持普通文本和 HTML 文本';
}
if (!sectionData.container.externalLinkText.trim()) {
  sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
}

defineOptions({
  name: 'base-text-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip {
  font-size: 12px;
  color: #64748b;
}
</style>
