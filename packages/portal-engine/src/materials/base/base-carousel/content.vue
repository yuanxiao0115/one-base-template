<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="轮播配置">
        <el-form-item label="自动播放">
          <el-switch v-model="sectionData.carousel.autoplay" />
        </el-form-item>

        <el-form-item label="自动播放间隔(ms)">
          <el-input-number
            v-model="sectionData.carousel.interval"
            :min="1000"
            :max="60000"
            :step="500"
            controls-position="right"
            :disabled="!sectionData.carousel.autoplay"
          />
        </el-form-item>

        <el-form-item label="触发方式">
          <el-select v-model="sectionData.carousel.trigger">
            <el-option label="hover" value="hover" />
            <el-option label="click" value="click" />
          </el-select>
        </el-form-item>

        <el-form-item label="箭头显示">
          <el-select v-model="sectionData.carousel.arrow">
            <el-option label="hover" value="hover" />
            <el-option label="always" value="always" />
            <el-option label="never" value="never" />
          </el-select>
        </el-form-item>

        <el-form-item label="指示器位置">
          <el-select v-model="sectionData.carousel.indicatorPosition">
            <el-option label="outside" value="outside" />
            <el-option label="none" value="none" />
          </el-select>
        </el-form-item>
      </ObCard>

      <ObCard title="轮播项">
        <div class="item-list">
          <div v-if="!sectionData.carousel.items.length" class="item-empty">
            暂无轮播项，请点击“新增轮播项”。
          </div>

          <div v-for="(item, index) in sectionData.carousel.items" :key="item.id" class="item-card">
            <div class="item-card__header">
              <span>轮播项 {{ index + 1 }}</span>
              <el-button text type="danger" :icon="Delete" @click="removeItem(index)"
                >删除</el-button
              >
            </div>

            <el-form-item label="图片">
              <SelectImg v-model="item.image" />
            </el-form-item>

            <el-form-item label="标题">
              <el-input
                v-model.trim="item.title"
                maxlength="40"
                show-word-limit
                placeholder="请输入标题"
              />
            </el-form-item>

            <el-form-item label="副标题">
              <el-input
                v-model.trim="item.subtitle"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
                maxlength="120"
                show-word-limit
                placeholder="请输入副标题"
              />
            </el-form-item>

            <el-form-item label="跳转链接">
              <el-input
                v-model.trim="item.linkUrl"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 3 }"
                maxlength="240"
                show-word-limit
                placeholder="支持站内路径或完整URL"
              />
            </el-form-item>

            <el-form-item label="新窗口打开">
              <el-switch v-model="item.openInNewTab" :disabled="!item.linkUrl" />
            </el-form-item>
          </div>
        </div>

        <el-button type="primary" plain :icon="Plus" @click="addItem">新增轮播项</el-button>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue';
import { ObCard } from '@one-base-template/ui';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import SelectImg from '../../SelectImg.vue';
import {
  UnifiedContainerContentConfig,
  createDefaultUnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';

type TriggerType = 'hover' | 'click';
type ArrowType = 'always' | 'hover' | 'never';
type IndicatorPositionType = 'outside' | 'none';

interface CarouselItemModel {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  openInNewTab: boolean;
}

interface CarouselContentModel {
  autoplay: boolean;
  interval: number;
  trigger: TriggerType;
  arrow: ArrowType;
  indicatorPosition: IndicatorPositionType;
  items: CarouselItemModel[];
}

interface BaseCarouselContentData {
  container: UnifiedContainerContentConfigModel;
  carousel: CarouselContentModel;
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseCarouselContentData>({
  name: 'base-carousel-content',
  sections: {
    container: {},
    carousel: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

function createItem(seed: number): CarouselItemModel {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${seed}`;
  return {
    id: `slide-${uid}`,
    image: '',
    title: `轮播标题 ${seed}`,
    subtitle: '',
    linkUrl: '',
    openInNewTab: false
  };
}

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);

const rawItems = Array.isArray(sectionData.carousel?.items) ? sectionData.carousel.items : [];
sectionData.carousel = {
  autoplay: sectionData.carousel?.autoplay !== false,
  interval:
    Number(sectionData.carousel?.interval) >= 1000 ? Number(sectionData.carousel.interval) : 4000,
  trigger: sectionData.carousel?.trigger === 'click' ? 'click' : 'hover',
  arrow:
    sectionData.carousel?.arrow === 'always' ||
    sectionData.carousel?.arrow === 'hover' ||
    sectionData.carousel?.arrow === 'never'
      ? sectionData.carousel.arrow
      : 'hover',
  indicatorPosition: sectionData.carousel?.indicatorPosition === 'none' ? 'none' : 'outside',
  items:
    rawItems.length > 0
      ? rawItems.map((item, index) => ({
          id: String(item.id || `slide-${index + 1}`),
          image: String(item.image || ''),
          title: String(item.title || ''),
          subtitle: String(item.subtitle || ''),
          linkUrl: String(item.linkUrl || ''),
          openInNewTab: item.openInNewTab === true
        }))
      : [createItem(1), createItem(2)]
};

const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
if (!sectionData.container.title.trim()) {
  sectionData.container.title = '轮播图';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '支持多图轮播、标题与跳转';
}
if (!sectionData.container.externalLinkText.trim()) {
  sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
}

function addItem() {
  sectionData.carousel.items.push(createItem(sectionData.carousel.items.length + 1));
}

function removeItem(index: number) {
  sectionData.carousel.items.splice(index, 1);
}

defineOptions({
  name: 'base-carousel-content'
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

.item-empty {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  color: #64748b;
  background: #f8fafc;
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
