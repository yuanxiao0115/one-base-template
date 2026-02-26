<script setup lang="ts">
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useThemeStore } from '@one-base-template/core';

const themeStore = useThemeStore();

const themeCards = computed(() =>
  Object.entries(themeStore.themes).map(([key, theme]) => ({
    key,
    label: theme.name?.trim() || key.toUpperCase(),
    primary: theme.primary
  }))
);

const customPrimaryValue = computed(() => themeStore.customPrimary ?? themeStore.currentPrimary);
const isCustomMode = computed(() => themeStore.themeMode === 'custom');

function runSafely(action: () => void, fallbackMessage = '个性设置更新失败') {
  try {
    action();
  } catch (error) {
    const message = error instanceof Error ? error.message : fallbackMessage;
    ElMessage.error(message);
  }
}

function onSelectTheme(themeKey: string) {
  runSafely(() => {
    themeStore.setTheme(themeKey);
    themeStore.setThemeMode('preset');
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

function onGrayscaleChange(value: string | number | boolean) {
  runSafely(() => {
    themeStore.setGrayscale(Boolean(value));
  });
}
</script>

<template>
  <div class="ob-personalize">
    <section class="ob-personalize__section">
      <div class="ob-personalize__section-head">
        <span class="ob-personalize__section-mark" aria-hidden="true" />
        <div class="ob-personalize__section-title">
          <h4>主题切换</h4>
          <p>统一研发框架默认风格为移动蓝，请根据实际使用场景选择所需主题。</p>
        </div>
      </div>

      <div class="ob-theme-grid">
        <button
          v-for="item in themeCards"
          :key="item.key"
          type="button"
          class="ob-theme-card"
          :class="{ 'is-active': themeStore.themeMode === 'preset' && themeStore.themeKey === item.key }"
          :aria-label="`切换到 ${item.label}`"
          :aria-pressed="themeStore.themeMode === 'preset' && themeStore.themeKey === item.key"
          @click="onSelectTheme(item.key)"
        >
          <div class="ob-theme-card__preview">
            <div class="ob-theme-card__preview-top" :style="{ background: item.primary }" />
            <div class="ob-theme-card__preview-body">
              <div class="ob-theme-card__preview-nav" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div class="ob-theme-card__preview-content">默认皮肤</div>
            </div>
          </div>

          <span class="ob-theme-card__option">
            <span class="ob-theme-card__radio" :class="{ 'is-active': themeStore.themeMode === 'preset' && themeStore.themeKey === item.key }">
              <span class="ob-theme-card__radio-dot" />
            </span>
            <span class="ob-theme-card__name">{{ item.label }}</span>
          </span>
        </button>
      </div>
    </section>

    <section v-if="themeStore.allowCustomPrimary" class="ob-personalize__section">
      <div class="ob-personalize__section-head">
        <span class="ob-personalize__section-mark" aria-hidden="true" />
        <div class="ob-personalize__section-title">
          <h4>主色微调</h4>
          <p>用于活动临时换色，支持一键恢复到当前预设主题。</p>
        </div>
      </div>

      <div class="ob-custom-panel">
        <div class="ob-custom-panel__meta">
          <span class="ob-custom-panel__swatch" :style="{ background: customPrimaryValue }" aria-hidden="true" />
          <div>
            <small>当前主色</small>
            <code>{{ customPrimaryValue }}</code>
          </div>
        </div>

        <el-color-picker
          :model-value="customPrimaryValue"
          :show-alpha="false"
          class="ob-custom-panel__picker"
          @change="onCustomColorChange"
        />

        <el-button class="ob-custom-panel__reset" text @click="onResetCustom">
          {{ isCustomMode ? '恢复预设' : '保持预设' }}
        </el-button>
      </div>
    </section>

    <section class="ob-personalize__section">
      <div class="ob-personalize__section-head">
        <span class="ob-personalize__section-mark" aria-hidden="true" />
        <div class="ob-personalize__section-title">
          <h4>界面显示</h4>
          <p>适用于默哀日、纪念日等全站置灰场景。</p>
        </div>
      </div>

      <div class="ob-display-row">
        <div class="ob-display-preview" aria-hidden="true">
          <div class="ob-display-preview__top" />
          <div class="ob-display-preview__body">
            <div class="ob-display-preview__aside">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div class="ob-display-preview__content">灰色模式</div>
          </div>
        </div>

        <div class="ob-display-switch">
          <span class="ob-display-switch__label">灰色模式</span>
          <el-switch
            :model-value="themeStore.grayscale"
            inline-prompt
            active-text="开"
            inactive-text="关"
            @change="onGrayscaleChange"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ob-personalize {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.ob-personalize__section {
  padding: 0;
}

.ob-personalize__section-head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.ob-personalize__section-mark {
  width: 3px;
  height: 22px;
  border-radius: 999px;
  background: var(--el-color-primary);
}

.ob-personalize__section-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ob-personalize__section-title h4 {
  margin: 0;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 700;
  color: var(--one-text-color-primary, #112129);
}

.ob-personalize__section-title p {
  margin: 0;
  max-width: 66ch;
  font-size: 13px;
  line-height: 1.5;
  color: var(--one-text-color-secondary, #667085);
}

.ob-theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(164px, 164px));
  justify-content: start;
  column-gap: 16px;
  row-gap: 16px;
}

.ob-theme-card {
  border: 1px solid rgb(223 229 238 / 96%);
  border-radius: 12px;
  background: #fff;
  padding: 8px 7px 10px;
  width: 164px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ob-theme-card:hover {
  border-color: rgb(15 121 233 / 36%);
  box-shadow: 0 8px 18px -16px rgb(15 121 233 / 56%);
  transform: translateY(-1px);
}

.ob-theme-card__preview {
  width: 150px;
  height: 90px;
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgb(228 231 237 / 85%);
  background: #f7f8fa;
  transition: border-color 200ms ease;
}

.ob-theme-card:hover .ob-theme-card__preview {
  border-color: rgb(161 172 186 / 90%);
}

.ob-theme-card.is-active {
  border-color: rgb(15 121 233 / 80%);
  box-shadow: 0 0 0 2px rgb(15 121 233 / 14%);
}

.ob-theme-card__preview-top {
  height: 16px;
}

.ob-theme-card__preview-body {
  display: grid;
  grid-template-columns: 42px 1fr;
  height: calc(100% - 16px);
}

.ob-theme-card__preview-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 7px 6px;
  background: rgb(255 255 255 / 82%);
}

.ob-theme-card__preview-nav span {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgb(227 231 236 / 90%);
}

.ob-theme-card__preview-content {
  display: grid;
  place-items: center;
  font-size: 20px;
  color: rgb(141 147 157 / 90%);
  letter-spacing: 0.06em;
}

.ob-theme-card__option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 26px;
}

.ob-theme-card__radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid rgb(198 204 214);
  display: grid;
  place-items: center;
  transition: border-color 180ms ease;
}

.ob-theme-card__radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
}

.ob-theme-card__radio.is-active {
  border-color: var(--el-color-primary);
}

.ob-theme-card__radio.is-active .ob-theme-card__radio-dot {
  background: var(--el-color-primary);
}

.ob-theme-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--one-text-color-primary, #112129);
}

