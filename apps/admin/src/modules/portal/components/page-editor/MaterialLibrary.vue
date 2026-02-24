<script setup lang="ts">
import { computed, ref } from 'vue';

import { portalMaterialsRegistry } from '../../materials/registry/materials-registry';

type RegistryCategory = (typeof portalMaterialsRegistry.categories)[number];
type RegistryItem = RegistryCategory['cmptList'][number];

const activeNames = ref<string[]>(portalMaterialsRegistry.categories.map((c) => c.id));

const categories = computed(() => portalMaterialsRegistry.categories);

function onDragStart(e: DragEvent, item: RegistryItem) {
  if (!e.dataTransfer) return;

  const payload = {
    w: Number(item.cmptWidth) || 6,
    h: Math.round(Number(item.cmptHeight) || 6),
    cmptConfig: item.cmptConfig || {},
    cmptName: item.cmptName || item.id,
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
        v-for="cat in categories"
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
            <img v-if="item.cmptIcon" class="icon" :src="item.cmptIcon" :alt="item.cmptName">
            <div v-else class="icon placeholder" />
            <div class="name" :title="item.cmptName">{{ item.cmptName }}</div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped>
.material-library {
  display: flex;
  overflow: auto;
  border-right: 1px solid var(--el-border-color-lighter);
  width: 260px;
  height: 100%;
  background: var(--el-bg-color);
  flex-direction: column;
}

.header {
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
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.material-card:active {
  cursor: grabbing;
}

.material-card:hover {
  box-shadow: 0 8px 20px rgb(15 23 42 / 10%);
  transform: translateY(-1px);
}

.icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex: 0 0 auto;
}

.icon.placeholder {
  border-radius: 6px;
  background: var(--el-fill-color-light);
}

.name {
  overflow: hidden;
  font-size: 12px;
  color: var(--el-text-color-regular);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

