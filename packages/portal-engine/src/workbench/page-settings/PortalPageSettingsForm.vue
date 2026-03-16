<script setup lang="ts">
import { computed } from 'vue';
import { type PortalPageSettingsV2 } from '../../schema/page-settings';
import { PortalSpacingField } from '../../materials/common/fields';

import { ObColorField } from '@one-base-template/ui';

const props = withDefaults(
  defineProps<{
    showBasicInfo?: boolean;
    sectionMode?: 'basic' | 'advanced' | 'full';
  }>(),
  {
    showBasicInfo: true,
    sectionMode: 'full'
  }
);

const model = defineModel<PortalPageSettingsV2>({ required: true });
const showBasicSection = computed(() => props.sectionMode !== 'advanced');
const showAdvancedSection = computed(() => props.sectionMode !== 'basic');

const pageMarginSpacing = computed({
  get: () => ({
    top: Number(model.value.spacing.marginTop) || 0,
    right: Number(model.value.spacing.marginRight) || 0,
    bottom: Number(model.value.spacing.marginBottom) || 0,
    left: Number(model.value.spacing.marginLeft) || 0
  }),
  set: (value) => {
    model.value.spacing.marginTop = Number(value.top) || 0;
    model.value.spacing.marginRight = Number(value.right) || 0;
    model.value.spacing.marginBottom = Number(value.bottom) || 0;
    model.value.spacing.marginLeft = Number(value.left) || 0;
  }
});

const pagePaddingSpacing = computed({
  get: () => ({
    top: Number(model.value.spacing.paddingTop) || 0,
    right: Number(model.value.spacing.paddingRight) || 0,
    bottom: Number(model.value.spacing.paddingBottom) || 0,
    left: Number(model.value.spacing.paddingLeft) || 0
  }),
  set: (value) => {
    model.value.spacing.paddingTop = Number(value.top) || 0;
    model.value.spacing.paddingRight = Number(value.right) || 0;
    model.value.spacing.paddingBottom = Number(value.bottom) || 0;
    model.value.spacing.paddingLeft = Number(value.left) || 0;
  }
});

const padSpacing = computed({
  get: () => ({
    top: Number(model.value.responsive.pad.marginTop) || 0,
    right: Number(model.value.responsive.pad.paddingRight) || 0,
    bottom: Number(model.value.responsive.pad.marginBottom) || 0,
    left: Number(model.value.responsive.pad.paddingLeft) || 0
  }),
  set: (value) => {
    model.value.responsive.pad.marginTop = Number(value.top) || 0;
    model.value.responsive.pad.paddingRight = Number(value.right) || 0;
    model.value.responsive.pad.marginBottom = Number(value.bottom) || 0;
    model.value.responsive.pad.paddingLeft = Number(value.left) || 0;
  }
});

const mobileSpacing = computed({
  get: () => ({
    top: Number(model.value.responsive.mobile.marginTop) || 0,
    right: Number(model.value.responsive.mobile.paddingRight) || 0,
    bottom: Number(model.value.responsive.mobile.marginBottom) || 0,
    left: Number(model.value.responsive.mobile.paddingLeft) || 0
  }),
  set: (value) => {
    model.value.responsive.mobile.marginTop = Number(value.top) || 0;
    model.value.responsive.mobile.paddingRight = Number(value.right) || 0;
    model.value.responsive.mobile.marginBottom = Number(value.bottom) || 0;
    model.value.responsive.mobile.paddingLeft = Number(value.left) || 0;
  }
});
</script>