.ob-custom-panel {
  border: 1px solid rgb(224 229 238 / 95%);
  border-radius: 10px;
  background: rgb(248 250 252 / 72%);
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ob-custom-panel__meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
}

.ob-custom-panel__swatch {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgb(15 23 42 / 10%);
  flex-shrink: 0;
}

.ob-custom-panel__meta small {
  display: block;
  margin-bottom: 2px;
  font-size: 12px;
  color: var(--one-text-color-secondary, #667085);
}

.ob-custom-panel__meta code {
  font-size: 12px;
  font-weight: 600;
  color: var(--one-text-color-primary, #112129);
}

.ob-custom-panel__picker {
  flex-shrink: 0;
}

.ob-custom-panel__reset {
  margin-left: auto;
}

.ob-display-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.ob-display-preview {
  width: 150px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgb(210 215 224 / 95%);
  background: #f2f3f5;
}

.ob-display-preview__top {
  height: 16px;
  background: linear-gradient(90deg, #c8ccd2 0%, #dbdee4 100%);
}

.ob-display-preview__body {
  height: calc(100% - 16px);
  display: grid;
  grid-template-columns: 42px 1fr;
}

.ob-display-preview__aside {
  padding: 7px 6px;
  background: rgb(255 255 255 / 74%);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ob-display-preview__aside span {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgb(219 222 228 / 92%);
}

.ob-display-preview__content {
  display: grid;
  place-items: center;
  color: rgb(151 156 165 / 95%);
  font-size: 16px;
  letter-spacing: 0.06em;
}

.ob-display-switch {
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ob-display-switch__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--one-text-color-primary, #112129);
}

@media (width <= 900px) {
  .ob-theme-grid {
    grid-template-columns: repeat(auto-fill, minmax(164px, 164px));
  }

  .ob-display-row {
    flex-direction: column;
    align-items: stretch;
  }

  .ob-display-switch {
    width: 100%;
  }

  .ob-custom-panel__reset {
    margin-left: 0;
  }
}

@media (width <= 640px) {
  .ob-personalize {
    gap: 16px;
  }

  .ob-theme-card__preview-content,
  .ob-display-preview__content {
    font-size: 14px;
  }

  .ob-theme-card__name,
  .ob-display-switch__label {
    font-size: 13px;
  }
}
</style>
