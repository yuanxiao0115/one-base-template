<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <PortalDataSourceCard v-model="sectionData.dataSource" />

      <ObCard title="列表设置">
        <el-form-item label="最大展示条数">
          <el-input-number
            v-model="sectionData.file.maxDisplayCount"
            :min="1"
            :max="50"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="显示圆点">
          <el-switch v-model="sectionData.file.showRowDot" />
        </el-form-item>

        <el-form-item label="显示行分割线">
          <el-switch v-model="sectionData.file.showRowDivider" />
        </el-form-item>
      </ObCard>

      <ObCard title="字段映射">
        <el-form-item label="主键字段 key">
          <el-input v-model.trim="sectionData.file.idKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="文件名字段 key">
          <el-input v-model.trim="sectionData.file.nameKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="日期字段 key">
          <el-input v-model.trim="sectionData.file.dateKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="下载链接字段 key">
          <el-input v-model.trim="sectionData.file.downloadUrlKey" maxlength="40" show-word-limit />
        </el-form-item>
      </ObCard>

      <ObCard title="行点击跳转（可选）">
        <PortalActionLinkField
          v-model="sectionData.file.link"
          path-label="详情路径"
          path-placeholder="例如：/file/detail"
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
import { mergePortalLinkConfig, type PortalLinkConfig } from '../../base/common/portal-link';
import {
  UnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';

interface DeptUploadFilesContentData {
  container: UnifiedContainerContentConfigModel;
  dataSource: PortalDataSourceModel;
  file: {
    maxDisplayCount: number;
    showRowDot: boolean;
    showRowDivider: boolean;
    idKey: string;
    nameKey: string;
    dateKey: string;
    downloadUrlKey: string;
    linkPath?: string;
    linkParamKey?: string;
    linkValueKey?: string;
    openType?: PortalLinkConfig['openType'];
    link: PortalLinkConfig;
  };
}

const DEFAULT_DATA_SOURCE = {
  ...createDefaultPortalDataSourceModel(),
  staticRowsJson:
    '[{"id":"1","fileName":"2026年工作要点.pdf","updateDate":"2026/03/08","downloadUrl":""}]'
};

const DEFAULT_FILE = {
  maxDisplayCount: 5,
  showRowDot: true,
  showRowDivider: false,
  idKey: 'id',
  nameKey: 'fileName',
  dateKey: 'updateDate',
  downloadUrlKey: 'downloadUrl'
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<DeptUploadFilesContentData>({
  name: 'cms-dept-upload-files-content',
  sections: {
    container: {
      defaultValue: {
        showTitle: true,
        title: '部门上传文件',
        subtitle: '展示部门共享文件',
        icon: 'ri:file-list-3-line'
      }
    },
    dataSource: {
      defaultValue: DEFAULT_DATA_SOURCE
    },
    file: {
      defaultValue: DEFAULT_FILE
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

sectionData.file = {
  maxDisplayCount:
    Number(sectionData.file?.maxDisplayCount) > 0
      ? Number(sectionData.file.maxDisplayCount)
      : DEFAULT_FILE.maxDisplayCount,
  showRowDot: sectionData.file?.showRowDot !== false,
  showRowDivider: sectionData.file?.showRowDivider === true,
  idKey:
    typeof sectionData.file?.idKey === 'string' && sectionData.file.idKey.trim().length
      ? sectionData.file.idKey
      : DEFAULT_FILE.idKey,
  nameKey:
    typeof sectionData.file?.nameKey === 'string' && sectionData.file.nameKey.trim().length
      ? sectionData.file.nameKey
      : DEFAULT_FILE.nameKey,
  dateKey:
    typeof sectionData.file?.dateKey === 'string' && sectionData.file.dateKey.trim().length
      ? sectionData.file.dateKey
      : DEFAULT_FILE.dateKey,
  downloadUrlKey:
    typeof sectionData.file?.downloadUrlKey === 'string' &&
    sectionData.file.downloadUrlKey.trim().length
      ? sectionData.file.downloadUrlKey
      : DEFAULT_FILE.downloadUrlKey,
  link: mergePortalLinkConfig(
    sectionData.file?.link || {
      path: sectionData.file?.linkPath,
      paramKey: sectionData.file?.linkParamKey,
      valueKey: sectionData.file?.linkValueKey,
      openType: sectionData.file?.openType
    }
  )
};

if (!sectionData.file.link.valueKey.trim()) {
  sectionData.file.link.valueKey = sectionData.file.idKey;
}

defineOptions({
  name: 'cms-dept-upload-files-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
