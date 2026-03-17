<template>
  <el-form label-position="top">
    <el-form-item label="标题">
      <el-input v-model="sectionData.title" clearable />
    </el-form-item>
    <el-form-item label="描述">
      <el-input v-model="sectionData.description" clearable />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { useSchemaConfig } from '@one-base-template/portal-engine';

interface QuickDemoContentSchema {
  title: string;
  description: string;
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<QuickDemoContentSchema>({
  name: 'admin-quick-demo-content',
  sections: {
    title: {},
    description: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

if (!sectionData.title) {
  sectionData.title = '注册示例卡片';
}
if (!sectionData.description) {
  sectionData.description = '这里是 admin 外部注册示例。';
}

defineOptions({
  name: 'admin-quick-demo-content'
});
</script>
