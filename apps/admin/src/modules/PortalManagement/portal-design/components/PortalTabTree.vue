<script setup lang="ts">
  import { computed } from "vue";
  import { Document, Edit, Folder, Link, MoreFilled, Plus } from "@element-plus/icons-vue";

  import type { PortalTab } from "../../types";
  import { isPortalTabEditable } from "../../utils/portalTree";

  const props = defineProps<{
    tabs: PortalTab[];
    currentTabId: string;
    keyword?: string;
    sorting?: boolean;
  }>();

  interface TreeSortDropPayload {
    draggingId: string;
    dropId: string;
    dropType: "before" | "after" | "inner";
  }

  const emit = defineEmits<{
    (e: "edit" | "select", tabId: string): void;
    (e: "delete" | "toggle-hide" | "attribute" | "create-child" | "create-sibling", node: PortalTab): void;
    (e: "sort-drop", payload: TreeSortDropPayload): void;
  }>();

  defineOptions({
    name: "PortalTabTree",
  });

  type PortalTabWithUi = PortalTab & {
    disabled?: boolean;
    children?: PortalTabWithUi[];
  };

  function normalizeId(raw: unknown): string {
    if (typeof raw === "string") {
      return raw;
    }
    if (typeof raw === "number") {
      return String(raw);
    }
    return "";
  }

  function mapTabs(tabs: PortalTab[] | undefined): PortalTabWithUi[] {
    if (!Array.isArray(tabs)) {
      return [];
    }
    return tabs.map((tab) => ({
      ...tab,
      disabled: !isPortalTabEditable(tab.tabType),
      children: mapTabs(tab.children),
    }));
  }

  function filterTree(tabs: PortalTabWithUi[], keyword: string): PortalTabWithUi[] {
    const query = keyword.trim().toLowerCase();
    if (!query) {
      return tabs;
    }

    return tabs.reduce<PortalTabWithUi[]>((acc, tab) => {
      const children = filterTree(tab.children ?? [], query);
      const name = String(tab.tabName ?? "").toLowerCase();
      if (name.includes(query) || children.length > 0) {
        acc.push({
          ...tab,
          children,
        });
      }
      return acc;
    }, []);
  }

  const sourceTree = computed(() => mapTabs(props.tabs));
  const treeData = computed(() => filterTree(sourceTree.value, props.keyword ?? ""));
  const dragEnabled = computed(() => !(props.sorting || (props.keyword ?? "").trim()));
  const emptyDescription = computed(() => {
    if ((props.keyword ?? "").trim()) {
      return "未找到匹配节点";
    }
    return "暂无页面节点";
  });

  const treeProps = {
    label: "tabName",
    children: "children",
    disabled: "disabled",
  } as const;

  function getTypeIcon(tabType: number | undefined) {
    if (tabType === 1) {
      return Folder;
    }
    if (tabType === 2) {
      return Document;
    }
    if (tabType === 3) {
      return Link;
    }
    return Document;
  }

  function getTypeLabel(tabType: number | undefined): string {
    if (tabType === 1) {
      return "导航组";
    }
    if (tabType === 2) {
      return "页面";
    }
    if (tabType === 3) {
      return "链接";
    }
    return "未知";
  }

  function isCurrentNode(data: PortalTab) {
    return normalizeId(data.id) === props.currentTabId;
  }

  function onNodeClick(data: PortalTab) {
    if (!isPortalTabEditable(data.tabType)) {
      return;
    }
    const id = normalizeId(data.id);
    if (!id) {
      return;
    }
    emit("select", id);
  }

  function onEdit(data: PortalTab) {
    const id = normalizeId(data.id);
    if (!id) {
      return;
    }
    emit("edit", id);
  }

  function onCommand(command: string, data: PortalTab) {
    if (command === "sibling") {
      emit("create-sibling", data);
    }
    if (command === "child") {
      emit("create-child", data);
    }
  }

  function onMoreCommand(command: string, data: PortalTab) {
    if (command === "attribute") {
      emit("attribute", data);
    }
    if (command === "toggleHide") {
      emit("toggle-hide", data);
    }
    if (command === "delete") {
      emit("delete", data);
    }
  }

  function extractNodeData(nodeLike: unknown): PortalTab | null {
    if (!nodeLike || typeof nodeLike !== "object") {
      return null;
    }
    const row = nodeLike as { data?: unknown };
    if (!row.data || typeof row.data !== "object") {
      return null;
    }
    return row.data as PortalTab;
  }

  function allowDrop(draggingNode: unknown, dropNode: unknown, dropType: string): boolean {
    if (!dragEnabled.value) {
      return false;
    }
    const draggingData = extractNodeData(draggingNode);
    const dropData = extractNodeData(dropNode);
    if (!(draggingData && dropData)) {
      return false;
    }
    const draggingId = normalizeId(draggingData.id);
    const dropId = normalizeId(dropData.id);
    if (!(draggingId && dropId) || draggingId === dropId) {
      return false;
    }

    if (dropType === "inner") {
      return dropData.tabType === 1;
    }

    return dropType === "before" || dropType === "after";
  }

  function onNodeDrop(draggingNode: unknown, dropNode: unknown, dropType: string) {
    if (!dragEnabled.value) {
      return;
    }
    if (!(dropType === "before" || dropType === "after" || dropType === "inner")) {
      return;
    }

    const draggingData = extractNodeData(draggingNode);
    const dropData = extractNodeData(dropNode);
    if (!(draggingData && dropData)) {
      return;
    }

    const draggingId = normalizeId(draggingData.id);
    const dropId = normalizeId(dropData.id);
    if (!(draggingId && dropId) || draggingId === dropId) {
      return;
    }

    emit("sort-drop", {
      draggingId,
      dropId,
      dropType,
    });
  }
