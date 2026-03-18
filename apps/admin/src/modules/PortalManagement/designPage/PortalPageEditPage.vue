<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from '@one-base-template/ui';
import {
  PortalPageDesignerLayout,
  type PortalDesignerRouteQueryLike,
  usePortalPageDesignerRoute
} from '@one-base-template/portal-engine/designer';

import { portalApi } from '../api';
import { usePortalMaterials } from '../materials/usePortalMaterials';

defineOptions({
  name: 'PortalPageEditor'
});

const route = useRoute();
const router = useRouter();

const { categories: materialCategories, materialsMap } = usePortalMaterials('editor');
const routeQuery = computed(() => route.query as PortalDesignerRouteQueryLike);

const {
  tabId,
  templateId,
  backRouteLocation,
  controller: workbench
} = usePortalPageDesignerRoute({
  routeQuery,
  api: {
    tab: {
      detail: portalApi.tab.detail,
      update: portalApi.tab.update
    }
  },
  notify: {
    success: (text) => message.success(text),
    error: (text) => message.error(text),
    warning: (text) => message.warning(text)
  },
  resolveRouteHref: ({ name, query }) =>
    router.resolve({
      name,
      query
    }).href
});

const { loading, saving, previewLoading, tabName, pageSettingData, savePage, previewPage } =
  workbench;

function onBack() {
  router.push(backRouteLocation.value);
}
</script>

<template>
  <PortalPageDesignerLayout
    :loading="loading"
    :saving="saving"
    :preview-loading="previewLoading"
    :title="tabName || '页面编辑'"
    :meta="`templateId ${templateId || '-'} · tabId ${tabId || '-'}`"
    :page-setting-data="pageSettingData"
    :materials-map="materialsMap"
    :categories="materialCategories"
    @back="onBack"
    @save="savePage"
    @preview="previewPage"
  />
</template>
