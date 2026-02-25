<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  title: string;
  collapsed?: boolean;
}>();

const labelRef = ref<HTMLElement>();
const overflow = ref(false);
let resizeObserver: ResizeObserver | null = null;

function computeOverflow() {
  if (props.collapsed) {
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
  () => [props.title, props.collapsed] as const,
  () => refreshOverflow(),
  { immediate: true }
);
</script>

<template>
  <el-tooltip
    placement="top-start"
    effect="dark"
    :show-after="280"
    :content="title"
    :disabled="collapsed || !overflow"
  >
    <span ref="labelRef" class="ob-menu-label truncate">{{ title }}</span>
  </el-tooltip>
</template>

<style scoped>
.ob-menu-label {
  display: block;
  width: 100%;
  min-width: 0;
}
</style>
