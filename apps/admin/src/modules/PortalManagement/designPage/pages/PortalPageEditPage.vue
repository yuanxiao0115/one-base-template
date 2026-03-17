<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from '@one-base-template/ui';
import {
  PortalPageEditorWorkbench,
  usePageEditorWorkbenchByRoute,
  type PortalRouteQueryLike
} from '@one-base-template/portal-engine';

import { portalApi } from '../../api';
import { useEditorMaterials } from '../../materials/useEditorMaterials';

defineOptions({
  name: 'PortalPageEditor'
});

const route = useRoute();
const router = useRouter();

const { categories: materialCategories, materialsMap } = useEditorMaterials();
const routeQuery = computed(() => route.query as PortalRouteQueryLike);

const {
  tabId,
  templateId,
  backRouteLocation,
  controller: workbench
} = usePageEditorWorkbenchByRoute({
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
  <PortalPageEditorWorkbench
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
