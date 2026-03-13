<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="卡片样式">
        <el-form-item label="卡片背景色">
          <PortalColorField v-model="sectionData.list.cardBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="卡片边框色">
          <PortalColorField v-model="sectionData.list.cardBorderColor" show-alpha />
        </el-form-item>

        <el-form-item label="卡片圆角(px)">
          <el-input-number v-model="sectionData.list.cardRadius" :min="0" :max="40" controls-position="right" />
        </el-form-item>

        <el-form-item label="图片高度(px)">
          <el-input-number v-model="sectionData.list.imageHeight" :min="60" :max="260" controls-position="right" />
        </el-form-item>
      </ObCard>

      <ObCard title="文本与标签">
        <el-form-item label="标题颜色">
          <PortalColorField v-model="sectionData.list.titleColor" show-alpha />
        </el-form-item>

        <el-form-item label="描述颜色">
          <PortalColorField v-model="sectionData.list.descriptionColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题字号(px)">
          <el-input-number v-model="sectionData.list.titleFontSize" :min="12" :max="32" controls-position="right" />
        </el-form-item>

        <el-form-item label="描述字号(px)">
          <el-input-number v-model="sectionData.list.descriptionFontSize" :min="12" :max="24" controls-position="right" />
        </el-form-item>

        <el-form-item label="标签背景色">
          <PortalColorField v-model="sectionData.list.tagBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="标签文字色">
          <PortalColorField v-model="sectionData.list.tagTextColor" show-alpha />
        </el-form-item>
      </ObCard>

      <ObCard title="间距">
        <el-form-item label="行间距(px)">
          <el-input-number v-model="sectionData.list.rowGap" :min="0" :max="32" controls-position="right" />
        </el-form-item>

        <el-form-item label="列间距(px)">
          <el-input-number v-model="sectionData.list.columnGap" :min="0" :max="32" controls-position="right" />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { ObCard } from '@one-base-template/ui';
  import { useSchemaConfig } from '../../../composables/useSchemaConfig';
  import PortalColorField from '../../common/fields/PortalColorField.vue';
  import { UnifiedContainerStyleConfig, mergeUnifiedContainerStyleConfig } from '../../common/unified-container';
  import type { UnifiedContainerStyleConfigModel } from '../../common/unified-container';

  interface ImageLinkListStyleData {
    container: UnifiedContainerStyleConfigModel;
    list: {
      cardBgColor: string;
      cardBorderColor: string;
      cardRadius: number;
      imageHeight: number;
      titleColor: string;
      descriptionColor: string;
      tagBgColor: string;
      tagTextColor: string;
      titleFontSize: number;
      descriptionFontSize: number;
      rowGap: number;
      columnGap: number;
    };
  }

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  const { sectionData } = useSchemaConfig<ImageLinkListStyleData>({
    name: 'image-link-list-style',
    sections: {
      container: {},
      list: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'style', newSchema);
    },
  });

  sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
  sectionData.list = {
    cardBgColor: sectionData.list?.cardBgColor || '#ffffff',
    cardBorderColor: sectionData.list?.cardBorderColor || '#e2e8f0',
    cardRadius: Number.isFinite(Number(sectionData.list?.cardRadius)) ? Number(sectionData.list.cardRadius) : 10,
    imageHeight: Number(sectionData.list?.imageHeight) > 0 ? Number(sectionData.list.imageHeight) : 140,
    titleColor: sectionData.list?.titleColor || '#0f172a',
    descriptionColor: sectionData.list?.descriptionColor || '#64748b',
    tagBgColor: sectionData.list?.tagBgColor || '#e0f2fe',
    tagTextColor: sectionData.list?.tagTextColor || '#0369a1',
    titleFontSize: Number(sectionData.list?.titleFontSize) > 0 ? Number(sectionData.list.titleFontSize) : 15,
    descriptionFontSize: Number(sectionData.list?.descriptionFontSize) > 0 ? Number(sectionData.list.descriptionFontSize) : 12,
    rowGap: Number.isFinite(Number(sectionData.list?.rowGap)) ? Number(sectionData.list.rowGap) : 12,
    columnGap: Number.isFinite(Number(sectionData.list?.columnGap)) ? Number(sectionData.list.columnGap) : 12,
  };

  defineOptions({
    name: 'image-link-list-style',
  });
</script>

<style scoped>
  .style-config {
    padding: 2px 0 8px;
  }
</style>