<template>
  <div class="settings-scroll">
    <template v-if="showBasicSection">
      <ObCard v-if="props.showBasicInfo" class="settings-card" title="基础信息">
        <el-form label-position="top">
          <el-form-item label="页面标题">
            <el-input
              v-model="model.basic.pageTitle"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              maxlength="80"
              show-word-limit
              placeholder="请输入页面标题"
            />
          </el-form-item>
          <el-form-item label="页面别名（slug）">
            <el-input
              v-model="model.basic.slug"
              maxlength="20"
              show-word-limit
              placeholder="如：workbench-home"
            />
          </el-form-item>
          <el-form-item label="页面可见性">
            <el-switch v-model="model.basic.isVisible" active-text="显示" inactive-text="隐藏" />
          </el-form-item>
        </el-form>
      </ObCard>

      <ObCard class="settings-card" title="布局模式与容器">
        <el-form label-position="top">
          <el-form-item label="布局模式">
            <el-select v-model="model.layoutMode">
              <el-option label="整体滚动" value="global-scroll" />
              <el-option label="页头吸顶 + 内容滚动" value="header-fixed-content-scroll" />
              <el-option
                label="页头吸顶 + 页脚固定 + 内容滚动"
                value="header-fixed-footer-fixed-content-scroll"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="内容宽度模式">
            <el-select v-model="model.layoutContainer.widthMode">
              <el-option label="全宽" value="full-width" />
              <el-option label="固定宽度" value="fixed" />
              <el-option label="自定义宽度" value="custom" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="model.layoutContainer.widthMode === 'fixed'" label="固定宽度（px）">
            <el-input-number
              v-model="model.layoutContainer.fixedWidth"
              :min="320"
              :max="3840"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item
            v-if="model.layoutContainer.widthMode === 'custom'"
            label="自定义宽度（px）"
          >
            <el-input-number
              v-model="model.layoutContainer.customWidth"
              :min="320"
              :max="3840"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="内容对齐">
            <el-radio-group v-model="model.layoutContainer.contentAlign">
              <el-radio value="left">左对齐</el-radio>
              <el-radio value="center">居中</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="滚动策略">
            <el-select v-model="model.layoutContainer.overflowMode">
              <el-option label="自动滚动" value="auto" />
              <el-option label="总是滚动" value="scroll" />
              <el-option label="超出隐藏" value="hidden" />
            </el-select>
          </el-form-item>
          <el-form-item label="内容最小高度（px）">
            <el-input-number
              v-model="model.layoutContainer.contentMinHeight"
              :min="200"
              :max="4000"
              controls-position="right"
            />
          </el-form-item>
        </el-form>
      </ObCard>

      <ObCard class="settings-card" title="布局网格">
        <el-form label-position="top">
          <el-form-item label="栅格列数">
            <el-input-number
              v-model="model.layout.colNum"
              :min="1"
              :max="48"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="列间距">
            <el-input-number
              v-model="model.layout.colSpace"
              :min="0"
              :max="200"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="行间距">
            <el-input-number
              v-model="model.layout.rowSpace"
              :min="0"
              :max="200"
              controls-position="right"
            />
          </el-form-item>
        </el-form>
      </ObCard>

      <ObCard class="settings-card" title="页面边距">
        <el-form label-position="top">
          <el-form-item label="外边距（上 / 右 / 下 / 左）">
            <PortalSpacingField v-model="pageMarginSpacing" :max="600" />
          </el-form-item>
          <el-form-item label="内边距（上 / 右 / 下 / 左）">
            <PortalSpacingField v-model="pagePaddingSpacing" :max="600" />
          </el-form-item>
        </el-form>
      </ObCard>

      <ObCard class="settings-card" title="背景设置">
        <el-form label-position="top">
          <el-form-item label="背景作用域">
            <el-select v-model="model.background.scope">
              <el-option label="整页" value="page" />
              <el-option label="内容区" value="content" />
              <el-option label="Banner 区" value="banner" />
            </el-select>
          </el-form-item>
          <el-form-item label="背景色">
            <ObColorField
              v-model="model.background.backgroundColor"
              :show-alpha="true"
              placeholder="#FFFFFF / rgba()"
            />
          </el-form-item>
          <el-form-item label="背景图 URL">
            <el-input
              v-model="model.background.backgroundImage"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              maxlength="300"
              show-word-limit
              placeholder="https://example.com/background.jpg"
            />
          </el-form-item>
          <el-form-item label="背景重复方式">
            <el-select v-model="model.background.backgroundRepeat">
              <el-option label="不重复" value="no-repeat" />
              <el-option label="平铺" value="repeat" />
              <el-option label="横向重复" value="repeat-x" />
              <el-option label="纵向重复" value="repeat-y" />
            </el-select>
          </el-form-item>
          <el-form-item label="背景尺寸模式">
            <el-select v-model="model.background.backgroundSizeMode">
              <el-option label="cover" value="cover" />
              <el-option label="contain" value="contain" />
              <el-option label="自定义" value="custom" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="model.background.backgroundSizeMode === 'custom'"
            label="自定义背景尺寸"
          >
            <el-input
              v-model="model.background.backgroundSizeCustom"
              maxlength="20"
              show-word-limit
              placeholder="100% 100%"
            />
          </el-form-item>
          <el-form-item label="背景位置">
            <el-input
              v-model="model.background.backgroundPosition"
              maxlength="20"
              show-word-limit
              placeholder="center center"
            />
          </el-form-item>
          <el-form-item label="背景附着方式">
            <el-select v-model="model.background.backgroundAttachment">
              <el-option label="随内容滚动" value="scroll" />
              <el-option label="固定" value="fixed" />
            </el-select>
          </el-form-item>
          <el-form-item label="背景蒙层颜色">
            <ObColorField
              v-model="model.background.overlayColor"
              :show-alpha="true"
              placeholder="#000000 / rgba()"
            />
          </el-form-item>
          <el-form-item label="背景蒙层透明度">
            <el-slider v-model="model.background.overlayOpacity" :min="0" :max="1" :step="0.05" />
          </el-form-item>
        </el-form>
      </ObCard>

      <ObCard class="settings-card settings-card--banner" title="Banner（独立区域）">
        <el-form label-position="top">
          <el-form-item label="启用 Banner">
            <el-switch v-model="model.banner.enabled" active-text="开启" inactive-text="关闭" />
          </el-form-item>
          <template v-if="model.banner.enabled">
            <el-form-item>
              <el-alert
                type="info"
                :closable="false"
                title="Banner 不在拖拽容器中，始终作为独立区域渲染"
                description="可先开启并调整布局参数，Banner 图片地址可稍后补充，不会阻断其他配置保存。"
              />
            </el-form-item>
            <el-form-item label="Banner 图片 URL">
              <el-input
                v-model="model.banner.image"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 3 }"
                maxlength="300"
                show-word-limit
                placeholder="https://example.com/banner.jpg"
              />
            </el-form-item>
            <el-form-item label="点击跳转 URL（可选）">
              <el-input
                v-model="model.banner.linkUrl"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 3 }"
                maxlength="300"
                show-word-limit
                placeholder="https://example.com"
              />
            </el-form-item>
            <el-form-item label="Banner 高度（px）">
              <el-input-number
                v-model="model.banner.height"
                :min="120"
                :max="1200"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="是否全宽">
              <el-switch
                v-model="model.banner.fullWidth"
                active-text="全宽"
                inactive-text="跟随内容区"
              />
            </el-form-item>
            <el-form-item label="Banner 蒙层颜色">
              <ObColorField
                v-model="model.banner.overlayColor"
                :show-alpha="true"
                placeholder="#000000 / rgba()"
              />
            </el-form-item>
            <el-form-item label="Banner 蒙层透明度">
              <el-slider v-model="model.banner.overlayOpacity" :min="0" :max="1" :step="0.05" />
            </el-form-item>
          </template>
        </el-form>
      </ObCard>
    </template>

    <template v-if="showAdvancedSection">
      <ObCard class="settings-card" title="响应式断点">
        <el-form label-position="top">
          <el-form-item label="平板断点启用">
            <el-switch
              v-model="model.responsive.pad.enabled"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          <template v-if="model.responsive.pad.enabled">
            <el-form-item label="平板最大宽度（px）">
              <el-input-number
                v-model="model.responsive.pad.maxWidth"
                :min="640"
                :max="1600"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="平板栅格（列 / 列间距 / 行间距）">
              <div class="inline-grid inline-grid--3">
                <el-input-number
                  v-model="model.responsive.pad.colNum"
                  :min="1"
                  :max="36"
                  controls-position="right"
                />
                <el-input-number
                  v-model="model.responsive.pad.colSpace"
                  :min="0"
                  :max="200"
                  controls-position="right"
                />
                <el-input-number
                  v-model="model.responsive.pad.rowSpace"
                  :min="0"
                  :max="200"
                  controls-position="right"
                />
              </div>
            </el-form-item>
            <el-form-item label="平板边距（外边距上 / 下 / 内边距左 / 右）">
              <PortalSpacingField v-model="padSpacing" :max="600" />
            </el-form-item>
            <el-form-item label="平板 Banner 高度（px）">
              <el-input-number
                v-model="model.responsive.pad.bannerHeight"
                :min="80"
                :max="1200"
                controls-position="right"
              />
            </el-form-item>
          </template>

          <el-form-item label="移动端断点启用">
            <el-switch
              v-model="model.responsive.mobile.enabled"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          <template v-if="model.responsive.mobile.enabled">
            <el-form-item label="移动端最大宽度（px）">
              <el-input-number
                v-model="model.responsive.mobile.maxWidth"
                :min="320"
                :max="1200"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="移动端栅格（列 / 列间距 / 行间距）">
              <div class="inline-grid inline-grid--3">
                <el-input-number
                  v-model="model.responsive.mobile.colNum"
                  :min="1"
                  :max="24"
                  controls-position="right"
                />
                <el-input-number
                  v-model="model.responsive.mobile.colSpace"
                  :min="0"
                  :max="120"
                  controls-position="right"
                />
                <el-input-number
                  v-model="model.responsive.mobile.rowSpace"
                  :min="0"
                  :max="120"
                  controls-position="right"
                />
              </div>
            </el-form-item>
            <el-form-item label="移动端边距（外边距上 / 下 / 内边距左 / 右）">
              <PortalSpacingField v-model="mobileSpacing" :max="600" />
            </el-form-item>
            <el-form-item label="移动端 Banner 高度（px）">
              <el-input-number
                v-model="model.responsive.mobile.bannerHeight"
                :min="80"
                :max="1200"
                controls-position="right"
              />
            </el-form-item>
          </template>
        </el-form>
      </ObCard>

      <ObCard class="settings-card" title="页头页脚行为">
        <el-form label-position="top">
          <el-form-item label="页头吸顶开关">
            <el-switch
              v-model="model.headerFooterBehavior.headerSticky"
              active-text="吸顶"
              inactive-text="不吸顶"
            />
          </el-form-item>
          <el-form-item label="页头吸顶偏移（px）">
            <el-input-number
              v-model="model.headerFooterBehavior.headerOffsetTop"
              :min="-300"
              :max="300"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="页脚模式">
            <el-select v-model="model.headerFooterBehavior.footerMode">
              <el-option label="常规模式" value="normal" />
              <el-option label="固定模式" value="fixed" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="model.headerFooterBehavior.footerMode === 'fixed'"
            label="固定页脚高度（px）"
          >
            <el-input-number
              v-model="model.headerFooterBehavior.footerFixedHeight"
              :min="40"
              :max="400"
              controls-position="right"
            />
          </el-form-item>
        </el-form>
      </ObCard>
    </template>
  </div>
