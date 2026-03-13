<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="HTML 区域样式">
        <el-form-item label="最小高度(px)">
          <el-input-number v-model="sectionData.block.minHeight" :min="80" :max="1200" />
        </el-form-item>

        <el-form-item label="内边距(px)">
          <el-input-number v-model="sectionData.block.padding" :min="0" :max="120" />
        </el-form-item>

        <el-form-item label="背景色">
          <PortalColorField v-model="sectionData.block.backgroundColor" show-alpha />
        </el-form-item>

        <el-form-item label="文字颜色">
          <PortalColorField v-model="sectionData.block.textColor" show-alpha />
        </el-form-item>

        <PortalBorderField
          v-model="blockBorderValue"
          :style-options="blockBorderStyleOptions"
          :width-min="0"
          :width-max="20"
          :radius-max="60"
          :hide-color-width-when-none="false"
        />

        <el-form-item label="字体大小(px)">
          <el-input-number v-model="sectionData.block.fontSize" :min="12" :max="40" />
        </el-form-item>

        <el-form-item label="行高">
          <el-input-number v-model="sectionData.block.lineHeight" :min="1" :max="3" :step="0.1" :precision="1" />
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

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  interface BlockStyleData {
    container: UnifiedContainerStyleConfigModel;
    block: {
      minHeight: number;
      padding: number;
      backgroundColor: string;
      textColor: string;
      borderWidth: number;
      borderStyle: 'solid' | 'dashed' | 'dotted';
      borderColor: string;
      borderRadius: number;
      fontSize: number;
      lineHeight: number;
    };
  }

  const blockBorderStyleOptions = [
    { label: '实线', value: 'solid' },
    { label: '虚线', value: 'dashed' },
    { label: '点线', value: 'dotted' },
  ];

  const { sectionData } = useSchemaConfig<BlockStyleData>({
    name: 'base-placeholder-block-style',
    sections: {
      container: {},
      block: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'style', newSchema);
    },
  });

  sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
  sectionData.block = {
    minHeight: Number.isFinite(Number(sectionData.block?.minHeight)) ? Number(sectionData.block.minHeight) : 180,
    padding: Number.isFinite(Number(sectionData.block?.padding)) ? Number(sectionData.block.padding) : 0,
    backgroundColor: sectionData.block?.backgroundColor || 'transparent',
    textColor: sectionData.block?.textColor || '#0f172a',
    borderWidth: Number.isFinite(Number(sectionData.block?.borderWidth)) ? Number(sectionData.block.borderWidth) : 0,
    borderStyle: sectionData.block?.borderStyle || 'solid',
    borderColor: sectionData.block?.borderColor || 'transparent',
    borderRadius: Number.isFinite(Number(sectionData.block?.borderRadius)) ? Number(sectionData.block.borderRadius) : 0,
    fontSize: Number.isFinite(Number(sectionData.block?.fontSize)) ? Number(sectionData.block.fontSize) : 14,
    lineHeight: Number.isFinite(Number(sectionData.block?.lineHeight)) ? Number(sectionData.block.lineHeight) : 1.6,
  };

  const blockBorderValue = computed({
    get: () => ({
      style: sectionData.block.borderStyle,
      color: sectionData.block.borderColor,
      width: Number(sectionData.block.borderWidth) || 0,
      radius: Number(sectionData.block.borderRadius) || 0,
    }),
    set: (value) => {
      sectionData.block.borderStyle = value.style as BlockStyleData['block']['borderStyle'];
      sectionData.block.borderColor = value.color;
      sectionData.block.borderWidth = Number(value.width) || 0;
      sectionData.block.borderRadius = Number(value.radius) || 0;
    },
  });

  defineOptions({
    name: 'base-placeholder-block-style',
  });
</script>

<style scoped>
  .style-config {
    padding: 2px 0 8px;
  }
</style>
