<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';

import { deepClone, deepEqual } from '../../utils/deep';
import { usePortalPageLayoutStore } from '../../stores/pageLayout';

type PortalSchemaSection = Record<string, unknown>;

const props = defineProps<{
  materialsMap: Record<string, Component>;
}>();

const pageLayoutStore = usePortalPageLayoutStore();

const currentLayoutItem = computed(() => pageLayoutStore.currentLayoutItem);

const configForm = computed<PortalSchemaSection>({
  get: () => pageLayoutStore.configForm as PortalSchemaSection,
  set: (value) => pageLayoutStore.updateCurrentItemConfig(deepClone(value)),
});

const activeName = computed<'content' | 'style'>({
  get: () => pageLayoutStore.activeName,
  set: (value) => (pageLayoutStore.activeName = value),
});

const loadingComponents = computed(() => pageLayoutStore.loadingComponents);

const contentComponentName = computed(() => pageLayoutStore.contentComponentName);
const styleComponentName = computed(() => pageLayoutStore.styleComponentName);
const componentBaseName = computed(() => pageLayoutStore.componentBaseName);

const componentExists = computed(() => {
  if (!componentBaseName.value) return false;
  return !!props.materialsMap[componentBaseName.value];
});

function handleSchemaChange(type: 'content' | 'style', value: unknown) {
  if (!currentLayoutItem.value) return;

  const current = configForm.value?.[type];
  if (deepEqual(current, value)) return;

  const nextConfig = deepClone(configForm.value || {});
  nextConfig[type] = deepClone(value);
  pageLayoutStore.updateCurrentItemConfig(nextConfig);
}
</script>

<template>
  <div class="panel">
    <div v-if="currentLayoutItem" class="panel-inner">
      <div class="panel-header">
        <div class="title">{{ componentBaseName || '-' }} 配置</div>
        <div class="meta">
          <div>ID: {{ currentLayoutItem.i }}</div>
          <div>位置: ({{ currentLayoutItem.x }}, {{ currentLayoutItem.y }})</div>
          <div>尺寸: {{ currentLayoutItem.w }} x {{ currentLayoutItem.h }}</div>
        </div>
      </div>

      <div v-if="!componentExists" class="panel-error">
        <el-alert
          title="组件类型不存在"
          type="error"
          :closable="false"
          :description="`找不到名为 '${componentBaseName}' 的 index 组件。请检查物料注册或组件 name 是否一致。`"
          show-icon
        />
      </div>

      <el-tabs v-model="activeName" class="tabs">
        <el-tab-pane label="属性" name="content">
          <el-skeleton :loading="loadingComponents.content" animated>
            <template #template>
              <div class="skeleton">
                <el-skeleton :rows="6" />
              </div>
            </template>

            <template #default>
              <component
                :is="props.materialsMap[contentComponentName]"
                v-if="contentComponentName && props.materialsMap[contentComponentName]"
                :schema="configForm.content || {}"
                @schema-change="handleSchemaChange"
              />
              <div v-else class="empty">
                <el-empty description="未找到属性设置组件" :image-size="80" />
                <div class="empty-tip">需要组件：{{ contentComponentName || '未定义' }}</div>
              </div>
            </template>
          </el-skeleton>
        </el-tab-pane>

        <el-tab-pane label="样式" name="style">
          <el-skeleton :loading="loadingComponents.style" animated>
            <template #template>
              <div class="skeleton">
                <el-skeleton :rows="6" />
              </div>
            </template>

            <template #default>
              <component
                :is="props.materialsMap[styleComponentName]"
                v-if="styleComponentName && props.materialsMap[styleComponentName]"
                :schema="configForm.style || {}"
                @schema-change="handleSchemaChange"
              />
              <div v-else class="empty">
                <el-empty description="未找到样式设置组件" :image-size="80" />
                <div class="empty-tip">需要组件：{{ styleComponentName || '未定义' }}</div>
              </div>
            </template>
          </el-skeleton>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div v-else class="panel-empty">
      <el-empty description="请从画布中选择一个组件进行配置" />
    </div>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  overflow: auto;
  border-left: 1px solid var(--el-border-color-lighter);
  width: 360px;
  height: 100%;
  background: var(--el-bg-color);
  flex-direction: column;
}

.panel-inner {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.panel-header {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 12px 12px 10px;
}

.title {
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.meta {
  margin-top: 8px;
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  display: grid;
  gap: 4px;
}

.panel-error {
  padding: 12px;
}

.tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 12px;
}

.tabs :deep(.el-tabs__content) {
  padding: 12px;
}

.skeleton {
  padding: 10px 0;
}

.empty {
  padding: 16px 0 6px;
  text-align: center;
}

.empty-tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.panel-empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
}
</style>
