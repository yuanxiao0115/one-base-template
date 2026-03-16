<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="Iframe内容">
        <el-form-item label="嵌入链接">
          <el-input
            v-model.trim="sectionData.iframe.src"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            maxlength="600"
            show-word-limit
            placeholder="请输入可嵌入链接，例如：https://example.com 或 /portal/page/123"
          />
        </el-form-item>

        <el-form-item label="页面标题(title)">
          <el-input
            v-model.trim="sectionData.iframe.title"
            maxlength="80"
            show-word-limit
            placeholder="用于无障碍与页面识别"
          />
        </el-form-item>

        <el-form-item label="加载策略">
          <el-radio-group v-model="sectionData.iframe.loading">
            <el-radio label="lazy">懒加载</el-radio>
            <el-radio label="eager">立即加载</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="允许全屏">
          <el-switch v-model="sectionData.iframe.allowFullscreen" />
        </el-form-item>

        <el-form-item label="allow 属性">
          <el-input
            v-model.trim="sectionData.iframe.allow"
            maxlength="200"
            show-word-limit
            placeholder="例如：fullscreen; clipboard-read; clipboard-write"
          />
        </el-form-item>

        <el-form-item label="sandbox 属性">
          <el-input
            v-model.trim="sectionData.iframe.sandbox"
            maxlength="260"
            show-word-limit
            placeholder="可选，例如：allow-scripts allow-same-origin"
          />
        </el-form-item>

        <el-form-item label="Referrer Policy">
          <el-select v-model="sectionData.iframe.referrerPolicy">
            <el-option label="no-referrer" value="no-referrer" />
            <el-option label="origin" value="origin" />
            <el-option label="strict-origin" value="strict-origin" />
            <el-option label="origin-when-cross-origin" value="origin-when-cross-origin" />
            <el-option
              label="strict-origin-when-cross-origin"
              value="strict-origin-when-cross-origin"
            />
            <el-option label="no-referrer-when-downgrade" value="no-referrer-when-downgrade" />
            <el-option label="unsafe-url" value="unsafe-url" />
          </el-select>
        </el-form-item>

        <div class="tip">
          提示：若目标站点设置了 X-Frame-Options 或 CSP frame-ancestors，浏览器会阻止内嵌展示。
        </div>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ObCard } from '@one-base-template/ui';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import {
  UnifiedContainerContentConfig,
  createDefaultUnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';

type LoadingType = 'lazy' | 'eager';
type IframeReferrerPolicy =
  | 'no-referrer'
  | 'origin'
  | 'strict-origin'
  | 'origin-when-cross-origin'
  | 'strict-origin-when-cross-origin'
  | 'no-referrer-when-downgrade'
  | 'unsafe-url';

interface BaseIframeContentData {
  container: UnifiedContainerContentConfigModel;
  iframe: {
    src: string;
    title: string;
    loading: LoadingType;
    allowFullscreen: boolean;
    allow: string;
    sandbox: string;
    referrerPolicy: IframeReferrerPolicy;
  };
}

function normalizeReferrerPolicy(value: unknown): IframeReferrerPolicy {
  switch (value) {
    case 'no-referrer':
    case 'origin':
    case 'strict-origin':
    case 'origin-when-cross-origin':
    case 'strict-origin-when-cross-origin':
    case 'no-referrer-when-downgrade':
    case 'unsafe-url':
      return value;
    default:
      return 'no-referrer-when-downgrade';
  }
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseIframeContentData>({
  name: 'base-iframe-container-content',
  sections: {
    container: {},
    iframe: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.iframe = {
  src: typeof sectionData.iframe?.src === 'string' ? sectionData.iframe.src : '',
  title:
    typeof sectionData.iframe?.title === 'string' && sectionData.iframe.title.trim()
      ? sectionData.iframe.title
      : '内嵌页面',
  loading: sectionData.iframe?.loading === 'eager' ? 'eager' : 'lazy',
  allowFullscreen: sectionData.iframe?.allowFullscreen !== false,
  allow: typeof sectionData.iframe?.allow === 'string' ? sectionData.iframe.allow : 'fullscreen',
  sandbox: typeof sectionData.iframe?.sandbox === 'string' ? sectionData.iframe.sandbox : '',
  referrerPolicy: normalizeReferrerPolicy(sectionData.iframe?.referrerPolicy)
};

const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
if (!sectionData.container.title.trim()) {
  sectionData.container.title = 'Iframe容器';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '支持内嵌自定义链接页面';
}
if (!sectionData.container.externalLinkText.trim()) {
  sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
}

defineOptions({
  name: 'base-iframe-container-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip {
  font-size: 12px;
  color: #64748b;
}
</style>
