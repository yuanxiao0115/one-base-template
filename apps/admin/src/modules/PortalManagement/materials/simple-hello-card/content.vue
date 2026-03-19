<template>
  <div class="content-config">
    <el-form label-position="top">
      <ObCard title="内容设置">
        <el-form-item label="标题">
          <el-input
            v-model="sectionData.basic.title"
            maxlength="40"
            show-word-limit
            placeholder="请输入卡片标题"
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="sectionData.basic.description"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            maxlength="200"
            show-word-limit
            placeholder="请输入卡片描述"
          />
        </el-form-item>

        <el-form-item label="显示角标">
          <el-switch v-model="sectionData.basic.showBadge" />
        </el-form-item>

        <el-form-item label="角标文本">
          <el-input
            v-model="sectionData.basic.badgeText"
            maxlength="16"
            show-word-limit
            :disabled="sectionData.basic.showBadge !== true"
            placeholder="例如：NEW / DEMO"
          />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ObCard } from '@one-base-template/ui';
import { useSchemaConfig } from '@one-base-template/portal-engine';
import {
  mergePortalSimpleHelloCardBasicConfig,
  type PortalSimpleHelloCardBasicConfig
} from './defaults';

interface HelloCardContentData {
  basic: PortalSimpleHelloCardBasicConfig;
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<HelloCardContentData>({
  name: 'portal-simple-hello-card-content',
  sections: {
    basic: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

sectionData.basic = mergePortalSimpleHelloCardBasicConfig(sectionData.basic);

defineOptions({
  name: 'portal-simple-hello-card-content'
});
</script>

<style scoped>
.content-config {
  padding: 2px 0 8px;
}
</style>
