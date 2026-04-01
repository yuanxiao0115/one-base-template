<template>
  <div class="style-config">
    <UnifiedContainerStyleConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="头部样式">
        <el-form-item label="头部背景色">
          <ObColorField v-model="sectionData.mail.headerBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="图标背景色">
          <ObColorField v-model="sectionData.mail.headerIconBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="图标颜色">
          <ObColorField v-model="sectionData.mail.headerIconColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题颜色">
          <ObColorField v-model="sectionData.mail.headerTitleColor" show-alpha />
        </el-form-item>

        <el-form-item label="未读徽标背景色">
          <ObColorField v-model="sectionData.mail.badgeBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="未读徽标边框色">
          <ObColorField v-model="sectionData.mail.badgeBorderColor" show-alpha />
        </el-form-item>

        <el-form-item label="未读徽标文字色">
          <ObColorField v-model="sectionData.mail.badgeTextColor" show-alpha />
        </el-form-item>

        <el-form-item label="未读数字颜色">
          <ObColorField v-model="sectionData.mail.badgeAccentColor" show-alpha />
        </el-form-item>
      </ObCard>

      <ObCard title="列表样式">
        <el-form-item label="行悬停背景色">
          <ObColorField v-model="sectionData.mail.rowHoverBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="分割线颜色">
          <ObColorField v-model="sectionData.mail.dividerColor" show-alpha />
        </el-form-item>

        <el-form-item label="发件人颜色">
          <ObColorField v-model="sectionData.mail.senderColor" show-alpha />
        </el-form-item>

        <el-form-item label="主题颜色">
          <ObColorField v-model="sectionData.mail.subjectColor" show-alpha />
        </el-form-item>

        <el-form-item label="时间颜色">
          <ObColorField v-model="sectionData.mail.timeColor" show-alpha />
        </el-form-item>

        <el-form-item label="未读圆点颜色">
          <ObColorField v-model="sectionData.mail.unreadDotColor" show-alpha />
        </el-form-item>

        <el-form-item label="已读圆点颜色">
          <ObColorField v-model="sectionData.mail.readDotColor" show-alpha />
        </el-form-item>
      </ObCard>

      <ObCard title="文本样式">
        <el-form-item label="标题字号(px)">
          <el-input-number
            v-model="sectionData.mail.titleFontSize"
            :min="12"
            :max="28"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="主题字号(px)">
          <el-input-number
            v-model="sectionData.mail.subjectFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="时间字号(px)">
          <el-input-number
            v-model="sectionData.mail.timeFontSize"
            :min="12"
            :max="22"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="头像背景色">
          <ObColorField v-model="sectionData.mail.avatarBgColor" show-alpha />
        </el-form-item>

        <el-form-item label="头像文字色">
          <ObColorField v-model="sectionData.mail.avatarTextColor" show-alpha />
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

interface MailListStyleData {
  container: UnifiedContainerStyleConfigModel;
  mail: {
    headerBgColor: string;
    headerIconBgColor: string;
    headerIconColor: string;
    headerTitleColor: string;
    badgeBgColor: string;
    badgeBorderColor: string;
    badgeTextColor: string;
    badgeAccentColor: string;
    rowHoverBgColor: string;
    dividerColor: string;
    senderColor: string;
    subjectColor: string;
    timeColor: string;
    unreadDotColor: string;
    readDotColor: string;
    titleFontSize: number;
    subjectFontSize: number;
    timeFontSize: number;
    avatarBgColor: string;
    avatarTextColor: string;
  };
}

const DEFAULT_MAIL_STYLE: MailListStyleData['mail'] = {
  headerBgColor: '#ffffff',
  headerIconBgColor: '#e7f2ff',
  headerIconColor: '#1f87ff',
  headerTitleColor: '#1d2129',
  badgeBgColor: '#ffffff',
  badgeBorderColor: '#e5e6eb',
  badgeTextColor: '#86909c',
  badgeAccentColor: '#1f87ff',
  rowHoverBgColor: '#f7f8fa',
  dividerColor: '#e5e6eb',
  senderColor: '#1d2129',
  subjectColor: '#1d2129',
  timeColor: '#86909c',
  unreadDotColor: '#ff7d00',
  readDotColor: '#c9cdd4',
  titleFontSize: 18,
  subjectFontSize: 16,
  timeFontSize: 14,
  avatarBgColor: '#2f88e6',
  avatarTextColor: '#ffffff'
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<MailListStyleData>({
  name: 'cms-mail-list-style',
  sections: {
    container: {},
    mail: {
      defaultValue: DEFAULT_MAIL_STYLE
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'style', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerStyleConfig(sectionData.container);
sectionData.mail = {
  headerBgColor: sectionData.mail?.headerBgColor || DEFAULT_MAIL_STYLE.headerBgColor,
  headerIconBgColor: sectionData.mail?.headerIconBgColor || DEFAULT_MAIL_STYLE.headerIconBgColor,
  headerIconColor: sectionData.mail?.headerIconColor || DEFAULT_MAIL_STYLE.headerIconColor,
  headerTitleColor: sectionData.mail?.headerTitleColor || DEFAULT_MAIL_STYLE.headerTitleColor,
  badgeBgColor: sectionData.mail?.badgeBgColor || DEFAULT_MAIL_STYLE.badgeBgColor,
  badgeBorderColor: sectionData.mail?.badgeBorderColor || DEFAULT_MAIL_STYLE.badgeBorderColor,
  badgeTextColor: sectionData.mail?.badgeTextColor || DEFAULT_MAIL_STYLE.badgeTextColor,
  badgeAccentColor: sectionData.mail?.badgeAccentColor || DEFAULT_MAIL_STYLE.badgeAccentColor,
  rowHoverBgColor: sectionData.mail?.rowHoverBgColor || DEFAULT_MAIL_STYLE.rowHoverBgColor,
  dividerColor: sectionData.mail?.dividerColor || DEFAULT_MAIL_STYLE.dividerColor,
  senderColor: sectionData.mail?.senderColor || DEFAULT_MAIL_STYLE.senderColor,
  subjectColor: sectionData.mail?.subjectColor || DEFAULT_MAIL_STYLE.subjectColor,
  timeColor: sectionData.mail?.timeColor || DEFAULT_MAIL_STYLE.timeColor,
  unreadDotColor: sectionData.mail?.unreadDotColor || DEFAULT_MAIL_STYLE.unreadDotColor,
  readDotColor: sectionData.mail?.readDotColor || DEFAULT_MAIL_STYLE.readDotColor,
  titleFontSize:
    Number(sectionData.mail?.titleFontSize) > 0
      ? Number(sectionData.mail.titleFontSize)
      : DEFAULT_MAIL_STYLE.titleFontSize,
  subjectFontSize:
    Number(sectionData.mail?.subjectFontSize) > 0
      ? Number(sectionData.mail.subjectFontSize)
      : DEFAULT_MAIL_STYLE.subjectFontSize,
  timeFontSize:
    Number(sectionData.mail?.timeFontSize) > 0
      ? Number(sectionData.mail.timeFontSize)
      : DEFAULT_MAIL_STYLE.timeFontSize,
  avatarBgColor: sectionData.mail?.avatarBgColor || DEFAULT_MAIL_STYLE.avatarBgColor,
  avatarTextColor: sectionData.mail?.avatarTextColor || DEFAULT_MAIL_STYLE.avatarTextColor
};

defineOptions({
  name: 'cms-mail-list-style'
});
</script>

<style scoped>
.style-config {
  padding: 2px 0 8px;
}
</style>
