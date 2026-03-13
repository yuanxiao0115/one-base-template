<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="Iframe样式">
        <el-form-item label="高度(px)">
          <el-input-number v-model="sectionData.iframe.height" :min="160" :max="1800" controls-position="right" />
        </el-form-item>

        <el-form-item label="背景色">
          <PortalColorField v-model="sectionData.iframe.backgroundColor" show-alpha />
        </el-form-item>

        <PortalBorderField
          v-model="iframeBorderValue"
          :width-min="0"
          :width-max="20"
          :radius-max="100"
          :hide-color-width-when-none="false"
        />

        <el-form-item label="阴影">
          <el-input
            v-model.trim="sectionData.iframe.boxShadow"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            maxlength="120"
            show-word-limit
            placeholder="例如：0 12px 32px rgba(15, 23, 42, 0.12)"
          />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { ObCard } from '@one-base-template/ui';
  import { useSchemaConfig } from '../../../composables/useSchemaConfig';
  import PortalBorderField from '../../common/fields/PortalBorderField.vue';
  import PortalColorField from '../../common/fields/PortalColorField.vue';
  import { UnifiedContainerStyleConfig, mergeUnifiedContainerStyleConfig } from '../../common/unified-container';
  import type { UnifiedContainerStyleConfigModel } from '../../common/unified-container';

  type BorderStyleType = 'none' | 'solid' | 'dashed' | 'dotted';

  interface BaseIframeStyleData {
    container: UnifiedContainerStyleConfigModel;
    iframe: {
      height: number;
      backgroundColor: string;
      borderStyle: BorderStyleType;
      borderWidth: number;
      borderColor: string;
      borderRadius: number;
      boxShadow: string;
    };
  }

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  const { sectionData } = useSchemaConfig<BaseIframeStyleData>({
    name: 'base-iframe-container-style',
    sections: {
      container: {},
      iframe: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'style', newSchema);
    },
  });

  sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
  sectionData.iframe = {
    height: Number(sectionData.iframe?.height) > 0 ? Number(sectionData.iframe.height) : 460,
    backgroundColor: sectionData.iframe?.backgroundColor || '#ffffff',
    borderStyle: sectionData.iframe?.borderStyle || 'solid',
    borderWidth: Number.isFinite(Number(sectionData.iframe?.borderWidth)) ? Number(sectionData.iframe.borderWidth) : 1,
    borderColor: sectionData.iframe?.borderColor || '#e2e8f0',
    borderRadius: Number.isFinite(Number(sectionData.iframe?.borderRadius)) ? Number(sectionData.iframe.borderRadius) : 8,
    boxShadow: sectionData.iframe?.boxShadow || 'none',
  };

  const iframeBorderValue = computed({
    get: () => ({
      style: sectionData.iframe.borderStyle,
      color: sectionData.iframe.borderColor,
      width: Number(sectionData.iframe.borderWidth) || 0,
      radius: Number(sectionData.iframe.borderRadius) || 0,
    }),
    set: (value) => {
      sectionData.iframe.borderStyle = value.style as BorderStyleType;
      sectionData.iframe.borderColor = value.color;
      sectionData.iframe.borderWidth = Number(value.width) || 0;
      sectionData.iframe.borderRadius = Number(value.radius) || 0;
    },
  });

  defineOptions({
    name: 'base-iframe-container-style',
  });
</script>

<style scoped>
  .style-config {
    padding: 2px 0 8px;
  }
</style>
