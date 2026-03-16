<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="表头样式">
        <el-form-item label="表头背景色">
          <ObColorField v-model="sectionData.table.headerBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="表头文字色">
          <ObColorField v-model="sectionData.table.headerTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="表头字号(px)">
          <el-input-number
            v-model="sectionData.table.headerFontSize"
            :min="12"
            :max="36"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="表头圆角(px)">
          <el-input-number
            v-model="sectionData.table.headerRadius"
            :min="0"
            :max="32"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="行样式">
        <el-form-item label="行文字色">
          <ObColorField v-model="sectionData.table.rowTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="行字号(px)">
          <el-input-number
            v-model="sectionData.table.rowFontSize"
            :min="12"
            :max="30"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="行悬停背景">
          <ObColorField v-model="sectionData.table.rowHoverBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="行分割线颜色">
          <ObColorField v-model="sectionData.table.dividerColor" show-alpha />
        </el-form-item>
      </ObCard>

      <ObCard title="链接与圆点">
        <el-form-item label="链接颜色">
          <ObColorField v-model="sectionData.table.linkColor" show-alpha />
        </el-form-item>

        <el-form-item label="圆点颜色">
          <ObColorField v-model="sectionData.table.dotColor" show-alpha />
        </el-form-item>

        <el-form-item label="圆点大小(px)">
          <el-input-number
            v-model="sectionData.table.dotSize"
            :min="4"
            :max="20"
            controls-position="right"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="分页">
        <el-form-item label="分页对齐">
          <el-segmented
            v-model="sectionData.table.paginationAlign"
            :options="[
              { label: '左', value: 'left' },
              { label: '中', value: 'center' },
              { label: '右', value: 'right' }
            ]"
          />
        </el-form-item>

        <el-form-item label="分页上间距(px)">
          <el-input-number
            v-model="sectionData.table.paginationTopGap"
            :min="0"
            :max="120"
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

type PaginationAlignType = 'left' | 'center' | 'right';

interface BaseTableStyleData {
  container: UnifiedContainerStyleConfigModel;
  table: {
    headerBgColor: string;
    headerTextColor: string;
    headerFontSize: number;
    headerRadius: number;
    rowTextColor: string;
    rowFontSize: number;
    rowHoverBgColor: string;
    dividerColor: string;
    linkColor: string;
    dotColor: string;
    dotSize: number;
    paginationAlign: PaginationAlignType;
    paginationTopGap: number;
  };
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseTableStyleData>({
  name: 'base-table-style',
  sections: {
    container: {},
    table: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.table = {
  headerBgColor: sectionData.table?.headerBgColor || '#f8fafc',
  headerTextColor: sectionData.table?.headerTextColor || '#334155',
  headerFontSize:
    Number(sectionData.table?.headerFontSize) > 0 ? Number(sectionData.table.headerFontSize) : 14,
  headerRadius: Number.isFinite(Number(sectionData.table?.headerRadius))
    ? Number(sectionData.table.headerRadius)
    : 8,
  rowTextColor: sectionData.table?.rowTextColor || '#334155',
  rowFontSize:
    Number(sectionData.table?.rowFontSize) > 0 ? Number(sectionData.table.rowFontSize) : 14,
  rowHoverBgColor: sectionData.table?.rowHoverBgColor || '#f8fafc',
  dividerColor: sectionData.table?.dividerColor || '#e2e8f0',
  linkColor: sectionData.table?.linkColor || '#2563eb',
  dotColor: sectionData.table?.dotColor || '#2563eb',
  dotSize: Number(sectionData.table?.dotSize) > 0 ? Number(sectionData.table.dotSize) : 6,
  paginationAlign:
    sectionData.table?.paginationAlign === 'left' || sectionData.table?.paginationAlign === 'center'
      ? sectionData.table.paginationAlign
      : 'right',
  paginationTopGap: Number.isFinite(Number(sectionData.table?.paginationTopGap))
    ? Number(sectionData.table.paginationTopGap)
    : 12
};

defineOptions({
  name: 'base-table-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
