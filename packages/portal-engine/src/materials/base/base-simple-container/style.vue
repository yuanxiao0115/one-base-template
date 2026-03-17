<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="容器内部样式">
        <el-form-item label="背景色">
          <ObColorField v-model="sectionData.body.backgroundColor" show-alpha />
        </el-form-item>

        <PortalBorderField
          v-model="bodyBorderValue"
          :width-min="0"
          :width-max="20"
          :radius-max="120"
          :hide-color-width-when-none="false"
        />

        <el-form-item label="内部留白">
          <PortalSpacingField v-model="bodyPaddingValue" :max="160" />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ObCard, ObColorField } from '@one-base-template/ui';

import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import PortalBorderField from '../../common/fields/PortalBorderField.vue';
import PortalSpacingField from '../../common/fields/PortalSpacingField.vue';
import {
  UnifiedContainerStyleConfig,
  mergeUnifiedContainerStyleConfig
} from '../../common/unified-container';
import type { UnifiedContainerStyleConfigModel } from '../../common/unified-container';
import {
  BASE_SIMPLE_CONTAINER_STYLE_NAME,
  mergeBaseSimpleContainerBodyStyle,
  type BaseSimpleContainerBodyStyle
} from './model';

interface BaseSimpleContainerStyleData {
  container: UnifiedContainerStyleConfigModel;
  body: BaseSimpleContainerBodyStyle;
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseSimpleContainerStyleData>({
  name: BASE_SIMPLE_CONTAINER_STYLE_NAME,
  sections: {
    container: {},
    body: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.body = mergeBaseSimpleContainerBodyStyle(sectionData.body);

const bodyBorderValue = computed({
  get: () => ({
    style: sectionData.body.borderStyle,
    color: sectionData.body.borderColor,
    width: Number(sectionData.body.borderWidth) || 0,
    radius: Number(sectionData.body.borderRadius) || 0
  }),
  set: (value) => {
    sectionData.body.borderStyle = value.style;
    sectionData.body.borderColor = value.color;
    sectionData.body.borderWidth = Number(value.width) || 0;
    sectionData.body.borderRadius = Number(value.radius) || 0;
  }
});

const bodyPaddingValue = computed({
  get: () => ({
    top: Number(sectionData.body.paddingTop) || 0,
    right: Number(sectionData.body.paddingRight) || 0,
    bottom: Number(sectionData.body.paddingBottom) || 0,
    left: Number(sectionData.body.paddingLeft) || 0
  }),
  set: (value) => {
    sectionData.body.paddingTop = Number(value.top) || 0;
    sectionData.body.paddingRight = Number(value.right) || 0;
    sectionData.body.paddingBottom = Number(value.bottom) || 0;
    sectionData.body.paddingLeft = Number(value.left) || 0;
  }
});

defineOptions({
  name: 'base-simple-container-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
