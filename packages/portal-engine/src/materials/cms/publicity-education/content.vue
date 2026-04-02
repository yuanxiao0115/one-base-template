<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form v-loading="categoryLoading" label-position="top">
      <ObCard title="标签栏目">
        <div class="tab-list">
          <div v-for="(tab, index) in sectionData.publicity.tabs" :key="tab.id" class="tab-card">
            <div class="tab-card__header">
              <span>标签 {{ index + 1 }}</span>
              <el-button
                text
                type="danger"
                :icon="Delete"
                :disabled="sectionData.publicity.tabs.length <= 1"
                @click="removeTab(index)"
              >
                删除
              </el-button>
            </div>

            <el-form-item label="标签名称">
              <el-input
                v-model.trim="tab.name"
                maxlength="10"
                show-word-limit
                placeholder="请输入标签名称"
              />
            </el-form-item>

            <el-form-item label="栏目">
              <el-tree-select
                v-model="tab.categoryId"
                :data="categoryOptions"
                node-key="id"
                check-strictly
                filterable
                class="w-full"
                placeholder="请选择栏目"
                :props="treeProps"
              />
            </el-form-item>
          </div>
        </div>

        <el-button
          type="primary"
          plain
          :icon="Plus"
          :disabled="sectionData.publicity.tabs.length >= 8"
          @click="addTab"
        >
          新增标签
        </el-button>
      </ObCard>

      <ObCard title="数据设置">
        <el-form-item label="轮播图最大条数">
          <el-input-number
            v-model="sectionData.publicity.carouselMaxItems"
            :min="1"
            :max="20"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="文章最大条数">
          <el-input-number
            v-model="sectionData.publicity.listMaxItems"
            :min="1"
            :max="20"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="自动播放">
          <el-switch v-model="sectionData.publicity.autoplay" />
        </el-form-item>

        <el-form-item v-if="sectionData.publicity.autoplay" label="轮播间隔(毫秒)">
          <el-input-number
            v-model="sectionData.publicity.interval"
            :min="1000"
            :max="10000"
            :step="500"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="显示指示器">
          <el-switch v-model="sectionData.publicity.indicator" />
        </el-form-item>

        <el-form-item label="箭头显示">
          <el-segmented
            v-model="sectionData.publicity.arrow"
            :options="[
              { label: '悬停', value: 'hover' },
              { label: '始终', value: 'always' },
              { label: '不显示', value: 'never' }
            ]"
          />
        </el-form-item>

        <el-form-item label="显示列表圆点">
          <el-switch v-model="sectionData.publicity.showRowDot" />
        </el-form-item>

        <el-form-item label="显示列表分割线">
          <el-switch v-model="sectionData.publicity.showRowDivider" />
        </el-form-item>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue';
