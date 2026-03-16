<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="入口配置">
        <el-form-item label="单行列数">
          <el-input-number
            v-model="sectionData.entrance.columnCount"
            :min="1"
            :max="6"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="显示描述">
          <el-switch v-model="sectionData.entrance.showDescription" />
        </el-form-item>
      </ObCard>

      <ObCard title="入口列表">
        <div class="item-list">
          <div v-for="(item, index) in sectionData.entrance.items" :key="item.id" class="item-card">
            <div class="item-card__header">
              <span>入口 {{ index + 1 }}</span>
              <el-button text type="danger" :icon="Delete" @click="removeItem(index)"
                >删除</el-button
              >
            </div>

            <el-form-item label="入口 ID">
              <el-input
                v-model.trim="item.id"
                maxlength="20"
                show-word-limit
                placeholder="例如：oa"
              />
            </el-form-item>

            <el-form-item label="标题">
              <el-input
                v-model.trim="item.title"
                maxlength="20"
                show-word-limit
                placeholder="请输入入口标题"
              />
            </el-form-item>

            <el-form-item label="描述">
              <el-input
                v-model.trim="item.description"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
                maxlength="120"
                show-word-limit
                placeholder="请输入描述"
              />
            </el-form-item>

            <el-form-item label="图标">
              <el-input
                v-model.trim="item.icon"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 3 }"
                maxlength="120"
                show-word-limit
                placeholder="例如：ri:briefcase-4-line"
              />
            </el-form-item>

            <el-form-item label="图片（资源ID或URL）">
              <el-input
                v-model.trim="item.image"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 3 }"
                maxlength="300"
                show-word-limit
                placeholder="可选，优先于图标展示"
              />
            </el-form-item>

            <el-form-item label="角标文案">
              <el-input
                v-model.trim="item.badge"
                maxlength="20"
                show-word-limit
                placeholder="例如：常用"
              />
            </el-form-item>

            <PortalActionLinkField
              v-model="item.link"
              path-label="跳转路径"
              path-placeholder="例如：/oa/workbench 或 https://example.com"
              param-key-label="携带参数 key"
              param-key-placeholder="例如：app"
              value-key-label="参数取值字段 key"
              value-key-placeholder="例如：id"
            />
          </div>
        </div>

        <el-button type="primary" plain :icon="Plus" @click="addItem">新增入口</el-button>
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
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';
import {
  createDefaultPortalLinkConfig,
  mergePortalLinkConfig,
  type PortalLinkConfig
} from '../common/portal-link';

interface EntranceItemModel {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  badge: string;
  linkPath?: string;
  linkParamKey?: string;
  linkValueKey?: string;
  openType?: PortalLinkConfig['openType'];
  link: PortalLinkConfig;
}

interface AppEntranceContentData {
  container: UnifiedContainerContentConfigModel;
  entrance: {
    columnCount: number;
    showDescription: boolean;
    items: EntranceItemModel[];
  };
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<AppEntranceContentData>({
  name: 'app-entrance-content',
  sections: {
    container: {},
    entrance: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

function createItem(seed: number): EntranceItemModel {
  return {
    id: `app-${Date.now()}-${seed}`,
    title: `入口${seed}`,
    description: '',
    icon: 'ri:apps-2-line',
    image: '',
    badge: '',
    link: createDefaultPortalLinkConfig()
  };
}

function normalizeItem(item: Partial<EntranceItemModel>, index: number): EntranceItemModel {
  const fallbackLink = {
    path: item.linkPath,
    paramKey: item.linkParamKey,
    valueKey: item.linkValueKey,
    openType: item.openType
  };

  return {
    id: String(item.id || `app-${index + 1}`),
    title: String(item.title || `入口${index + 1}`),
    description: String(item.description || ''),
    icon: String(item.icon || ''),
    image: String(item.image || ''),
    badge: String(item.badge || ''),
    link: mergePortalLinkConfig(item.link || fallbackLink)
  };
}

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.entrance = {
  columnCount: Math.min(6, Math.max(1, Number(sectionData.entrance?.columnCount) || 4)),
  showDescription: sectionData.entrance?.showDescription !== false,
  items: Array.isArray(sectionData.entrance?.items)
    ? sectionData.entrance.items.map((item, index) => normalizeItem(item, index))
    : [createItem(1), createItem(2)]
};

const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
if (!sectionData.container.title.trim()) {
  sectionData.container.title = '应用入口';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '集中展示常用业务入口';
}
if (!sectionData.container.externalLinkText.trim()) {
  sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
}

function addItem() {
  sectionData.entrance.items.push(createItem(sectionData.entrance.items.length + 1));
}

function removeItem(index: number) {
  sectionData.entrance.items.splice(index, 1);
}

defineOptions({
  name: 'app-entrance-content'
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
