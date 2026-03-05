<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

  const props = defineProps<{
    label: string;
    isLeaf: boolean;
  }>();

  const labelRef = ref<HTMLElement>();
  const overflow = ref(false);
  let resizeObserver: ResizeObserver | null = null;

  function computeOverflow() {
    if (!props.isLeaf) {
      overflow.value = false;
      return;
    }

    const el = labelRef.value;
    if (!el) {
      overflow.value = false;
      return;
    }

    overflow.value = el.scrollWidth > el.clientWidth;
  }

  function refreshOverflow() {
    void nextTick(() => computeOverflow());
  }

  onMounted(() => {
    refreshOverflow();

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => computeOverflow());
      if (labelRef.value) {
        resizeObserver.observe(labelRef.value);
      }
    }
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
  });

  watch(
    () => [props.label, props.isLeaf] as const,
    () => refreshOverflow(),
    { immediate: true }
  );
</script>

<template>
  <el-tooltip placement="top-start" effect="dark" :show-after="280" :content="label" :disabled="!(isLeaf && overflow)">
    <span ref="labelRef" class="ob-tree-node-label">{{ label }}</span>
  </el-tooltip>
</template>

<style scoped>
  .ob-tree-node-label {
    display: block;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
