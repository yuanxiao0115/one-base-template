<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="页签样式">
        <el-form-item label="拉伸铺满">
          <el-switch v-model="sectionData.tabs.stretch" />
        </el-form-item>

        <el-form-item label="未激活字体颜色">
          <ObColorField v-model="sectionData.tabs.textColor" show-alpha />
        </el-form-item>

        <el-form-item label="激活字体颜色">
          <ObColorField v-model="sectionData.tabs.activeTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="页签字号(px)">
          <el-input-number
            v-model="sectionData.tabs.fontSize"
            :min="12"
            :max="32"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="导航下间距(px)">
          <el-input-number
            v-model="sectionData.tabs.navMarginBottom"
            :min="0"
            :max="60"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="内容区背景">
          <ObColorField v-model="sectionData.tabs.paneBackgroundColor" show-alpha />
        </el-form-item>
      </ObCard>

      <ObCard title="内容区内边距">
        <PortalSpacingField v-model="panePaddingValue" :max="120" />
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ObCard, ObColorField } from '@one-base-template/ui';

import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import PortalSpacingField from '../../common/fields/PortalSpacingField.vue';
import {
  UnifiedContainerStyleConfig,
  mergeUnifiedContainerStyleConfig
} from '../../common/unified-container';
import type { UnifiedContainerStyleConfigModel } from '../../common/unified-container';

interface BaseTabContainerStyleData {
  container: UnifiedContainerStyleConfigModel;
  tabs: {
    stretch: boolean;
    textColor: string;
    activeTextColor: string;
    fontSize: number;
    navMarginBottom: number;
    paneBackgroundColor: string;
    panePaddingTop: number;
    panePaddingRight: number;
    panePaddingBottom: number;
    panePaddingLeft: number;
  };
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseTabContainerStyleData>({
  name: 'base-tab-container-style',
  sections: {
    container: {},
    tabs: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.tabs = {
  stretch: sectionData.tabs?.stretch === true,
  textColor: sectionData.tabs?.textColor || '#475569',
  activeTextColor: sectionData.tabs?.activeTextColor || '#2563eb',
  fontSize: Number(sectionData.tabs?.fontSize) > 0 ? Number(sectionData.tabs.fontSize) : 14,
  navMarginBottom: Number.isFinite(Number(sectionData.tabs?.navMarginBottom))
    ? Number(sectionData.tabs.navMarginBottom)
    : 12,
  paneBackgroundColor: sectionData.tabs?.paneBackgroundColor || 'transparent',
  panePaddingTop: Number.isFinite(Number(sectionData.tabs?.panePaddingTop))
    ? Number(sectionData.tabs.panePaddingTop)
    : 0,
  panePaddingRight: Number.isFinite(Number(sectionData.tabs?.panePaddingRight))
    ? Number(sectionData.tabs.panePaddingRight)
    : 0,
  panePaddingBottom: Number.isFinite(Number(sectionData.tabs?.panePaddingBottom))
    ? Number(sectionData.tabs.panePaddingBottom)
    : 0,
  panePaddingLeft: Number.isFinite(Number(sectionData.tabs?.panePaddingLeft))
    ? Number(sectionData.tabs.panePaddingLeft)
    : 0
};

const panePaddingValue = computed({
  get: () => ({
    top: Number(sectionData.tabs.panePaddingTop) || 0,
    right: Number(sectionData.tabs.panePaddingRight) || 0,
    bottom: Number(sectionData.tabs.panePaddingBottom) || 0,
    left: Number(sectionData.tabs.panePaddingLeft) || 0
  }),
  set: (value) => {
    sectionData.tabs.panePaddingTop = Number(value.top) || 0;
    sectionData.tabs.panePaddingRight = Number(value.right) || 0;
    sectionData.tabs.panePaddingBottom = Number(value.bottom) || 0;
    sectionData.tabs.panePaddingLeft = Number(value.left) || 0;
  }
});

defineOptions({
  name: 'base-tab-container-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
