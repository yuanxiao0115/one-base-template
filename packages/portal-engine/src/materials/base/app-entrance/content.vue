<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <PortalDataSourceCard
        v-model="sectionData.dataSource"
        static-json-placeholder='例如：[{"id":"app-1","title":"应用","icon":"ri:apps-2-line","link":{"path":"/portal/index","openType":"router"}}]'
      />

      <ObCard title="字段映射">
        <el-form-item label="主键字段 key">
          <el-input v-model.trim="sectionData.entrance.idKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="标题字段 key">
          <el-input v-model.trim="sectionData.entrance.titleKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="描述字段 key">
          <el-input
            v-model.trim="sectionData.entrance.descriptionKey"
            maxlength="40"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="图标字段 key">
          <el-input v-model.trim="sectionData.entrance.iconKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="图片字段 key">
          <el-input v-model.trim="sectionData.entrance.imageKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="角标字段 key">
          <el-input v-model.trim="sectionData.entrance.badgeKey" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="跳转配置字段 key">
          <el-input v-model.trim="sectionData.entrance.linkKey" maxlength="40" show-word-limit />
        </el-form-item>
      </ObCard>

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
        <div class="item-list__tip">数据源加载失败时，将使用以下入口列表作为兜底。</div>
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
import PortalDataSourceCard from '../common/PortalDataSourceCard.vue';
import {
  createDefaultPortalDataSourceModel,
  mergePortalDataSourceModel,
  type PortalDataSourceModel
} from '../common/portal-data-source';
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
  dataSource: PortalDataSourceModel;
  entrance: {
    columnCount: number;
    showDescription: boolean;
    idKey: string;
    titleKey: string;
    descriptionKey: string;
    iconKey: string;
    imageKey: string;
    badgeKey: string;
    linkKey: string;
    items: EntranceItemModel[];
  };
}

const DEFAULT_ENTRANCE_ITEMS: EntranceItemModel[] = [
  {
    id: 'entry-1',
    title: '门户首页',
    description: '前往门户首页',
    icon: 'ri:home-5-line',
    image: '',
    badge: '常用',
    link: {
      path: '/portal/index',
      paramKey: 'id',
      valueKey: 'id',
      openType: 'router'
    }
  },
  {
    id: 'entry-2',
    title: '通知公告',
    description: '查看最新通知',
    icon: 'ri:notification-3-line',
    image: '',
    badge: '',
    link: {
      path: '/portal/notice',
      paramKey: 'id',
      valueKey: 'id',
      openType: 'router'
    }
  }
];

const DEFAULT_DATA_SOURCE = {
  ...createDefaultPortalDataSourceModel(),
  staticRowsJson: JSON.stringify(DEFAULT_ENTRANCE_ITEMS, null, 2)
};

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
    dataSource: {
      defaultValue: DEFAULT_DATA_SOURCE
    },
    entrance: {
      defaultValue: {
        columnCount: 4,
        showDescription: false,
        idKey: 'id',
        titleKey: 'title',
        descriptionKey: 'description',
        iconKey: 'icon',
        imageKey: 'image',
        badgeKey: 'badge',
        linkKey: 'link',
        items: DEFAULT_ENTRANCE_ITEMS
      }
    }
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
sectionData.dataSource = mergePortalDataSourceModel(sectionData.dataSource);
if (!sectionData.dataSource.staticRowsJson.trim()) {
  sectionData.dataSource.staticRowsJson = DEFAULT_DATA_SOURCE.staticRowsJson;
}
sectionData.entrance = {
  columnCount: Math.min(6, Math.max(1, Number(sectionData.entrance?.columnCount) || 4)),
  showDescription: sectionData.entrance?.showDescription === true,
  idKey:
    typeof sectionData.entrance?.idKey === 'string' && sectionData.entrance.idKey.trim().length
      ? sectionData.entrance.idKey
      : 'id',
  titleKey:
    typeof sectionData.entrance?.titleKey === 'string' &&
    sectionData.entrance.titleKey.trim().length
      ? sectionData.entrance.titleKey
      : 'title',
  descriptionKey:
    typeof sectionData.entrance?.descriptionKey === 'string' &&
    sectionData.entrance.descriptionKey.trim().length
      ? sectionData.entrance.descriptionKey
      : 'description',
  iconKey:
    typeof sectionData.entrance?.iconKey === 'string' && sectionData.entrance.iconKey.trim().length
      ? sectionData.entrance.iconKey
      : 'icon',
  imageKey:
    typeof sectionData.entrance?.imageKey === 'string' &&
    sectionData.entrance.imageKey.trim().length
      ? sectionData.entrance.imageKey
      : 'image',
  badgeKey:
    typeof sectionData.entrance?.badgeKey === 'string' &&
    sectionData.entrance.badgeKey.trim().length
      ? sectionData.entrance.badgeKey
      : 'badge',
  linkKey:
    typeof sectionData.entrance?.linkKey === 'string' && sectionData.entrance.linkKey.trim().length
      ? sectionData.entrance.linkKey
      : 'link',
  items: Array.isArray(sectionData.entrance?.items)
    ? sectionData.entrance.items.map((item, index) => normalizeItem(item, index))
    : DEFAULT_ENTRANCE_ITEMS.map((item, index) => normalizeItem(item, index))
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

.item-list__tip {
  margin-bottom: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
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
