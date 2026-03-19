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

interface HelloCardStyleData {
  card: {
    backgroundColor: string;
    titleColor: string;
    descriptionColor: string;
    badgeBackgroundColor: string;
    badgeTextColor: string;
    borderColor: string;
    borderRadius: number;
    paddingY: number;
    paddingX: number;
  };
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<HelloCardStyleData>({
  name: 'portal-simple-hello-card-style',
  sections: {
    card: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.card = {
  backgroundColor:
    typeof sectionData.card?.backgroundColor === 'string' && sectionData.card.backgroundColor.trim()
      ? sectionData.card.backgroundColor
      : '#eff6ff',
  titleColor:
    typeof sectionData.card?.titleColor === 'string' && sectionData.card.titleColor.trim()
      ? sectionData.card.titleColor
      : '#1e293b',
  descriptionColor:
    typeof sectionData.card?.descriptionColor === 'string' &&
    sectionData.card.descriptionColor.trim()
      ? sectionData.card.descriptionColor
      : '#475569',
  badgeBackgroundColor:
    typeof sectionData.card?.badgeBackgroundColor === 'string' &&
    sectionData.card.badgeBackgroundColor.trim()
      ? sectionData.card.badgeBackgroundColor
      : '#2563eb',
  badgeTextColor:
    typeof sectionData.card?.badgeTextColor === 'string' && sectionData.card.badgeTextColor.trim()
      ? sectionData.card.badgeTextColor
      : '#ffffff',
  borderColor:
    typeof sectionData.card?.borderColor === 'string' && sectionData.card.borderColor.trim()
      ? sectionData.card.borderColor
      : '#cbd5e1',
  borderRadius: Number.isFinite(Number(sectionData.card?.borderRadius))
    ? Number(sectionData.card.borderRadius)
    : 8,
  paddingY: Number.isFinite(Number(sectionData.card?.paddingY))
    ? Number(sectionData.card.paddingY)
    : 16,
  paddingX: Number.isFinite(Number(sectionData.card?.paddingX))
    ? Number(sectionData.card.paddingX)
    : 16
};

defineOptions({
  name: 'portal-simple-hello-card-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
