<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="列表样式">
        <el-form-item label="圆点颜色">
          <ObColorField v-model="sectionData.file.dotColor" show-alpha />
        </el-form-item>

        <el-form-item label="行悬停背景色">
          <ObColorField v-model="sectionData.file.rowHoverBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="分割线颜色">
          <ObColorField v-model="sectionData.file.dividerColor" show-alpha />
        </el-form-item>

        <el-form-item label="行内边距(px)">
          <el-input-number
            v-model="sectionData.file.rowPaddingY"
            :min="0"
            :max="32"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="文本样式">
        <el-form-item label="文件名颜色">
          <ObColorField v-model="sectionData.file.nameColor" show-alpha />
        </el-form-item>

        <el-form-item label="日期颜色">
          <ObColorField v-model="sectionData.file.dateColor" show-alpha />
        </el-form-item>

        <el-form-item label="文件名字号(px)">
          <el-input-number
            v-model="sectionData.file.nameFontSize"
            :min="12"
            :max="28"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="日期字号(px)">
          <el-input-number
            v-model="sectionData.file.dateFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
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

interface DeptUploadFilesStyleData {
  container: UnifiedContainerStyleConfigModel;
  file: {
    dotColor: string;
    rowHoverBgColor: string;
    dividerColor: string;
    nameColor: string;
    dateColor: string;
    nameFontSize: number;
    dateFontSize: number;
    rowPaddingY: number;
  };
}

const DEFAULT_FILE_STYLE: DeptUploadFilesStyleData['file'] = {
  dotColor: '#ff7d00',
  rowHoverBgColor: '#f5f7fa',
  dividerColor: '#ebeef5',
  nameColor: '#606266',
  dateColor: '#606266',
  nameFontSize: 14,
  dateFontSize: 14,
  rowPaddingY: 12
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<DeptUploadFilesStyleData>({
  name: 'cms-dept-upload-files-style',
  sections: {
    container: {},
    file: {
      defaultValue: DEFAULT_FILE_STYLE
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.file = {
  dotColor: sectionData.file?.dotColor || DEFAULT_FILE_STYLE.dotColor,
  rowHoverBgColor: sectionData.file?.rowHoverBgColor || DEFAULT_FILE_STYLE.rowHoverBgColor,
  dividerColor: sectionData.file?.dividerColor || DEFAULT_FILE_STYLE.dividerColor,
  nameColor: sectionData.file?.nameColor || DEFAULT_FILE_STYLE.nameColor,
  dateColor: sectionData.file?.dateColor || DEFAULT_FILE_STYLE.dateColor,
  nameFontSize:
    Number(sectionData.file?.nameFontSize) > 0
      ? Number(sectionData.file.nameFontSize)
      : DEFAULT_FILE_STYLE.nameFontSize,
  dateFontSize:
    Number(sectionData.file?.dateFontSize) > 0
      ? Number(sectionData.file.dateFontSize)
      : DEFAULT_FILE_STYLE.dateFontSize,
  rowPaddingY: Number.isFinite(Number(sectionData.file?.rowPaddingY))
    ? Number(sectionData.file.rowPaddingY)
    : DEFAULT_FILE_STYLE.rowPaddingY
};

defineOptions({
  name: 'cms-dept-upload-files-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
