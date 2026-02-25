<script setup lang="ts">
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useThemeStore, type ThemeMode } from '@one-base-template/core';

const themeStore = useThemeStore();

const options = computed(() =>
  Object.entries(themeStore.themes).map(([key, theme]) => ({
    key,
    label: theme.name?.trim() || key.toUpperCase(),
    primary: theme.primary
  }))
);
const customPrimaryValue = computed(() => themeStore.customPrimary ?? themeStore.currentPrimary);

function runSafely(action: () => void) {
  try {
    action();
  } catch (error) {
    const message = error instanceof Error ? error.message : '主题切换失败';
    ElMessage.error(message);
  }
}

function onPresetChange(value: unknown) {
  if (!value) return;
  runSafely(() => {
    themeStore.setTheme(String(value));
    themeStore.setThemeMode('preset');
  });
}

function onModeChange(value: string | number | boolean | undefined) {
  if (value == null) return;
  runSafely(() => {
    themeStore.setThemeMode(String(value) as ThemeMode);
  });
}

function onCustomColorChange(value: string | null) {
  if (!value) return;
  runSafely(() => {
    themeStore.setCustomPrimary(value);
  });
}

function onResetCustom() {
  runSafely(() => {
    themeStore.resetCustomPrimary();
  });
}
</script>

<template>
  <div class="ob-theme-panel">
    <section class="ob-theme-panel__section">
      <div class="ob-theme-panel__section-head">
        <h4>模式选择</h4>
        <p>内置主题与自定义主色互斥</p>
      </div>

      <el-radio-group
        :model-value="themeStore.themeMode"
        size="default"
        class="ob-theme-panel__mode"
        @change="onModeChange"
      >
        <el-radio-button label="preset">内置主题</el-radio-button>
        <el-radio-button label="custom" :disabled="!themeStore.allowCustomPrimary">自定义主色</el-radio-button>
      </el-radio-group>
    </section>

    <section v-if="themeStore.themeMode === 'preset'" class="ob-theme-panel__section">
      <div class="ob-theme-panel__section-head">
        <h4>内置主题</h4>
        <p>点击卡片立即生效并持久化</p>
      </div>

      <div class="ob-theme-panel__preset-grid">
        <button
          v-for="option in options"
          :key="option.key"
          type="button"
          class="ob-theme-panel__preset"
          :class="{ 'is-active': themeStore.themeKey === option.key }"
          @click="onPresetChange(option.key)"
        >
          <span class="ob-theme-panel__preset-dot" :style="{ background: option.primary }" />
          <span class="ob-theme-panel__preset-name">{{ option.label }}</span>
          <span class="ob-theme-panel__preset-hex">{{ option.primary }}</span>
        </button>
      </div>
    </section>

    <section v-else class="ob-theme-panel__section">
      <div class="ob-theme-panel__section-head">
        <h4>自定义主色</h4>
        <p>只覆盖 primary 色阶，语义色保留预设</p>
      </div>

      <div class="ob-theme-panel__custom">
        <el-color-picker
          :model-value="customPrimaryValue"
          :show-alpha="false"
          class="ob-theme-panel__picker"
          @change="onCustomColorChange"
        />

        <div class="ob-theme-panel__custom-value">
          <span>当前主色</span>
          <code>{{ customPrimaryValue }}</code>
        </div>

        <el-button class="ob-theme-panel__reset" @click="onResetCustom">
          恢复预设
        </el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ob-theme-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ob-theme-panel__section {
  border: 1px solid var(--one-border-color-light, #e4e7ed);
  border-radius: 12px;
  background: #fff;
  padding: 14px;
}

.ob-theme-panel__section-head {
  margin-bottom: 12px;
}

.ob-theme-panel__section-head h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--one-text-color-primary, #112129);
}

.ob-theme-panel__section-head p {
  margin: 5px 0 0;
  font-size: 12px;
  color: var(--one-text-color-secondary, #666666);
}

.ob-theme-panel__mode {
  width: 100%;
}

.ob-theme-panel__mode :deep(.el-radio-button) {
  flex: 1;
}

.ob-theme-panel__mode :deep(.el-radio-button__inner) {
  width: 100%;
}

.ob-theme-panel__preset-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.ob-theme-panel__preset {
  cursor: pointer;
  border: 1px solid var(--one-border-color-light, #e4e7ed);
  border-radius: 10px;
  background: #fff;
  padding: 10px 12px;
  text-align: left;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.ob-theme-panel__preset:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 6px 14px rgb(15 121 233 / 14%);
  transform: translateY(-1px);
}

.ob-theme-panel__preset.is-active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px rgb(15 121 233 / 20%);
  background: var(--one-color-primary-light-1, #e7f1fc);
}

.ob-theme-panel__preset-dot {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-bottom: 8px;
}

.ob-theme-panel__preset-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--one-text-color-primary, #112129);
}

.ob-theme-panel__preset-hex {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: var(--one-text-color-secondary, #666666);
}

.ob-theme-panel__custom {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ob-theme-panel__picker {
  flex-shrink: 0;
}

.ob-theme-panel__custom-value {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
}

.ob-theme-panel__custom-value span {
  font-size: 12px;
  color: var(--one-text-color-secondary, #666666);
}

.ob-theme-panel__custom-value code {
  font-size: 13px;
  color: var(--one-text-color-primary, #112129);
  font-weight: 600;
}

.ob-theme-panel__reset {
  margin-left: auto;
}

@media (width <= 640px) {
  .ob-theme-panel__preset-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ob-theme-panel__reset {
    margin-left: 0;
  }
}
</style>
