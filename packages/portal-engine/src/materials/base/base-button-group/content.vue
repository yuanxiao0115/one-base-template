<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="按钮组配置">
        <el-form-item label="排列方向">
          <el-segmented
            v-model="sectionData.buttons.direction"
            :options="[
              { label: '横向', value: 'row' },
              { label: '纵向', value: 'column' }
            ]"
          />
        </el-form-item>

        <el-form-item label="对齐方式">
          <el-segmented
            v-model="sectionData.buttons.align"
            :options="[
              { label: '左', value: 'left' },
              { label: '中', value: 'center' },
              { label: '右', value: 'right' }
            ]"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="按钮列表">
        <div class="item-list">
          <div v-for="(item, index) in sectionData.buttons.items" :key="item.id" class="item-card">
            <div class="item-card__header">
              <span>按钮 {{ index + 1 }}</span>
              <el-button text type="danger" :icon="Delete" @click="removeItem(index)"
                >删除</el-button
              >
            </div>

            <el-form-item label="按钮 ID">
              <el-input
                v-model.trim="item.id"
                maxlength="20"
                show-word-limit
                placeholder="例如：button-1"
              />
            </el-form-item>

            <el-form-item label="按钮文本">
              <el-input
                v-model.trim="item.text"
                maxlength="20"
                show-word-limit
                placeholder="请输入按钮文案"
              />
            </el-form-item>

            <el-form-item label="按钮类型">
              <el-select v-model="item.type">
                <el-option label="default" value="default" />
                <el-option label="primary" value="primary" />
                <el-option label="success" value="success" />
                <el-option label="warning" value="warning" />
                <el-option label="danger" value="danger" />
                <el-option label="info" value="info" />
              </el-select>
            </el-form-item>

            <el-form-item label="朴素按钮">
              <el-switch v-model="item.plain" />
            </el-form-item>

            <el-form-item label="圆角按钮">
              <el-switch v-model="item.round" />
            </el-form-item>

            <PortalActionLinkField v-model="item.link" />
          </div>
        </div>

        <el-button type="primary" plain :icon="Plus" @click="addItem">新增按钮</el-button>
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

type ButtonDirectionType = 'row' | 'column';
type ButtonAlignType = 'left' | 'center' | 'right';
type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface ButtonItem {
  id: string;
  text: string;
  type: ButtonType;
  plain: boolean;
  round: boolean;
  linkPath?: string;
  linkParamKey?: string;
  linkValueKey?: string;
  openType?: PortalLinkConfig['openType'];
  link: PortalLinkConfig;
}

interface BaseButtonGroupContentData {
  container: UnifiedContainerContentConfigModel;
  buttons: {
    direction: ButtonDirectionType;
    align: ButtonAlignType;
    items: ButtonItem[];
  };
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseButtonGroupContentData>({
  name: 'base-button-group-content',
  sections: {
    container: {},
    buttons: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

function createButtonItem(seed: number): ButtonItem {
  return {
    id: `button-${Date.now()}-${seed}`,
    text: `按钮${seed}`,
    type: 'default',
    plain: false,
    round: false,
    link: createDefaultPortalLinkConfig()
  };
}

function normalizeButtonItem(item: Partial<ButtonItem>, index: number): ButtonItem {
  const type: ButtonType =
    item.type === 'primary' ||
    item.type === 'success' ||
    item.type === 'warning' ||
    item.type === 'danger' ||
    item.type === 'info'
      ? item.type
      : 'default';

  return {
    id: String(item.id || `button-${index + 1}`),
    text: String(item.text || `按钮${index + 1}`),
    type,
    plain: item.plain === true,
    round: item.round === true,
    link: mergePortalLinkConfig(
      item.link || {
        path: item.linkPath,
        paramKey: item.linkParamKey,
        valueKey: item.linkValueKey,
        openType: item.openType
      }
    )
  };
}

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.buttons = {
  direction: sectionData.buttons?.direction === 'column' ? 'column' : 'row',
  align:
    sectionData.buttons?.align === 'center' || sectionData.buttons?.align === 'right'
      ? sectionData.buttons.align
      : 'left',
  items: Array.isArray(sectionData.buttons?.items)
    ? sectionData.buttons.items.map((item, index) => normalizeButtonItem(item, index))
    : [createButtonItem(1), createButtonItem(2)]
};

const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
if (!sectionData.container.title.trim()) {
  sectionData.container.title = '按钮组';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '支持业务动作和链接跳转';
}
if (!sectionData.container.externalLinkText.trim()) {
  sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
}

function addItem() {
  sectionData.buttons.items.push(createButtonItem(sectionData.buttons.items.length + 1));
}

function removeItem(index: number) {
  sectionData.buttons.items.splice(index, 1);
}

defineOptions({
  name: 'base-button-group-content'
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
