<template>
  <div class="style-config">
    <el-form label-position="top">
      <ObCard title="卡片样式">
        <el-form-item label="背景色">
          <ObColorField v-model="sectionData.card.backgroundColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题颜色">
          <ObColorField v-model="sectionData.card.titleColor" show-alpha />
        </el-form-item>

        <el-form-item label="描述颜色">
          <ObColorField v-model="sectionData.card.descriptionColor" show-alpha />
        </el-form-item>

        <el-form-item label="角标背景色">
          <ObColorField v-model="sectionData.card.badgeBackgroundColor" show-alpha />
        </el-form-item>

        <el-form-item label="角标文字色">
          <ObColorField v-model="sectionData.card.badgeTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="边框颜色">
          <ObColorField v-model="sectionData.card.borderColor" show-alpha />
        </el-form-item>

        <el-form-item label="圆角(px)">
          <el-input-number
            v-model="sectionData.card.borderRadius"
            :min="0"
            :max="40"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="上下内边距(px)">
          <el-input-number
            v-model="sectionData.card.paddingY"
            :min="0"
            :max="48"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="左右内边距(px)">
          <el-input-number
            v-model="sectionData.card.paddingX"
            :min="0"
            :max="48"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ObCard, ObColorField } from '@one-base-template/ui';
import { useSchemaConfig } from '@one-base-template/portal-engine';
import {
  mergePortalSimpleHelloCardStyleConfig,
  PORTAL_SIMPLE_HELLO_CARD_STYLE_NAME,
  type PortalSimpleHelloCardStyleConfig
} from './defaults';

interface HelloCardStyleData {
  card: PortalSimpleHelloCardStyleConfig;
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<HelloCardStyleData>({
  name: PORTAL_SIMPLE_HELLO_CARD_STYLE_NAME,
  sections: {
    card: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.card = mergePortalSimpleHelloCardStyleConfig(sectionData.card);

defineOptions({
  name: PORTAL_SIMPLE_HELLO_CARD_STYLE_NAME
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
