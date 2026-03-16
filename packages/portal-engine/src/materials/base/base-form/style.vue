<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="表单样式">
        <el-form-item label="标签宽度(px)">
          <el-input-number
            v-model="sectionData.form.labelWidth"
            :min="60"
            :max="180"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="字段间距(px)">
          <el-input-number
            v-model="sectionData.form.fieldGap"
            :min="0"
            :max="40"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="输入框高度(px)">
          <el-input-number
            v-model="sectionData.form.inputHeight"
            :min="30"
            :max="72"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="按钮对齐">
          <el-segmented
            v-model="sectionData.form.buttonAlign"
            :options="[
              { label: '左', value: 'left' },
              { label: '中', value: 'center' },
              { label: '右', value: 'right' }
            ]"
          />
        </el-form-item>

        <el-form-item label="按钮间距(px)">
          <el-input-number
            v-model="sectionData.form.buttonGap"
            :min="0"
            :max="40"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="主按钮颜色">
          <ObColorField v-model="sectionData.form.primaryColor" show-alpha />
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

type ButtonAlignType = 'left' | 'center' | 'right';

interface BaseFormStyleData {
  container: UnifiedContainerStyleConfigModel;
  form: {
    labelWidth: number;
    fieldGap: number;
    inputHeight: number;
    buttonAlign: ButtonAlignType;
    buttonGap: number;
    primaryColor: string;
  };
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseFormStyleData>({
  name: 'base-form-style',
  sections: {
    container: {},
    form: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.form = {
  labelWidth: Number(sectionData.form?.labelWidth) > 0 ? Number(sectionData.form.labelWidth) : 88,
  fieldGap: Number.isFinite(Number(sectionData.form?.fieldGap))
    ? Number(sectionData.form.fieldGap)
    : 12,
  inputHeight:
    Number(sectionData.form?.inputHeight) > 0 ? Number(sectionData.form.inputHeight) : 40,
  buttonAlign:
    sectionData.form?.buttonAlign === 'center' || sectionData.form?.buttonAlign === 'right'
      ? sectionData.form.buttonAlign
      : 'left',
  buttonGap: Number.isFinite(Number(sectionData.form?.buttonGap))
    ? Number(sectionData.form.buttonGap)
    : 10,
  primaryColor: sectionData.form?.primaryColor || '#2563eb'
};

defineOptions({
  name: 'base-form-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
