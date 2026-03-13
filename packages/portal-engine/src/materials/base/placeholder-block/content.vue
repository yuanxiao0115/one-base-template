<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top" class="content-form">
      <ObCard title="HTML 内容">
        <el-form-item label="HTML 内容">
          <el-input
            v-model="sectionData.block.html"
            type="textarea"
            :autosize="{ minRows: 8, maxRows: 16 }"
            placeholder="可输入 HTML，例如：<h3>标题</h3><p>正文</p>"
          />
        </el-form-item>

        <div class="content-tip">提示：这里会按 HTML 渲染，请仅填写可信内容。</div>
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
    mergeUnifiedContainerContentConfig,
  } from '../../common/unified-container';
  import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  interface BlockContentData {
    container: UnifiedContainerContentConfigModel;
    block: {
      html: string;
    };
  }

  const { sectionData } = useSchemaConfig<BlockContentData>({
    name: 'base-placeholder-block-content',
    sections: {
      container: {},
      block: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'content', newSchema);
    },
  });

  sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
  sectionData.block = {
    html: typeof sectionData.block?.html === 'string' ? sectionData.block.html : '',
  };

  const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
  if (!sectionData.container.title.trim()) {
    sectionData.container.title = 'HTML模块';
  }
  if (!sectionData.container.subtitle.trim()) {
    sectionData.container.subtitle = '支持在属性面板输入 HTML 内容';
  }
  if (sectionData.container.externalLinkText.trim().length === 0) {
    sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
  }

  defineOptions({
    name: 'base-placeholder-block-content',
  });
</script>

<style scoped>
  .content-config {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .content-form {
    margin-top: 2px;
  }

  .content-tip {
    font-size: 12px;
    color: #64748b;
  }
</style>
