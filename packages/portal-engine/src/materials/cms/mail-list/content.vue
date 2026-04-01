<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <PortalDataSourceCard v-model="sectionData.dataSource" />

      <ObCard title="列表设置">
        <el-form-item label="未读数量（-1 表示按数据自动统计）">
          <el-input-number
            v-model="sectionData.mail.unreadCount"
            :min="-1"
            :max="999"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="最大展示条数">
          <el-input-number
            v-model="sectionData.mail.maxDisplayCount"
            :min="1"
            :max="50"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="显示状态圆点">
          <el-switch v-model="sectionData.mail.showStatusDot" />
        </el-form-item>

        <el-form-item label="显示行分割线">
          <el-switch v-model="sectionData.mail.showRowDivider" />
        </el-form-item>
      </ObCard>

      <ObCard title="字段映射">
        <el-form-item label="主键字段 key">
          <el-input v-model.trim="sectionData.mail.idKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="发件人字段 key">
          <el-input v-model.trim="sectionData.mail.senderNameKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="发件邮箱字段 key">
          <el-input v-model.trim="sectionData.mail.senderEmailKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="主题字段 key">
          <el-input v-model.trim="sectionData.mail.subjectKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="时间字段 key">
          <el-input v-model.trim="sectionData.mail.sendTimeKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="未读状态字段 key">
          <el-input v-model.trim="sectionData.mail.unreadKey" maxlength="40" show-word-limit />
        </el-form-item>
      </ObCard>

      <ObCard title="行点击跳转">
        <PortalActionLinkField
          v-model="sectionData.mail.link"
          path-label="详情路径"
          path-placeholder="例如：/mail/detail"
          param-key-label="参数 key"
          value-key-label="参数取值字段 key"
          value-key-placeholder="例如：id"
        />
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ObCard } from '@one-base-template/ui';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import PortalActionLinkField from '../../base/common/PortalActionLinkField.vue';
import PortalDataSourceCard from '../../base/common/PortalDataSourceCard.vue';
import {
  createDefaultPortalDataSourceModel,
  mergePortalDataSourceModel,
  type PortalDataSourceModel
} from '../../base/common/portal-data-source';
import {
  createDefaultPortalLinkConfig,
  mergePortalLinkConfig,
  type PortalLinkConfig
} from '../../base/common/portal-link';
import {
  UnifiedContainerContentConfig,
  createDefaultUnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';

interface MailListContentData {
  container: UnifiedContainerContentConfigModel;
  dataSource: PortalDataSourceModel;
  mail: {
    unreadCount: number;
    maxDisplayCount: number;
    showRowDivider: boolean;
    showStatusDot: boolean;
    idKey: string;
    senderNameKey: string;
    senderEmailKey: string;
    subjectKey: string;
    sendTimeKey: string;
    unreadKey: string;
    linkPath?: string;
    linkParamKey?: string;
    linkValueKey?: string;
    openType?: PortalLinkConfig['openType'];
    link: PortalLinkConfig;
  };
}

const DEFAULT_CONTAINER = mergeUnifiedContainerContentConfig({
  ...createDefaultUnifiedContainerContentConfig(),
  title: '我的邮件',
  subtitle: '展示常用邮件列表',
  icon: 'ri:mail-line'
});

const DEFAULT_DATA_SOURCE = {
  ...createDefaultPortalDataSourceModel(),
  staticRowsJson:
    '[{"id":"1","senderName":"李木子","senderEmail":"12345@163.com","subject":"邮件名称邮件名称邮件名称","sendTime":"2026/03/10 12:23","unread":true}]'
};

const DEFAULT_MAIL = {
  unreadCount: 3,
  maxDisplayCount: 7,
  showRowDivider: true,
  showStatusDot: true,
  idKey: 'id',
  senderNameKey: 'senderName',
  senderEmailKey: 'senderEmail',
  subjectKey: 'subject',
  sendTimeKey: 'sendTime',
  unreadKey: 'unread'
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<MailListContentData>({
  name: 'cms-mail-list-content',
  sections: {
    container: {
      defaultValue: DEFAULT_CONTAINER
    },
    dataSource: {
      defaultValue: DEFAULT_DATA_SOURCE
    },
    mail: {
      defaultValue: DEFAULT_MAIL
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.dataSource = mergePortalDataSourceModel(sectionData.dataSource);
if (!sectionData.dataSource.staticRowsJson.trim()) {
  sectionData.dataSource.staticRowsJson = DEFAULT_DATA_SOURCE.staticRowsJson;
}

sectionData.mail = {
  unreadCount: Number.isFinite(Number(sectionData.mail?.unreadCount))
    ? Number(sectionData.mail.unreadCount)
    : DEFAULT_MAIL.unreadCount,
  maxDisplayCount:
    Number(sectionData.mail?.maxDisplayCount) > 0
      ? Number(sectionData.mail.maxDisplayCount)
      : DEFAULT_MAIL.maxDisplayCount,
  showRowDivider: sectionData.mail?.showRowDivider !== false,
  showStatusDot: sectionData.mail?.showStatusDot !== false,
  idKey:
    typeof sectionData.mail?.idKey === 'string' && sectionData.mail.idKey.trim().length
      ? sectionData.mail.idKey
      : DEFAULT_MAIL.idKey,
  senderNameKey:
    typeof sectionData.mail?.senderNameKey === 'string' &&
    sectionData.mail.senderNameKey.trim().length
      ? sectionData.mail.senderNameKey
      : DEFAULT_MAIL.senderNameKey,
  senderEmailKey:
    typeof sectionData.mail?.senderEmailKey === 'string' &&
    sectionData.mail.senderEmailKey.trim().length
      ? sectionData.mail.senderEmailKey
      : DEFAULT_MAIL.senderEmailKey,
  subjectKey:
    typeof sectionData.mail?.subjectKey === 'string' && sectionData.mail.subjectKey.trim().length
      ? sectionData.mail.subjectKey
      : DEFAULT_MAIL.subjectKey,
  sendTimeKey:
    typeof sectionData.mail?.sendTimeKey === 'string' && sectionData.mail.sendTimeKey.trim().length
      ? sectionData.mail.sendTimeKey
      : DEFAULT_MAIL.sendTimeKey,
  unreadKey:
    typeof sectionData.mail?.unreadKey === 'string' && sectionData.mail.unreadKey.trim().length
      ? sectionData.mail.unreadKey
      : DEFAULT_MAIL.unreadKey,
  link: mergePortalLinkConfig(
    sectionData.mail?.link || {
      path: sectionData.mail?.linkPath,
      paramKey: sectionData.mail?.linkParamKey,
      valueKey: sectionData.mail?.linkValueKey,
      openType: sectionData.mail?.openType
    }
  )
};

if (!sectionData.mail.link.paramKey.trim()) {
  sectionData.mail.link.paramKey = 'id';
}
if (!sectionData.mail.link.valueKey.trim()) {
  sectionData.mail.link.valueKey = sectionData.mail.idKey;
}
if (!sectionData.mail.link.path.trim()) {
  sectionData.mail.link = {
    ...createDefaultPortalLinkConfig(),
    ...sectionData.mail.link,
    path: ''
  };
}

defineOptions({
  name: 'cms-mail-list-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
