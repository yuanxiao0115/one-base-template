<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="搜索框样式">
        <el-form-item label="高度(px)">
          <el-input-number
            v-model="sectionData.search.height"
            :min="30"
            :max="72"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="圆角(px)">
          <el-input-number
            v-model="sectionData.search.radius"
            :min="0"
            :max="36"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="输入背景色">
          <ObColorField v-model="sectionData.search.inputBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="输入边框色">
          <ObColorField v-model="sectionData.search.inputBorderColor" show-alpha />
        </el-form-item>

        <el-form-item label="输入文字色">
          <ObColorField v-model="sectionData.search.inputTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="按钮背景色">
          <ObColorField v-model="sectionData.search.buttonBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="按钮文字色">
          <ObColorField v-model="sectionData.search.buttonTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="按钮宽度(px)">
          <el-input-number
            v-model="sectionData.search.buttonWidth"
            :min="68"
            :max="220"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ObCard, ObColorField } from '@one-base-template/ui';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import {
  UnifiedContainerStyleConfig,
  mergeUnifiedContainerStyleConfig
} from '../../common/unified-container';
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

const BASE_SEARCH_BOX_STYLE_DEFAULTS: BaseSearchBoxStyleData['search'] = {
  height: 40,
  radius: 8,
  inputBgColor: '#ffffff',
  inputBorderColor: '#d0d7e2',
  inputTextColor: '#0f172a',
  buttonBgColor: '#2563eb',
  buttonTextColor: '#ffffff',
  buttonWidth: 96
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseSearchBoxStyleData>({
  name: 'base-search-box-style',
  sections: {
    container: {},
    search: {
      defaultValue: BASE_SEARCH_BOX_STYLE_DEFAULTS
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.search = {
  height:
    Number(sectionData.search?.height) > 0
      ? Number(sectionData.search.height)
      : BASE_SEARCH_BOX_STYLE_DEFAULTS.height,
  radius: Number.isFinite(Number(sectionData.search?.radius))
    ? Number(sectionData.search.radius)
    : BASE_SEARCH_BOX_STYLE_DEFAULTS.radius,
  inputBgColor: sectionData.search?.inputBgColor || BASE_SEARCH_BOX_STYLE_DEFAULTS.inputBgColor,
  inputBorderColor:
    sectionData.search?.inputBorderColor || BASE_SEARCH_BOX_STYLE_DEFAULTS.inputBorderColor,
  inputTextColor:
    sectionData.search?.inputTextColor || BASE_SEARCH_BOX_STYLE_DEFAULTS.inputTextColor,
  buttonBgColor: sectionData.search?.buttonBgColor || BASE_SEARCH_BOX_STYLE_DEFAULTS.buttonBgColor,
  buttonTextColor:
    sectionData.search?.buttonTextColor || BASE_SEARCH_BOX_STYLE_DEFAULTS.buttonTextColor,
  buttonWidth:
    Number(sectionData.search?.buttonWidth) > 0
      ? Number(sectionData.search.buttonWidth)
      : BASE_SEARCH_BOX_STYLE_DEFAULTS.buttonWidth
};

defineOptions({
  name: 'base-search-box-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
