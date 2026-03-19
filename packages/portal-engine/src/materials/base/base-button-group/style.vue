<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="按钮样式">
        <el-form-item label="按钮间距(px)">
          <el-input-number
            v-model="sectionData.buttons.gap"
            :min="0"
            :max="40"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="按钮尺寸">
          <el-select v-model="sectionData.buttons.size">
            <el-option label="large" value="large" />
            <el-option label="default" value="default" />
            <el-option label="small" value="small" />
          </el-select>
        </el-form-item>

        <el-form-item label="按钮圆角">
          <el-switch v-model="sectionData.buttons.round" />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ObCard } from '@one-base-template/ui';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import {
  UnifiedContainerStyleConfig,
  mergeUnifiedContainerStyleConfig
} from '../../common/unified-container';
import type { UnifiedContainerStyleConfigModel } from '../../common/unified-container';

type ButtonDirectionType = 'row' | 'column';
type ButtonAlignType = 'left' | 'center' | 'right';
type ButtonSizeType = 'large' | 'default' | 'small';

interface BaseButtonGroupStyleData {
  container: UnifiedContainerStyleConfigModel;
  buttons: {
    direction: ButtonDirectionType;
    align: ButtonAlignType;
    gap: number;
    size: ButtonSizeType;
    round: boolean;
  };
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseButtonGroupStyleData>({
  name: 'base-button-group-style',
  sections: {
    container: {},
    buttons: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.buttons = {
  direction: sectionData.buttons?.direction === 'column' ? 'column' : 'row',
  align:
    sectionData.buttons?.align === 'center' || sectionData.buttons?.align === 'right'
      ? sectionData.buttons.align
      : 'left',
  gap: Number.isFinite(Number(sectionData.buttons?.gap)) ? Number(sectionData.buttons.gap) : 10,
  size:
    sectionData.buttons?.size === 'large' || sectionData.buttons?.size === 'small'
      ? sectionData.buttons.size
      : 'default',
  round: sectionData.buttons?.round === true
};

defineOptions({
  name: 'base-button-group-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