import { ObCard } from '@one-base-template/ui';
import { ref } from 'vue';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import { cmsApi } from '../../api';
import {
  UnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';

interface PublicityTabConfig {
  id: string;
  name: string;
  categoryId: string;
}

interface PublicityConfig {
  tabs: PublicityTabConfig[];
  activeTabId: string;
  carouselMaxItems: number;
  listMaxItems: number;
  autoplay: boolean;
  interval: number;
  indicator: boolean;
  arrow: 'always' | 'hover' | 'never';
  showRowDot: boolean;
  showRowDivider: boolean;
}

interface PublicityEducationContentData {
  container: UnifiedContainerContentConfigModel;
  publicity: PublicityConfig;
}

const DEFAULT_TABS: PublicityTabConfig[] = [
  { id: 'tab-1', name: '政治理论', categoryId: '' },
  { id: 'tab-2', name: '法制宣传', categoryId: '' },
  { id: 'tab-3', name: '反诈与防范', categoryId: '' }
];

const DEFAULT_PUBLICITY: PublicityConfig = {
  tabs: DEFAULT_TABS,
  activeTabId: 'tab-1',
  carouselMaxItems: 5,
  listMaxItems: 5,
  autoplay: true,
  interval: 3000,
  indicator: false,
  arrow: 'hover',
  showRowDot: true,
  showRowDivider: true
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<PublicityEducationContentData>({
  name: 'cms-publicity-education-content',
  sections: {
    container: {
      defaultValue: {
        showTitle: true,
        title: '分页签图文轮播',
        subtitle: '按栏目展示图文与资讯',
        icon: 'ri:book-open-line'
      }
    },
    publicity: {
      defaultValue: DEFAULT_PUBLICITY
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.publicity = {
  tabs: normalizeTabs(sectionData.publicity?.tabs),
  activeTabId: String(sectionData.publicity?.activeTabId || 'tab-1'),
  carouselMaxItems: clampInteger(sectionData.publicity?.carouselMaxItems, 5, 1, 20),
  listMaxItems: clampInteger(sectionData.publicity?.listMaxItems, 5, 1, 20),
  autoplay: sectionData.publicity?.autoplay !== false,
  interval: clampInteger(sectionData.publicity?.interval, 3000, 1000, 10000),
  indicator: sectionData.publicity?.indicator === true,
  arrow: normalizeArrow(sectionData.publicity?.arrow),
  showRowDot: sectionData.publicity?.showRowDot !== false,
  showRowDivider: sectionData.publicity?.showRowDivider !== false
};

if (!sectionData.publicity.tabs.some((tab) => tab.id === sectionData.publicity.activeTabId)) {
  sectionData.publicity.activeTabId = sectionData.publicity.tabs[0]?.id || 'tab-1';
}

const categoryLoading = ref(false);
const categoryOptions = ref<any[]>([]);

const treeProps = {
  label: 'categoryName',
  children: 'children'
};

void loadCategoryTree();

function normalizeArrow(value: unknown): PublicityConfig['arrow'] {
  if (value === 'always' || value === 'never') {
    return value;
  }
  return 'hover';
}

function clampInteger(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const integerValue = Math.floor(parsed);
  return Math.min(max, Math.max(min, integerValue));
}

function normalizeTabs(value: unknown): PublicityTabConfig[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_TABS.map((item) => ({ ...item }));
  }

  const normalized = value
    .slice(0, 8)
    .map((item, index) => {
      const source = (item || {}) as Record<string, unknown>;
      return {
        id: String(source.id || `tab-${index + 1}`),
        name: String(source.name || `标签${index + 1}`),
        categoryId: String(source.categoryId || '')
      };
    })
    .filter((item) => item.name.trim().length > 0);

  return normalized.length > 0 ? normalized : DEFAULT_TABS.map((item) => ({ ...item }));
}

function addTab() {
  const nextIndex = sectionData.publicity.tabs.length + 1;
  sectionData.publicity.tabs.push({
    id: `tab-${Date.now()}-${nextIndex}`,
    name: `标签${nextIndex}`,
    categoryId: ''
  });
}

function removeTab(index: number) {
  const removedTabId = sectionData.publicity.tabs[index]?.id;
  sectionData.publicity.tabs.splice(index, 1);

  if (
    removedTabId &&
    sectionData.publicity.activeTabId === removedTabId &&
    sectionData.publicity.tabs.length > 0
  ) {
    sectionData.publicity.activeTabId = sectionData.publicity.tabs[0]?.id || '';
  }
}

async function loadCategoryTree() {
  categoryLoading.value = true;
  try {
    const response = (await cmsApi.getCategoryTree()) as any;
    if (response?.code === 200 && Array.isArray(response?.data)) {
      categoryOptions.value = response.data;
    } else {
      categoryOptions.value = [];
    }
  } catch (error) {
    console.error('[portal-engine] 获取宣传教育栏目失败：', error);
    categoryOptions.value = [];
  } finally {
    categoryLoading.value = false;
  }
}

defineOptions({
  name: 'cms-publicity-education-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tab-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 10px;
}

.tab-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}

.tab-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 13px;
}
</style>
