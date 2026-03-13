<script setup lang="ts">
  import { computed } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import {
    PortalPreviewPanel,
    resolvePreviewMode,
    resolvePreviewViewport,
    type PortalPreviewDataSource,
    type PortalPreviewNavigatePayload,
  } from "@one-base-template/portal-engine";

  import { portalApi } from "../../api";
  import { useRendererMaterials } from "../../materials/useRendererMaterials";

  defineOptions({
    name: "PortalPreview",
  });

  interface BizResLike {
    code?: unknown;
    success?: unknown;
  }

  const route = useRoute();
  const router = useRouter();
  const { materialsMap } = useRendererMaterials();

  const tabId = computed(() => {
    const queryTabId = route.query.tabId;
    if (typeof queryTabId === "string") {
      return queryTabId;
    }
    const raw = route.params.tabId;
    return typeof raw === "string" ? raw : "";
  });

  const templateId = computed(() => {
    const raw = route.query.templateId;
    return typeof raw === "string" ? raw : "";
  });

  const previewMode = computed(() => resolvePreviewMode(route.query.previewMode));
  const previewViewport = computed(() => {
    if (typeof route.query.vw !== "string" || typeof route.query.vh !== "string") {
      return { width: 0, height: 0 };
    }
    return resolvePreviewViewport(route.query.vw, route.query.vh);
  });

  function normalizeBizOk(res: BizResLike | null | undefined): boolean {
    const code = res?.code;
    return res?.success === true || code === 0 || code === 200 || String(code) === "0" || String(code) === "200";
  }

  const previewDataSource: PortalPreviewDataSource = {
    async getTabDetail(id: string) {
      const resPublic = await portalApi.tabPublic.detail({ id });
      if (normalizeBizOk(resPublic)) {
        return resPublic;
      }
      return portalApi.tab.detail({ id });
    },
    getTemplateDetail(id: string) {
      return portalApi.template.detail({ id });
    },
  };

  function onNavigate(payload: PortalPreviewNavigatePayload) {
    if (payload.type === "tab") {
      if (!payload.tabId) {
        return;
      }
      void router.replace({
        query: {
          ...route.query,
          tabId: payload.tabId,
          templateId: templateId.value || undefined,
        },
      });
      return;
    }

    if (payload.type === "url" && payload.url) {
      window.open(payload.url, "_blank", "noopener,noreferrer");
    }
  }
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
