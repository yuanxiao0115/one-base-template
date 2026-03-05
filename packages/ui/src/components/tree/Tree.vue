<script setup lang="ts">
  import { computed, ref, useAttrs } from 'vue';
  import TreeNodeLabel from './TreeNodeLabel.vue';

  defineOptions({
    name: 'Tree',
    inheritAttrs: false,
  });

  type TreeNodeData = Record<string, unknown>;

  interface TreePropsConfig {
    label?: string;
    children?: string;
    disabled?: string;
    isLeaf?: string;
  }

  interface TreeProps {
    data?: TreeNodeData[];
    treeProps?: TreePropsConfig;
    nodeKey?: string;
    currentNodeKey?: string | number;
    highlightCurrent?: boolean;
    defaultExpandAll?: boolean;
    expandOnClickNode?: boolean;
    emptyText?: string;
  }

  const props = withDefaults(defineProps<TreeProps>(), {
    data: () => [],
    treeProps: () => ({
      label: 'label',
      children: 'children',
    }),
    nodeKey: 'id',
    currentNodeKey: undefined,
    highlightCurrent: false,
    defaultExpandAll: false,
    expandOnClickNode: true,
    emptyText: '暂无数据',
  });

  const emit =
    defineEmits<(event: 'node-click', data: TreeNodeData, node: unknown, component: unknown, e: MouseEvent) => void>();

  const attrs = useAttrs();
  const treeRef = ref<{
    setCurrentKey?: (key?: string | number | null, shouldAutoExpandParent?: boolean) => void;
    setCurrentNode?: (node?: TreeNodeData | null, shouldAutoExpandParent?: boolean) => void;
    getCurrentKey?: () => string | number | undefined;
    getCurrentNode?: () => TreeNodeData | null;
    filter?: (keyword: string) => void;
  }>();

  const normalizedTreeProps = computed<TreePropsConfig>(() => ({
    label: props.treeProps?.label || 'label',
    children: props.treeProps?.children || 'children',
    disabled: props.treeProps?.disabled,
    isLeaf: props.treeProps?.isLeaf,
  }));

  function resolveNodeLabel(data: TreeNodeData): string {
    const labelKey = normalizedTreeProps.value.label || 'label';
    const rawValue = data?.[labelKey];
    if (typeof rawValue === 'string') {
      return rawValue;
    }
    if (rawValue == null) {
      return '';
    }
    return String(rawValue);
  }

  function handleNodeClick(data: TreeNodeData, node: unknown, component: unknown, event: MouseEvent) {
    emit('node-click', data, node, component, event);
  }

  defineExpose({
    setCurrentKey: (key?: string | number | null, shouldAutoExpandParent?: boolean) =>
      treeRef.value?.setCurrentKey?.(key, shouldAutoExpandParent),
    setCurrentNode: (node?: TreeNodeData | null, shouldAutoExpandParent?: boolean) =>
      treeRef.value?.setCurrentNode?.(node, shouldAutoExpandParent),
    getCurrentKey: () => treeRef.value?.getCurrentKey?.(),
    getCurrentNode: () => treeRef.value?.getCurrentNode?.(),
    filter: (keyword: string) => treeRef.value?.filter?.(keyword),
  });
</script>

<template>
  <el-tree
    ref="treeRef"
    v-bind="attrs"
    class="ob-tree"
    :data="data"
    :props="normalizedTreeProps"
    :node-key="nodeKey"
    :current-node-key="currentNodeKey"
    :highlight-current="highlightCurrent"
    :default-expand-all="defaultExpandAll"
    :expand-on-click-node="expandOnClickNode"
    :empty-text="emptyText"
    @node-click="handleNodeClick"
  >
    <template #default="{ node, data: row }">
      <slot name="default" :node="node" :data="row">
        <TreeNodeLabel :label="resolveNodeLabel(row)" :is-leaf="Boolean(node?.isLeaf)" />
      </slot>
    </template>
  </el-tree>
</template>

<style scoped>
  .ob-tree {
    width: 100%;
    min-width: 0;
  }

  .ob-tree :deep(.el-tree-node__content) {
    min-width: 0;
  }
</style>
