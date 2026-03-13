<script setup lang="ts">
  interface PortalTemplateWorkbenchShellProps {
    loading?: boolean
  }

  const props = withDefaults(defineProps<PortalTemplateWorkbenchShellProps>(), {
    loading: false,
  })

  defineSlots<{
    header?: () => unknown
    tree?: () => unknown
    toolbar?: () => unknown
    preview?: () => unknown
    dialogs?: () => unknown
  }>()
</script>

<template>
  <div class="page">
    <slot name="header" />

    <div v-loading="props.loading" class="layout">
      <aside class="tree-pane">
        <div class="tree-content">
          <slot name="tree" />
        </div>
      </aside>

      <section class="editor-pane">
        <slot name="toolbar" />
        <slot name="preview" />
      </section>
    </div>

    <slot name="dialogs" />
  </div>
</template>

<style scoped>
  .page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    background: #fff;
  }

  .layout {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    background: #fff;
  }

  .tree-pane {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-right: 1px solid #e5ebf2;
    overflow: hidden;
    background: #fff;
  }

  .tree-content {
    flex: 1;
    min-height: 0;
  }

  .editor-pane {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    background: #fff;
  }

  .page :deep(.el-button) {
    border-radius: 0;
  }

  .page :deep(.el-input__wrapper) {
    border-radius: 0;
  }

  @media (max-width: 1366px) {
    .layout {
      grid-template-columns: 300px minmax(0, 1fr);
    }
  }

  @media (max-width: 960px) {
    .layout {
      grid-template-columns: 1fr;
      grid-template-rows: 340px minmax(0, 1fr);
    }
  }
</style>
