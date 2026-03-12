<script setup lang="ts">
  import { computed, ref, watch } from "vue";

  export interface PortalPermissionTreeNode {
    id: string;
    label: string;
    tabId: string;
    selectable: boolean;
    children?: PortalPermissionTreeNode[];
  }

  type PermissionScope = "portal" | "page";

  interface TreeInstance {
    setCurrentKey: (key: string) => void;
  }

  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
      templateName?: string;
      templateId?: string;
      pageTree?: PortalPermissionTreeNode[];
      currentPageId?: string;
      pageDetailLoading?: boolean;
    }>(),
    {
      templateName: "",
      templateId: "",
      pageTree: () => [],
      currentPageId: "",
      pageDetailLoading: false,
    }
  );

  const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
    (e: "select-page", tabId: string): void;
  }>();

  defineOptions({
    name: "PortalPermissionSwitchDialog",
  });

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
  });

  const mode = ref<PermissionScope>("portal");
  const treeRef = ref<TreeInstance | null>(null);

  const currentPageName = computed(() => findPageLabelById(props.pageTree, props.currentPageId));
  const hasPage = computed(() => props.pageTree.length > 0);

  watch(
    () => visible.value,
    (opened) => {
      if (!opened) {
        return;
      }
      mode.value = "portal";
    }
  );

  watch(
    () => props.currentPageId,
    (tabId) => {
      if (!tabId) {
        return;
      }
      treeRef.value?.setCurrentKey(tabId);
    }
  );

  function findPageLabelById(nodes: PortalPermissionTreeNode[], tabId: string): string {
    if (!(Array.isArray(nodes) && tabId)) {
      return "";
    }
    for (const node of nodes) {
      if (node.tabId === tabId && node.selectable) {
        return node.label;
      }
      const nested = findPageLabelById(node.children ?? [], tabId);
      if (nested) {
        return nested;
      }
    }
    return "";
  }

  function onNodeClick(node: PortalPermissionTreeNode) {
    if (!(node?.selectable && node.tabId)) {
      return;
    }
    emit("select-page", node.tabId);
  }
</script>

<template>
  <el-dialog
    v-model="visible"
    title="权限配置"
    width="800px"
    :close-on-click-modal="false"
    destroy-on-close
    class="permission-switch-dialog"
  >
    <div class="permission-entry">
      <div class="entry-header">
        <div class="entry-header-main">
          <div class="entry-heading">
            <div class="entry-title">权限中心</div>
          </div>
          <el-radio-group v-model="mode" size="small" class="entry-mode-toggle">
            <el-radio-button value="portal">门户权限</el-radio-button>
            <el-radio-button value="page">页面权限</el-radio-button>
          </el-radio-group>
        </div>
        <div class="entry-template">
          <span class="entry-template-label">当前门户模板</span>
          <span class="entry-template-value">{{ templateName || templateId || "-" }}</span>
          <template v-if="mode === 'page'">
            <span class="entry-template-divider">|</span>
            <span class="entry-template-label">当前页面</span>
            <span class="entry-template-value">{{ currentPageName || "-" }}</span>
          </template>
        </div>
      </div>

      <div v-if="mode === 'portal'" class="portal-pane">
        <slot name="portal-content">
          <el-empty description="暂无门户权限编辑内容" />
        </slot>
      </div>

      <div v-else class="page-pane">
        <template v-if="hasPage">
          <div class="page-tree">
            <div class="pane-title">页面树</div>
            <el-tree
              ref="treeRef"
              :data="pageTree"
              node-key="id"
              default-expand-all
              highlight-current
              :expand-on-click-node="false"
              @node-click="onNodeClick"
            >
              <template #default="{ data }">
                <span :class="['tree-node', { 'tree-node--group': !data.selectable }]">{{ data.label }}</span>
              </template>
            </el-tree>
          </div>
          <div class="page-detail" v-loading="pageDetailLoading">
            <div class="pane-title">页面权限</div>
            <div class="page-editor">
              <el-empty v-if="!currentPageId" description="请选择左侧页面后编辑权限" :image-size="72" />
              <slot v-else name="page-content">
                <el-empty description="暂无页面权限编辑内容" :image-size="72" />
              </slot>
            </div>
          </div>
        </template>
        <el-empty v-else description="该门户暂无可配置页面权限的页面" />
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
  .permission-entry {
    --panel-border: #dfe6f4;
    --panel-bg: #fff;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 520px;
  }

  .entry-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 0 12px;
    background: #fff;
    border-bottom: 1px solid var(--panel-border);
  }

  .entry-header-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .entry-heading {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 0;
  }

  .entry-title {
    color: #0f172a;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
  }

  .entry-template {
    display: flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
  }

  .entry-template-label {
    color: #475569;
    font-size: 12px;
  }

  .entry-template-value {
    color: #0f172a;
    font-size: 13px;
    font-weight: 600;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .entry-template-divider {
    color: #94a3b8;
    font-size: 12px;
  }

  .entry-mode-toggle :deep(.el-radio-button__inner) {
    min-width: 108px;
    border-color: #dbe4ef;
    background: #fff;
    color: #334155;
    transition: all 0.2s ease;
  }

  .entry-mode-toggle :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }

  .portal-pane {
    border: none;
    border-radius: 0;
    background: var(--panel-bg);
    padding: 0;
    min-height: 430px;
  }

  .page-pane {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 0;
    min-height: 430px;
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
  }

  .page-tree,
  .page-detail {
    border: none;
    padding: 12px 14px;
    min-height: 100%;
    box-sizing: border-box;
    background: var(--panel-bg);
  }

  .page-tree {
    border-right: 1px solid var(--panel-border);
  }

  .pane-title {
    font-size: 14px;
    color: #0f172a;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .tree-node {
    color: #1e293b;
    font-size: 13px;
    line-height: 1.4;
    padding: 1px 0;
  }

  .tree-node--group {
    color: #64748b;
    font-weight: 500;
  }

  .page-editor {
    margin-top: 8px;
    padding-top: 4px;
    min-height: 300px;
  }

  .page-tree :deep(.el-tree) {
    background: transparent;
  }

  .page-tree :deep(.el-tree-node__content) {
    height: 34px;
    border-radius: 4px;
    margin-bottom: 2px;
  }

  .page-tree :deep(.el-tree-node__content:hover) {
    background: var(--el-color-primary-light-9);
  }

  .page-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
  }

  @media (max-width: 960px) {
    .permission-entry {
      min-height: 420px;
    }

    .entry-template {
      max-width: 100%;
    }

    .entry-template-value {
      max-width: 220px;
    }

    .entry-mode-toggle {
      width: 100%;
    }

    .page-pane {
      grid-template-columns: 1fr;
      min-height: unset;
      border-radius: 4px;
    }

    .page-tree {
      border-right: none;
      border-bottom: 1px solid var(--panel-border);
    }

    .page-tree {
      min-height: 240px;
    }

    .page-editor {
      min-height: 240px;
    }
  }
</style>
