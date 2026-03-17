<template>
  <el-form label-position="top">
    <el-form-item label="背景色">
      <ObColorField v-model="sectionData.backgroundColor" show-alpha />
    </el-form-item>
    <el-form-item label="文字颜色">
      <ObColorField v-model="sectionData.textColor" />
    </el-form-item>
    <el-form-item label="边框颜色">
      <ObColorField v-model="sectionData.borderColor" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ObColorField } from '@one-base-template/ui';
import { useSchemaConfig } from '@one-base-template/portal-engine';

interface QuickDemoStyleSchema {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<QuickDemoStyleSchema>({
  name: 'admin-quick-demo-style',
  sections: {
    backgroundColor: {},
    textColor: {},
    borderColor: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

if (!sectionData.backgroundColor) {
  sectionData.backgroundColor = '#fff7ed';
}
if (!sectionData.textColor) {
  sectionData.textColor = '#9a3412';
}
if (!sectionData.borderColor) {
  sectionData.borderColor = '#fdba74';
}

defineOptions({
  name: 'admin-quick-demo-style'
});
</script>
