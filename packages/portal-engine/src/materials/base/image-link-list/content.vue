<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="列表配置">
        <el-form-item label="单行列数">
          <el-input-number
            v-model="sectionData.list.columnCount"
            :min="1"
            :max="4"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="显示描述">
          <el-switch v-model="sectionData.list.showDescription" />
        </el-form-item>
      </ObCard>

      <ObCard title="图文项">
        <div class="item-list">
          <div v-for="(item, index) in sectionData.list.items" :key="item.id" class="item-card">
            <div class="item-card__header">
              <span>图文 {{ index + 1 }}</span>
              <el-button text type="danger" :icon="Delete" @click="removeItem(index)"
                >删除</el-button
              >
            </div>

            <el-form-item label="项 ID">
              <el-input
                v-model.trim="item.id"
                maxlength="20"
                show-word-limit
                placeholder="例如：img-1"
              />
            </el-form-item>

            <el-form-item label="标题">
              <el-input
                v-model.trim="item.title"
                maxlength="20"
                show-word-limit
                placeholder="请输入标题"
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

            <el-form-item label="图片（资源ID或URL）">
              <el-input
                v-model.trim="item.image"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 3 }"
                maxlength="300"
                show-word-limit
                placeholder="例如：abc123 或 https://cdn.demo.com/1.png"
              />
            </el-form-item>

            <el-form-item label="标签文案">
              <el-input
                v-model.trim="item.tag"
                maxlength="20"
                show-word-limit
                placeholder="例如：推荐"
              />
            </el-form-item>

            <PortalActionLinkField v-model="item.link" />
          </div>
        </div>

        <el-button type="primary" plain :icon="Plus" @click="addItem">新增图文项</el-button>
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

interface ImageLinkItem {
  id: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  link: PortalLinkConfig;
}

interface ImageLinkListContentData {
  container: UnifiedContainerContentConfigModel;
  list: {
    columnCount: number;
    showDescription: boolean;
    items: ImageLinkItem[];
  };
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<ImageLinkListContentData>({
  name: 'image-link-list-content',
  sections: {
    container: {},
    list: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

function createItem(seed: number): ImageLinkItem {
  return {
    id: `img-${Date.now()}-${seed}`,
    title: `图文${seed}`,
    description: '',
    image: '',
    tag: '',
    link: createDefaultPortalLinkConfig()
  };
}

function normalizeItem(item: Partial<ImageLinkItem>, index: number): ImageLinkItem {
  return {
    id: String(item.id || `img-${index + 1}`),
    title: String(item.title || `图文${index + 1}`),
    description: String(item.description || ''),
    image: String(item.image || ''),
    tag: String(item.tag || ''),
    link: mergePortalLinkConfig(item.link)
  };
}

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.list = {
  columnCount: Math.min(4, Math.max(1, Number(sectionData.list?.columnCount) || 3)),
  showDescription: sectionData.list?.showDescription !== false,
  items: Array.isArray(sectionData.list?.items)
    ? sectionData.list.items.map((item, index) => normalizeItem(item, index))
    : [createItem(1), createItem(2)]
};

const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
if (!sectionData.container.title.trim()) {
  sectionData.container.title = '图文链接列表';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '图片+标题组合导航';
}
if (!sectionData.container.externalLinkText.trim()) {
  sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
}

function addItem() {
  sectionData.list.items.push(createItem(sectionData.list.items.length + 1));
}

function removeItem(index: number) {
  sectionData.list.items.splice(index, 1);
}

defineOptions({
  name: 'image-link-list-content'
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
