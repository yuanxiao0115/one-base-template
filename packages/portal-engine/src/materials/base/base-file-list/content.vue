<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <PortalDataSourceCard v-model="sectionData.dataSource" />

      <ObCard title="字段映射">
        <el-form-item label="文件名字段 key">
          <el-input v-model.trim="sectionData.file.nameKey" maxlength="40" show-word-limit placeholder="例如：name" />
        </el-form-item>

        <el-form-item label="文件大小字段 key">
          <el-input v-model.trim="sectionData.file.sizeKey" maxlength="40" show-word-limit placeholder="例如：size" />
        </el-form-item>

        <el-form-item label="时间字段 key">
          <el-input v-model.trim="sectionData.file.timeKey" maxlength="40" show-word-limit placeholder="例如：publishTime" />
        </el-form-item>

        <el-form-item label="下载地址字段 key">
          <el-input v-model.trim="sectionData.file.urlKey" maxlength="40" show-word-limit placeholder="例如：url" />
        </el-form-item>

        <el-form-item label="主键字段 key">
          <el-input v-model.trim="sectionData.file.idKey" maxlength="40" show-word-limit placeholder="例如：id" />
        </el-form-item>

        <el-form-item label="显示文件图标">
          <el-switch v-model="sectionData.file.showIcon" />
        </el-form-item>

        <el-form-item label="每页条数">
          <el-input-number v-model="sectionData.file.pageSize" :min="1" :max="100" controls-position="right" />
        </el-form-item>

        <el-form-item label="显示分页">
          <el-switch v-model="sectionData.file.showPagination" />
        </el-form-item>
      </ObCard>

      <ObCard title="文件行跳转">
        <PortalActionLinkField
          v-model="sectionData.file.link"
          path-label="详情页路径（可选）"
          path-placeholder="例如：/portal/file/detail"
          param-key-label="详情参数 key"
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
  import PortalActionLinkField from '../common/PortalActionLinkField.vue';
  import PortalDataSourceCard from '../common/PortalDataSourceCard.vue';
  import {
    createDefaultPortalDataSourceModel,
    mergePortalDataSourceModel,
    type PortalDataSourceModel,
  } from '../common/portal-data-source';
  import { mergePortalLinkConfig, type PortalLinkConfig } from '../common/portal-link';
  import {
    UnifiedContainerContentConfig,
    createDefaultUnifiedContainerContentConfig,
    mergeUnifiedContainerContentConfig,
  } from '../../common/unified-container';
  import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';

  interface BaseFileListContentData {
    container: UnifiedContainerContentConfigModel;
    dataSource: PortalDataSourceModel;
    file: {
      nameKey: string;
      sizeKey: string;
      timeKey: string;
      urlKey: string;
      idKey: string;
      showIcon: boolean;
      pageSize: number;
      showPagination: boolean;
      linkPath?: string;
      linkParamKey?: string;
      linkValueKey?: string;
      openType?: PortalLinkConfig['openType'];
      link: PortalLinkConfig;
    };
  }

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  const { sectionData } = useSchemaConfig<BaseFileListContentData>({
    name: 'base-file-list-content',
    sections: {
      container: {},
      dataSource: {},
      file: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'content', newSchema);
    },
  });

  sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
  sectionData.dataSource = mergePortalDataSourceModel(sectionData.dataSource);
  if (!sectionData.dataSource.staticRowsJson.trim()) {
    sectionData.dataSource = {
      ...createDefaultPortalDataSourceModel(),
      staticRowsJson:
        '[{"id":"1","name":"操作手册.pdf","size":"2.4MB","publishTime":"2026-03-10","url":""}]',
    };
  }

  sectionData.file = {
    nameKey: typeof sectionData.file?.nameKey === 'string' && sectionData.file.nameKey.trim() ? sectionData.file.nameKey : 'name',
    sizeKey: typeof sectionData.file?.sizeKey === 'string' && sectionData.file.sizeKey.trim() ? sectionData.file.sizeKey : 'size',
    timeKey: typeof sectionData.file?.timeKey === 'string' && sectionData.file.timeKey.trim() ? sectionData.file.timeKey : 'publishTime',
    urlKey: typeof sectionData.file?.urlKey === 'string' && sectionData.file.urlKey.trim() ? sectionData.file.urlKey : 'url',
    idKey: typeof sectionData.file?.idKey === 'string' && sectionData.file.idKey.trim() ? sectionData.file.idKey : 'id',
    showIcon: sectionData.file?.showIcon !== false,
    pageSize: Number(sectionData.file?.pageSize) > 0 ? Number(sectionData.file.pageSize) : 8,
    showPagination: sectionData.file?.showPagination !== false,
    link: mergePortalLinkConfig(
      sectionData.file?.link || {
        path: sectionData.file?.linkPath,
        paramKey: sectionData.file?.linkParamKey,
        valueKey: sectionData.file?.linkValueKey,
        openType: sectionData.file?.openType,
      }
    ),
  };

  if (!sectionData.file.link.path.trim()) {
    sectionData.file.link.path = '/portal/file/detail';
  }
  if (!sectionData.file.link.paramKey.trim()) {
    sectionData.file.link.paramKey = 'id';
  }
  if (!sectionData.file.link.valueKey.trim()) {
    sectionData.file.link.valueKey = sectionData.file.idKey;
  }

  const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
  if (!sectionData.container.title.trim()) {
    sectionData.container.title = '文件列表';
  }
  if (!sectionData.container.subtitle.trim()) {
    sectionData.container.subtitle = '支持附件下载与详情跳转';
  }
  if (!sectionData.container.externalLinkText.trim()) {
    sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
  }

  defineOptions({
    name: 'base-file-list-content',
  });
</script>

<style scoped>
  .content-config {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
