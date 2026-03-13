<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="搜索框样式">
        <el-form-item label="高度(px)">
          <el-input-number v-model="sectionData.search.height" :min="30" :max="72" controls-position="right" />
        </el-form-item>

        <el-form-item label="圆角(px)">
          <el-input-number v-model="sectionData.search.radius" :min="0" :max="36" controls-position="right" />
        </el-form-item>

        <el-form-item label="输入背景色">
          <PortalColorField v-model="sectionData.search.inputBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="输入边框色">
          <PortalColorField v-model="sectionData.search.inputBorderColor" show-alpha />
        </el-form-item>

        <el-form-item label="输入文字色">
          <PortalColorField v-model="sectionData.search.inputTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="按钮背景色">
          <PortalColorField v-model="sectionData.search.buttonBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="按钮文字色">
          <PortalColorField v-model="sectionData.search.buttonTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="按钮宽度(px)">
          <el-input-number v-model="sectionData.search.buttonWidth" :min="68" :max="220" controls-position="right" />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { ObCard } from '@one-base-template/ui';
  import { useSchemaConfig } from '../../../composables/useSchemaConfig';
  import PortalColorField from '../../common/fields/PortalColorField.vue';
  import { UnifiedContainerStyleConfig, mergeUnifiedContainerStyleConfig } from '../../common/unified-container';
  import type { UnifiedContainerStyleConfigModel } from '../../common/unified-container';

  interface BaseSearchBoxStyleData {
    container: UnifiedContainerStyleConfigModel;
    search: {
      height: number;
      radius: number;
      inputBgColor: string;
      inputBorderColor: string;
      inputTextColor: string;
      buttonBgColor: string;
      buttonTextColor: string;
      buttonWidth: number;
    };
  }

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  const { sectionData } = useSchemaConfig<BaseSearchBoxStyleData>({
    name: 'base-search-box-style',
    sections: {
      container: {},
      search: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'style', newSchema);
    },
  });

  sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
  sectionData.search = {
    height: Number(sectionData.search?.height) > 0 ? Number(sectionData.search.height) : 40,
    radius: Number.isFinite(Number(sectionData.search?.radius)) ? Number(sectionData.search.radius) : 8,
    inputBgColor: sectionData.search?.inputBgColor || '#ffffff',
    inputBorderColor: sectionData.search?.inputBorderColor || '#d0d7e2',
    inputTextColor: sectionData.search?.inputTextColor || '#0f172a',
    buttonBgColor: sectionData.search?.buttonBgColor || '#2563eb',
    buttonTextColor: sectionData.search?.buttonTextColor || '#ffffff',
    buttonWidth: Number(sectionData.search?.buttonWidth) > 0 ? Number(sectionData.search.buttonWidth) : 96,
  };

  defineOptions({
    name: 'base-search-box-style',
  });
</script>

<style scoped>
  .style-config {
    padding: 2px 0 8px;
  }
</style>
