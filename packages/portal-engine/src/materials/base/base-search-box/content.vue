<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="搜索配置">
        <el-form-item label="输入占位文案">
          <el-input
            v-model.trim="sectionData.search.placeholder"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            maxlength="100"
            show-word-limit
            placeholder="请输入占位文案"
          />
        </el-form-item>

        <el-form-item label="按钮文案">
          <el-input
            v-model.trim="sectionData.search.buttonText"
            maxlength="20"
            show-word-limit
            placeholder="例如：搜索"
          />
        </el-form-item>

        <el-form-item label="默认关键字">
          <el-input
            v-model.trim="sectionData.search.defaultKeyword"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            maxlength="100"
            show-word-limit
            placeholder="可选，页面初始关键字"
          />
        </el-form-item>

        <el-form-item label="关键字参数 key">
          <el-input
            v-model.trim="sectionData.search.keywordParamKey"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            maxlength="60"
            show-word-limit
            placeholder="例如：keyword"
          />
        </el-form-item>

        <PortalActionLinkField
          v-model="sectionData.search.link"
          path-label="搜索跳转路径"
          path-placeholder="例如：/portal/search 或 https://example.com/search"
          param-key-label="参数 key（会自动同步关键字参数 key）"
          value-key-label="参数取值字段 key"
          value-key-placeholder="固定为 keyword"
        />
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
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

interface BaseSearchBoxContentData {
  container: UnifiedContainerContentConfigModel;
  search: {
    placeholder: string;
    buttonText: string;
    defaultKeyword: string;
    keywordParamKey: string;
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
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseSearchBoxContentData>({
  name: 'base-search-box-content',
  sections: {
    container: {},
    search: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.search = {
  placeholder:
    typeof sectionData.search?.placeholder === 'string'
      ? sectionData.search.placeholder
      : '请输入关键字',
  buttonText:
    typeof sectionData.search?.buttonText === 'string' && sectionData.search.buttonText.trim()
      ? sectionData.search.buttonText
      : '搜索',
  defaultKeyword:
    typeof sectionData.search?.defaultKeyword === 'string' ? sectionData.search.defaultKeyword : '',
  keywordParamKey:
    typeof sectionData.search?.keywordParamKey === 'string' &&
    sectionData.search.keywordParamKey.trim()
      ? sectionData.search.keywordParamKey
      : 'keyword',
  link: mergePortalLinkConfig(
    sectionData.search?.link || {
      path: sectionData.search?.linkPath,
      paramKey: sectionData.search?.linkParamKey,
      valueKey: sectionData.search?.linkValueKey,
      openType: sectionData.search?.openType
    }
  )
};

if (!sectionData.search.link.path.trim()) {
  sectionData.search.link = {
    ...createDefaultPortalLinkConfig(),
    path: '/portal/search',
    paramKey: sectionData.search.keywordParamKey,
    valueKey: 'keyword',
    openType: 'router'
  };
}

if (sectionData.search.link.valueKey !== 'keyword') {
  sectionData.search.link.valueKey = 'keyword';
}

watch(
  () => sectionData.search.keywordParamKey,
  (value) => {
    const nextKey = String(value || '').trim() || 'keyword';
    sectionData.search.keywordParamKey = nextKey;
    sectionData.search.link.paramKey = nextKey;
    sectionData.search.link.valueKey = 'keyword';
  }
);

const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
if (!sectionData.container.title.trim()) {
  sectionData.container.title = '搜索框';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '支持关键字跳转';
}
if (!sectionData.container.externalLinkText.trim()) {
  sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
}

defineOptions({
  name: 'base-search-box-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