</script>

<template>
  <div class="tree-wrap">
    <el-empty v-if="treeData.length === 0" class="tree-empty" :description="emptyDescription" :image-size="80" />

    <el-tree
      v-else
      class="tree"
      node-key="id"
      default-expand-all
      highlight-current
      :expand-on-click-node="false"
      :draggable="dragEnabled"
      :allow-drop="allowDrop"
      :data="treeData"
      :props="treeProps"
      :current-node-key="currentTabId"
      @node-click="onNodeClick"
      @node-drop="onNodeDrop"
    >
      <template #default="{ data }">
        <div class="node" :class="{ 'node--active': isCurrentNode(data), 'node--hidden': data.isHide === 1 }">
          <div class="main">
            <el-icon class="node-type-icon">
              <component :is="getTypeIcon(data.tabType)" />
            </el-icon>
            <span class="name truncate" :title="data.tabName || '未命名'">{{ data.tabName || "未命名" }}</span>
            <span class="meta">{{ getTypeLabel(data.tabType) }}</span>
            <span v-if="data.isHide === 1" class="hidden-tag">隐藏</span>
          </div>

          <div class="actions" @click.stop>
            <el-tooltip v-if="isPortalTabEditable(data.tabType)" content="编辑页面" placement="top">
              <el-button
                class="icon-action"
                link
                size="small"
                :icon="Edit"
                aria-label="编辑页面"
                @click="() => onEdit(data)"
              />
            </el-tooltip>

            <el-dropdown trigger="click" @command="(cmd: string) => onCommand(cmd, data)">
              <el-button class="icon-action" link size="small" :icon="Plus" aria-label="新建页面" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="sibling">新建同级</el-dropdown-item>
                  <el-dropdown-item v-if="data.tabType === 1" command="child">新建子级</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown trigger="click" @command="(cmd: string) => onMoreCommand(cmd, data)">
              <el-button class="icon-action" link size="small" :icon="MoreFilled" aria-label="更多操作" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="attribute">属性设置</el-dropdown-item>
                  <el-dropdown-item command="toggleHide">
                    {{ data.isHide === 1 ? "显示页面" : "隐藏页面" }}
                  </el-dropdown-item>
                  <el-dropdown-item command="delete">删除页面</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<style scoped>
  .tree-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: #fff;
  }

  .tree-empty {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tree {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 8px 12px 14px;
  }

  .tree :deep(.el-tree-node__content) {
    height: 40px;
    margin-bottom: 8px;
    border-left: 2px solid transparent;
    padding: 0 8px 0 6px;
    transition: background-color 0.2s ease;
  }

  .tree :deep(.el-tree-node__content:hover) {
    background: #f5f8fc;
  }

  .tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
    border-left-color: var(--el-color-primary);
    background: #eef4fd;
  }

  .tree :deep(.el-tree-node__expand-icon) {
    color: #7b8592;
  }

  .node {
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .main {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .node-type-icon {
    font-size: 15px;
    color: #4f5d6e;
  }

  .name {
    font-size: 13px;
    color: #111827;
  }

  .meta {
    flex: none;
    font-size: 11px;
    color: #6b7280;
  }

  .hidden-tag {
    flex: none;
    font-size: 11px;
    color: #b42318;
  }

  .node--hidden .name {
    color: #6b7280;
  }

  .truncate {
    max-width: 152px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: none;
    opacity: 0;
    pointer-events: none;
    transform: translateX(4px);
    transition: opacity 0.18s ease, transform 0.18s ease;
  }

  .icon-action {
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 0;
    border: none;
    color: #667284;
    background: transparent;
  }

  .icon-action:hover {
    color: #111827;
    background: #e9eef5;
  }

  .icon-action:focus-visible {
    outline: 2px solid #9fc1ef;
    outline-offset: 1px;
  }

  .node:hover .actions,
  .node--active .actions {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0);
  }

  @media (max-width: 640px) {
    .truncate {
      max-width: 96px;
    }

    .tree :deep(.el-tree-node__content) {
      height: 40px;
      margin-bottom: 6px;
    }
  }
</style>
