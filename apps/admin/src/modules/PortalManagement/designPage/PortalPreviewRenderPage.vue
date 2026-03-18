<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  createPortalPreviewDataSource,
  PortalPreviewPanel,
  usePortalPreviewPageByRoute,
  type PortalPreviewDataSource,
  type PortalPreviewRouteQueryLike,
  type PortalPreviewRouteParamsLike
} from '@one-base-template/portal-engine';

import { portalApi } from '../api';
import { useRendererMaterials } from '../materials/useRendererMaterials';

defineOptions({
  name: 'PortalPreview'
});

const route = useRoute();
const router = useRouter();
const { materialsMap } = useRendererMaterials();
const routeQuery = computed(() => route.query as PortalPreviewRouteQueryLike);
const routeParams = computed(() => route.params as PortalPreviewRouteParamsLike);

const { tabId, templateId, previewMode, previewViewport, onNavigate } = usePortalPreviewPageByRoute(
  {
    routeQuery,
    routeParams,
    replaceRouteQuery: (nextQuery) =>
      router.replace({
        query: nextQuery
      }),
    onReplaceRouteQueryError: (error) => {
      console.warn('[PortalPreviewRenderPage] 更新预览 query 失败', error);
    }
  }
);

const previewDataSource: PortalPreviewDataSource = createPortalPreviewDataSource({
  getPublicTabDetail: (id: string) => portalApi.tabPublic.detail({ id }),
  getTabDetail: (id: string) => portalApi.tab.detail({ id }),
  getTemplateDetail: (id: string) => portalApi.template.detail({ id })
});
</script>

<template>
  <PortalPreviewPanel
    :tab-id="tabId"
    :template-id="templateId"
    :preview-data-source="previewDataSource"
    :materials-map="materialsMap"
    :on-navigate="onNavigate"
    :listen-message="true"
    :preview-mode="previewMode"
    :viewport-width="previewViewport.width"
    :viewport-height="previewViewport.height"
  />
</template>
