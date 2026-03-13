<script setup lang="ts">
  import { computed } from "vue";
  import { useRoute } from "vue-router";

  import { resolvePreviewMode, resolvePreviewViewport } from "@one-base-template/portal-engine";
  import PortalPreviewPanel from "../components/preview-render/PortalPreviewPanel.vue";

  defineOptions({
    name: "PortalPreview",
  });

  const route = useRoute();

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
</script>

<template>
  <PortalPreviewPanel
    :tab-id
    :template-id
    :listen-message="true"
    :preview-mode="previewMode"
    :viewport-width="previewViewport.width"
    :viewport-height="previewViewport.height"
  />
</template>
