<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="行样式">
        <el-form-item label="行间距(px)">
          <el-input-number v-model="sectionData.file.rowGap" :min="0" :max="24" controls-position="right" />
        </el-form-item>

        <el-form-item label="行内边距(px)">
          <el-input-number v-model="sectionData.file.rowPaddingY" :min="0" :max="24" controls-position="right" />
        </el-form-item>

        <el-form-item label="分割线颜色">
          <PortalColorField v-model="sectionData.file.dividerColor" show-alpha />
        </el-form-item>

        <el-form-item label="链接颜色">
          <PortalColorField v-model="sectionData.file.linkColor" show-alpha />
        </el-form-item>

        <el-form-item label="图标颜色">
          <PortalColorField v-model="sectionData.file.iconColor" show-alpha />
        </el-form-item>
      </ObCard>

      <ObCard title="文本样式">
        <el-form-item label="文件名颜色">
          <PortalColorField v-model="sectionData.file.nameColor" show-alpha />
        </el-form-item>

        <el-form-item label="元信息颜色">
          <PortalColorField v-model="sectionData.file.metaColor" show-alpha />
        </el-form-item>

        <el-form-item label="文件名字号(px)">
          <el-input-number v-model="sectionData.file.nameFontSize" :min="12" :max="28" controls-position="right" />
        </el-form-item>

        <el-form-item label="元信息字号(px)">
          <el-input-number v-model="sectionData.file.metaFontSize" :min="12" :max="24" controls-position="right" />
        </el-form-item>
      </ObCard>

      <ObCard title="分页样式">
        <el-form-item label="分页对齐">
          <el-segmented
            v-model="sectionData.file.paginationAlign"
            :options="[
              { label: '左', value: 'left' },
              { label: '中', value: 'center' },
              { label: '右', value: 'right' }
            ]"
          />
        </el-form-item>

        <el-form-item label="分页上间距(px)">
          <el-input-number v-model="sectionData.file.paginationTopGap" :min="0" :max="40" controls-position="right" />
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

  type PaginationAlignType = 'left' | 'center' | 'right';

  interface BaseFileListStyleData {
    container: UnifiedContainerStyleConfigModel;
    file: {
      rowGap: number;
      rowPaddingY: number;
      dividerColor: string;
      nameColor: string;
      metaColor: string;
      linkColor: string;
      iconColor: string;
      nameFontSize: number;
      metaFontSize: number;
      paginationAlign: PaginationAlignType;
      paginationTopGap: number;
    };
  }

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  const { sectionData } = useSchemaConfig<BaseFileListStyleData>({
    name: 'base-file-list-style',
    sections: {
      container: {},
      file: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'style', newSchema);
    },
  });

  sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
  sectionData.file = {
    rowGap: Number.isFinite(Number(sectionData.file?.rowGap)) ? Number(sectionData.file.rowGap) : 8,
    rowPaddingY: Number.isFinite(Number(sectionData.file?.rowPaddingY)) ? Number(sectionData.file.rowPaddingY) : 10,
    dividerColor: sectionData.file?.dividerColor || '#e2e8f0',
    nameColor: sectionData.file?.nameColor || '#0f172a',
    metaColor: sectionData.file?.metaColor || '#64748b',
    linkColor: sectionData.file?.linkColor || '#2563eb',
    iconColor: sectionData.file?.iconColor || '#0ea5e9',
    nameFontSize: Number(sectionData.file?.nameFontSize) > 0 ? Number(sectionData.file.nameFontSize) : 14,
    metaFontSize: Number(sectionData.file?.metaFontSize) > 0 ? Number(sectionData.file.metaFontSize) : 12,
    paginationAlign:
      sectionData.file?.paginationAlign === 'left' || sectionData.file?.paginationAlign === 'center'
        ? sectionData.file.paginationAlign
        : 'right',
    paginationTopGap: Number.isFinite(Number(sectionData.file?.paginationTopGap)) ? Number(sectionData.file.paginationTopGap) : 10,
  };

  defineOptions({
    name: 'base-file-list-style',
  });
</script>

<style scoped>
  .style-config {
    padding: 2px 0 8px;
  }
</style>