</template>

<style scoped>
.settings-scroll {
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding: 8px;
  background: #f5f7fa;
  scrollbar-gutter: stable both-edges;
}

.settings-card :deep(.ob-card__body .el-form-item) {
  margin-bottom: 12px;
}

.settings-card :deep(.ob-card__body .el-form-item:last-child) {
  margin-bottom: 0;
}

.settings-card :deep(.ob-card__body .el-form-item__label) {
  padding-bottom: 4px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--el-text-color-regular);
}

.settings-card :deep(.ob-card__body .el-form-item__content > .el-input),
.settings-card :deep(.ob-card__body .el-form-item__content > .el-textarea),
.settings-card :deep(.ob-card__body .el-form-item__content > .el-select),
.settings-card :deep(.ob-card__body .el-form-item__content > .el-input-number),
.settings-card :deep(.ob-card__body .el-form-item__content > .el-slider) {
  width: min(100%, 320px);
}

.settings-card :deep(.ob-card__body .el-form-item__content > .el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
}

.settings-card--banner :deep(.ob-card__body .el-alert) {
  border: 1px solid rgb(14 165 233 / 24%);
  border-radius: 4px;
}

.inline-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}

.inline-grid--3 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 1200px) {
  .inline-grid--3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .settings-scroll {
    padding: 8px;
  }

  .settings-card :deep(.ob-card__body .el-form-item__content > .el-input),
  .settings-card :deep(.ob-card__body .el-form-item__content > .el-textarea),
  .settings-card :deep(.ob-card__body .el-form-item__content > .el-select),
  .settings-card :deep(.ob-card__body .el-form-item__content > .el-input-number),
  .settings-card :deep(.ob-card__body .el-form-item__content > .el-slider) {
    width: 100%;
  }

  .inline-grid,
  .inline-grid--3 {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
