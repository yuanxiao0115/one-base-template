<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="公告样式">
        <el-form-item label="容器高度(px)">
          <el-input-number
            v-model="sectionData.notice.height"
            :min="30"
            :max="96"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="圆角(px)">
          <el-input-number
            v-model="sectionData.notice.radius"
            :min="0"
            :max="28"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="背景色">
          <ObColorField v-model="sectionData.notice.backgroundColor" show-alpha />
        </el-form-item>

        <el-form-item label="边框色">
          <ObColorField v-model="sectionData.notice.borderColor" show-alpha />
        </el-form-item>

        <el-form-item label="文字颜色">
          <ObColorField v-model="sectionData.notice.textColor" show-alpha />
        </el-form-item>

        <el-form-item label="文字字号(px)">
          <el-input-number
            v-model="sectionData.notice.textFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="圆点颜色">
          <ObColorField v-model="sectionData.notice.bulletColor" show-alpha />
        </el-form-item>

        <el-form-item label="图标颜色">
          <ObColorField v-model="sectionData.notice.iconColor" show-alpha />
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

interface BaseNoticeStyleData {
  container: UnifiedContainerStyleConfigModel;
  notice: {
    height: number;
    radius: number;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    textFontSize: number;
    bulletColor: string;
    iconColor: string;
  };
}

const BASE_NOTICE_STYLE_DEFAULTS: BaseNoticeStyleData['notice'] = {
  height: 40,
  radius: 8,
  backgroundColor: '#f8fafc',
  borderColor: '#e2e8f0',
  textColor: '#0f172a',
  textFontSize: 14,
  bulletColor: '#ef4444',
  iconColor: '#f59e0b'
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseNoticeStyleData>({
  name: 'base-notice-style',
  sections: {
    container: {},
    notice: {
      defaultValue: BASE_NOTICE_STYLE_DEFAULTS
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.notice = {
  height:
    Number(sectionData.notice?.height) > 0
      ? Number(sectionData.notice.height)
      : BASE_NOTICE_STYLE_DEFAULTS.height,
  radius: Number.isFinite(Number(sectionData.notice?.radius))
    ? Number(sectionData.notice.radius)
    : BASE_NOTICE_STYLE_DEFAULTS.radius,
  backgroundColor:
    sectionData.notice?.backgroundColor || BASE_NOTICE_STYLE_DEFAULTS.backgroundColor,
  borderColor: sectionData.notice?.borderColor || BASE_NOTICE_STYLE_DEFAULTS.borderColor,
  textColor: sectionData.notice?.textColor || BASE_NOTICE_STYLE_DEFAULTS.textColor,
  textFontSize:
    Number(sectionData.notice?.textFontSize) > 0
      ? Number(sectionData.notice.textFontSize)
      : BASE_NOTICE_STYLE_DEFAULTS.textFontSize,
  bulletColor: sectionData.notice?.bulletColor || BASE_NOTICE_STYLE_DEFAULTS.bulletColor,
  iconColor: sectionData.notice?.iconColor || BASE_NOTICE_STYLE_DEFAULTS.iconColor
};

defineOptions({
  name: 'base-notice-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
