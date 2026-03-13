<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="公告行为">
        <el-form-item label="自动轮播">
          <el-switch v-model="sectionData.notice.autoplay" />
        </el-form-item>

        <el-form-item label="轮播间隔(ms)">
          <el-input-number v-model="sectionData.notice.interval" :min="1000" :max="20000" controls-position="right" />
        </el-form-item>

        <el-form-item label="显示圆点标识">
          <el-switch v-model="sectionData.notice.showBullet" />
        </el-form-item>
      </ObCard>

      <ObCard title="公告列表">
        <div class="item-list">
          <div v-for="(item, index) in sectionData.notice.items" :key="item.id" class="item-card">
            <div class="item-card__header">
              <span>公告 {{ index + 1 }}</span>
              <el-button text type="danger" :icon="Delete" @click="removeItem(index)">删除</el-button>
            </div>

            <el-form-item label="公告 ID">
              <el-input v-model.trim="item.id" maxlength="20" show-word-limit placeholder="例如：notice-1" />
            </el-form-item>

            <el-form-item label="公告文案">
              <el-input
                v-model.trim="item.text"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
                maxlength="200"
                show-word-limit
                placeholder="请输入公告内容"
              />
            </el-form-item>

            <PortalActionLinkField v-model="item.link" />
          </div>
        </div>

        <el-button type="primary" plain :icon="Plus" @click="addItem">新增公告</el-button>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { Delete, Plus } from '@element-plus/icons-vue';
  import { ObCard } from '@one-base-template/ui';
  import { useSchemaConfig } from '../../../composables/useSchemaConfig';
  import PortalActionLinkField from '../common/PortalActionLinkField.vue';
  import {
    UnifiedContainerContentConfig,
    createDefaultUnifiedContainerContentConfig,
    mergeUnifiedContainerContentConfig,
  } from '../../common/unified-container';
  import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';
  import { createDefaultPortalLinkConfig, mergePortalLinkConfig, type PortalLinkConfig } from '../common/portal-link';

  interface NoticeItem {
    id: string;
    text: string;
    linkPath?: string;
    linkParamKey?: string;
    linkValueKey?: string;
    openType?: PortalLinkConfig['openType'];
    link: PortalLinkConfig;
  }

  interface BaseNoticeContentData {
    container: UnifiedContainerContentConfigModel;
    notice: {
      autoplay: boolean;
      interval: number;
      showBullet: boolean;
      items: NoticeItem[];
    };
  }

  const props = defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['schemaChange']);

  const { sectionData } = useSchemaConfig<BaseNoticeContentData>({
    name: 'base-notice-content',
    sections: {
      container: {},
      notice: {},
    },
    schema: props.schema,
    onChange: (newSchema) => {
      emit('schemaChange', 'content', newSchema);
    },
  });

  function createNoticeItem(seed: number): NoticeItem {
    return {
      id: `notice-${Date.now()}-${seed}`,
      text: `示例公告${seed}`,
      link: createDefaultPortalLinkConfig(),
    };
  }

  function normalizeNoticeItem(item: Partial<NoticeItem>, index: number): NoticeItem {
    return {
      id: String(item.id || `notice-${index + 1}`),
      text: String(item.text || `示例公告${index + 1}`),
      link: mergePortalLinkConfig(
        item.link || {
          path: item.linkPath,
          paramKey: item.linkParamKey,
          valueKey: item.linkValueKey,
          openType: item.openType,
        }
      ),
    };
  }

  sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
  sectionData.notice = {
    autoplay: sectionData.notice?.autoplay !== false,
    interval: Number(sectionData.notice?.interval) > 0 ? Number(sectionData.notice.interval) : 3500,
    showBullet: sectionData.notice?.showBullet !== false,
    items: Array.isArray(sectionData.notice?.items)
      ? sectionData.notice.items.map((item, index) => normalizeNoticeItem(item, index))
      : [createNoticeItem(1), createNoticeItem(2)],
  };

  const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
  if (!sectionData.container.title.trim()) {
    sectionData.container.title = '通知公告';
  }
  if (!sectionData.container.subtitle.trim()) {
    sectionData.container.subtitle = '支持滚动展示与跳转';
  }
  if (!sectionData.container.externalLinkText.trim()) {
    sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
  }

  function addItem() {
    sectionData.notice.items.push(createNoticeItem(sectionData.notice.items.length + 1));
  }

  function removeItem(index: number) {
    sectionData.notice.items.splice(index, 1);
  }

  defineOptions({
    name: 'base-notice-content',
  });
</script>

<style scoped>
  .content-config {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .item-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 10px;
  }

  .item-card {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    padding: 12px;
    background: #fff;
  }

  .item-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }
</style>
