<script setup lang="ts">
import { ref, watch } from 'vue';
import { MenuIcon } from '@one-base-template/ui';

interface RegistryItem {
  id: string;
  cmptName?: string;
  cmptIcon?: string;
  cmptWidth?: number | string;
  cmptHeight?: number | string;
  cmptConfig?: unknown;
}

interface RegistryCategory {
  id: string;
  title?: string;
  name?: string;
  cmptList: RegistryItem[];
}

const props = defineProps<{
  categories: RegistryCategory[];
}>();

const activeNames = ref<string[]>([]);

watch(
  () => props.categories,
  (value) => {
    activeNames.value = value.map((c) => c.id);
  },
  { immediate: true }
);

function onDragStart(e: DragEvent, item: RegistryItem) {
  if (!e.dataTransfer) {
    return;
  }

  const payload = {
    w: Number(item.cmptWidth) || 6,
    h: Math.round(Number(item.cmptHeight) || 6),
    cmptConfig: item.cmptConfig || {},
    cmptName: item.cmptName || item.id
  };

  e.dataTransfer.setData('application/json', JSON.stringify(payload));
  e.dataTransfer.effectAllowed = 'copy';
}
</script>

<template>
  <div class="material-library">
    <div class="header">
      <div class="title">物料库</div>
      <div class="tip">拖拽物料到画布区域</div>
    </div>

    <el-collapse v-model="activeNames" class="collapse">
      <el-collapse-item
        v-for="cat in props.categories"
        :key="cat.id"
        :name="cat.id"
        :title="cat.title || cat.name"
      >
        <div class="materials-grid">
          <div
            v-for="item in cat.cmptList"
            :key="item.id"
            class="material-card"
            draggable="true"
            @dragstart="(e) => onDragStart(e, item)"
          >
            <div class="icon" :class="{ placeholder: !item.cmptIcon }">
              <MenuIcon v-if="item.cmptIcon" :icon="item.cmptIcon" />
            </div>
            <el-tooltip :content="item.cmptName || item.id" placement="top">
              <div class="name">{{ item.cmptName }}</div>
            </el-tooltip>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped>
.material-library {
  display: flex;
  overflow: hidden;
  border-right: 1px solid var(--el-border-color-lighter);
  width: 260px;
  flex: 0 0 260px;
  height: 100%;
  min-height: 0;
  background: var(--el-bg-color);
  flex-direction: column;
}

.header {
  flex: 0 0 auto;
  padding: 12px 12px 6px;
}

.title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.collapse {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 8px 12px;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 6px 4px 10px;
}

.material-card {
  display: flex;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 10px 8px;
  background: var(--el-bg-color-overlay);
  cursor: grab;
  user-select: none;
  align-items: center;
  gap: 8px;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease;
}

.material-card:active {
  cursor: grabbing;
}

.material-card:hover {
  box-shadow: 0 8px 20px rgb(15 23 42 / 0.1);
  transform: translateY(-1px);
}

.icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  color: var(--el-text-color-regular);
  font-size: 18px;
}

.icon :deep(i),
.icon :deep(svg),
.icon :deep(img) {
  width: 18px;
  height: 18px;
  line-height: 1;
  object-fit: contain;
}

.icon.placeholder {
  border-radius: 6px;
  background: var(--el-fill-color-light);
}

.name {
  display: block;
  flex: 1;
  overflow: hidden;
  min-width: 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-card :deep(.el-tooltip__trigger) {
  display: block;
  flex: 1;
  min-width: 0;
}
</style>
