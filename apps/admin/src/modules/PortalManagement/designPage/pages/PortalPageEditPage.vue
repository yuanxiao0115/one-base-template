<script setup lang="ts">
  import { computed } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { message } from "@one-base-template/ui";
  import {
    PortalPageEditorWorkbench,
    portalMaterialsRegistry,
    usePageEditorWorkbench,
  } from "@one-base-template/portal-engine";

  import { portalApi } from "../../api";
  import { useEditorMaterials } from "../../materials/useEditorMaterials";

  defineOptions({
    name: "PortalPageEditor",
  });

  const route = useRoute();
  const router = useRouter();

  const { materialsMap } = useEditorMaterials();
  const materialCategories = portalMaterialsRegistry.categories;

  const tabId = computed(() => {
    const v = route.query.tabId;
    return typeof v === "string" ? v : "";
  });

  const templateId = computed(() => {
    const id = route.query.id;
    if (typeof id === "string") {
      return id;
    }
    const templateId = route.query.templateId;
    return typeof templateId === "string" ? templateId : "";
  });

  const workbench = usePageEditorWorkbench({
    tabId,
    templateId,
    api: {
      tab: {
        detail: portalApi.tab.detail,
        update: portalApi.tab.update,
      },
    },
    notify: {
      success: (text) => message.success(text),
      error: (text) => message.error(text),
      warning: (text) => message.warning(text),
    },
    resolvePreviewHref: ({ tabId: nextTabId, templateId: nextTemplateId, previewMode }) =>
      router.resolve({
        name: "PortalPreview",
        query: {
          tabId: nextTabId,
          templateId: nextTemplateId,
          previewMode,
        },
      }).href,
  });

  const { loading, saving, previewLoading, tabName, pageSettingData, savePage, previewPage } = workbench;

  function onBack() {
    if (templateId.value) {
      router.push({
        path: "/portal/design",
        query: {
          id: templateId.value,
          tabId: tabId.value,
        },
      });
      return;
    }
    router.push("/portal/setting");
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
