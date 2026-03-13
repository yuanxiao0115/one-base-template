<template>
  <el-collapse-item title="容器样式" name="container">
    <el-form-item label="背景颜色">
      <div class="form-item-with-tip">
        <PortalColorField v-model="containerStyleData.containerBgColor" show-alpha />
        <div class="form-tip">设置整个组件的背景颜色，透明度可调</div>
      </div>
    </el-form-item>

    <el-form-item label="背景透明度">
      <div class="form-item-with-tip">
        <div class="slider-with-value">
          <el-slider
            v-model="containerStyleData.containerBgOpacity"
            :min="0"
            :max="1"
            :step="0.1"
            :format-tooltip="(value: number) => `${Math.floor(value * 100)}%`"
          />
          <div class="slider-value">{{ Math.floor(containerStyleData.containerBgOpacity * 100) }}%</div>
        </div>
        <div class="form-tip">调整背景透明度，0%为完全透明，100%为完全不透明</div>
      </div>
    </el-form-item>

    <el-form-item label="容器内边距">
      <div class="form-item-with-tip">
        <PortalSpacingField v-model="containerPaddingValue" :max="50" />
        <div class="form-tip">设置内容与容器边缘的距离，值越大间距越大</div>
      </div>
    </el-form-item>

    <el-form-item label="阴影效果">
      <div class="form-item-with-tip">
        <div class="shadow-samples">
          <div
            class="shadow-option"
            :class="{
              active: containerStyleData.containerShadowPreset === 'none'
            }"
            @click="containerStyleData.containerShadowPreset = 'none'"
          >
            <div class="shadow-preview" style="box-shadow: none;"><span>无阴影</span></div>
          </div>
          <div
            class="shadow-option"
            :class="{
              active: containerStyleData.containerShadowPreset === 'light'
            }"
            @click="containerStyleData.containerShadowPreset = 'light'"
          >
            <div class="shadow-preview" style="box-shadow: 0 2px 4px rgb(0 0 0 / .1);"><span>浅阴影</span></div>
          </div>
          <div
            class="shadow-option"
            :class="{
              active: containerStyleData.containerShadowPreset === 'medium'
            }"
            @click="containerStyleData.containerShadowPreset = 'medium'"
          >
            <div class="shadow-preview" style="box-shadow: 0 4px 8px rgb(0 0 0 / .1);"><span>中等阴影</span></div>
          </div>
          <div
            class="shadow-option"
            :class="{
              active: containerStyleData.containerShadowPreset === 'heavy'
            }"
            @click="containerStyleData.containerShadowPreset = 'heavy'"
          >
            <div class="shadow-preview" style="box-shadow: 0 8px 16px rgb(0 0 0 / .15);"><span>深阴影</span></div>
          </div>
        </div>
        <div class="form-tip">选择容器的阴影效果，阴影可以增强立体感和层次感</div>
      </div>
    </el-form-item>

    <PortalBorderField
      v-model="containerBorderValue"
      :width-min="1"
      :width-max="10"
      :radius-max="50"
      :hide-color-width-when-none="true"
      style-label="边框样式"
      color-label="边框颜色"
      width-label="边框宽度(px)"
      radius-label="圆角(px)"
    />
  </el-collapse-item>

  <el-collapse-item title="内容区域样式" name="content">
    <el-form-item label="背景颜色">
      <div class="form-item-with-tip">
        <PortalColorField v-model="containerStyleData.contentBgColor" show-alpha />
        <div class="form-tip">设置内容区域的背景颜色，可与容器背景形成对比</div>
      </div>
    </el-form-item>

    <el-form-item label="背景透明度">
      <div class="form-item-with-tip">
        <div class="slider-with-value">
          <el-slider
            v-model="containerStyleData.contentBgOpacity"
            :min="0"
            :max="1"
            :step="0.1"
            :format-tooltip="(value: number) => `${Math.floor(value * 100)}%`"
          />
          <div class="slider-value">{{ Math.floor(containerStyleData.contentBgOpacity * 100) }}%</div>
        </div>
        <div class="form-tip">调整内容区域背景透明度，0%为完全透明，100%为完全不透明</div>
      </div>
    </el-form-item>

    <el-form-item label="圆角">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="containerStyleData.contentBorderRadius"
            :min="0"
            :max="20"
            controls-position="right"
          >
            <template #suffix> <span class="suffix-unit">px</span> </template>
          </el-input-number>
        </div>
        <div class="form-tip">设置内容区域的圆角大小</div>
      </div>
    </el-form-item>

    <el-form-item label="内容边距">
      <div class="form-item-with-tip">
        <PortalSpacingField v-model="contentPaddingValue" :max="50" />
        <div class="form-tip">设置内容区域的内部边距，值越大内容与边缘的距离越大</div>
      </div>
    </el-form-item>
  </el-collapse-item>
</template>

<script setup lang="ts">
  import { computed, watch } from 'vue';
  import PortalBorderField from '../../../common/fields/PortalBorderField.vue';
  import PortalColorField from '../../../common/fields/PortalColorField.vue';
  import PortalSpacingField from '../../../common/fields/PortalSpacingField.vue';

  // 定义接口类型
  export interface ContainerStyleModelType {
    containerBgColor: string;
    containerBgOpacity: number;
    containerPaddingTop: number;
    containerPaddingRight: number;
    containerPaddingBottom: number;
    containerPaddingLeft: number;
    containerBorderRadius: number;
    containerShadowPreset: string;
    containerBoxShadow: string;
    containerBorderWidth: number;
    containerBorderStyle: string;
    containerBorderColor: string;
    contentBgColor: string;
    contentBgOpacity: number;
    // 保留原有属性兼容性
    contentBorderRadius?: number;
    contentPaddingTop?: number;
    contentPaddingRight?: number;
    contentPaddingBottom?: number;
    contentPaddingLeft?: number;
  }

  // 使用defineModel来支持v-model
  const containerStyleData = defineModel<ContainerStyleModelType>({
    default: () => ({
      containerBgColor: '#ffffff',
      containerBgOpacity: 1,
      containerPaddingTop: 12,
      containerPaddingRight: 12,
      containerPaddingBottom: 12,
      containerPaddingLeft: 12,
      containerBorderRadius: 8,
      containerShadowPreset: 'none',
      containerBoxShadow: 'none',
      containerBorderWidth: 0,
      containerBorderStyle: 'none',
      containerBorderColor: 'rgba(0, 0, 0, 0)',
      contentBgColor: '#ffffff',
      contentBgOpacity: 1,
      contentBorderRadius: 8,
      contentPaddingTop: 12,
      contentPaddingRight: 12,
      contentPaddingBottom: 12,
      contentPaddingLeft: 12,
    }),
  });

  const containerPaddingValue = computed({
    get: () => ({
      top: Number(containerStyleData.value.containerPaddingTop) || 0,
      right: Number(containerStyleData.value.containerPaddingRight) || 0,
      bottom: Number(containerStyleData.value.containerPaddingBottom) || 0,
      left: Number(containerStyleData.value.containerPaddingLeft) || 0,
    }),
    set: (value) => {
      containerStyleData.value.containerPaddingTop = Number(value.top) || 0;
      containerStyleData.value.containerPaddingRight = Number(value.right) || 0;
      containerStyleData.value.containerPaddingBottom = Number(value.bottom) || 0;
      containerStyleData.value.containerPaddingLeft = Number(value.left) || 0;
    },
  });

  const contentPaddingValue = computed({
    get: () => ({
      top: Number(containerStyleData.value.contentPaddingTop) || 0,
      right: Number(containerStyleData.value.contentPaddingRight) || 0,
      bottom: Number(containerStyleData.value.contentPaddingBottom) || 0,
      left: Number(containerStyleData.value.contentPaddingLeft) || 0,
    }),
    set: (value) => {
      containerStyleData.value.contentPaddingTop = Number(value.top) || 0;
      containerStyleData.value.contentPaddingRight = Number(value.right) || 0;
      containerStyleData.value.contentPaddingBottom = Number(value.bottom) || 0;
      containerStyleData.value.contentPaddingLeft = Number(value.left) || 0;
    },
  });

  const containerBorderValue = computed({
    get: () => ({
      style: containerStyleData.value.containerBorderStyle,
      color: containerStyleData.value.containerBorderColor,
      width: Number(containerStyleData.value.containerBorderWidth) || 0,
      radius: Number(containerStyleData.value.containerBorderRadius) || 0,
    }),
    set: (value) => {
      containerStyleData.value.containerBorderStyle = value.style;
      containerStyleData.value.containerBorderColor = value.color;
      containerStyleData.value.containerBorderWidth = Number(value.width) || 0;
      containerStyleData.value.containerBorderRadius = Number(value.radius) || 0;
    },
  });

  // 根据预设更新实际阴影值
  watch(
    () => containerStyleData.value.containerShadowPreset,
    (newPreset) => {
      if (newPreset === 'none') {
        containerStyleData.value.containerBoxShadow = 'none';
      } else if (newPreset === 'light') {
        containerStyleData.value.containerBoxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      } else if (newPreset === 'medium') {
        containerStyleData.value.containerBoxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      } else if (newPreset === 'heavy') {
        containerStyleData.value.containerBoxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
      }
    }
  );

  defineOptions({
    name: 'PbContainerStyleConfig',
  });
</script>

<style scoped>
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--config-muted, #64748b);
  }

  .form-item-with-tip {
    display: flex;
    flex-direction: column;
  }

  .form-tip {
    margin-top: 5px;
    font-size: 12px;
    color: var(--config-muted, #909399);
    line-height: 1.4;
  }

  .input-with-unit {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }

  .suffix-unit {
    margin-right: 8px;
    font-size: 14px;
    color: var(--config-muted, #909399);
  }

  .slider-with-value {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .slider-value {
    margin-left: 15px;
    min-width: 45px;
    color: var(--config-muted, #606266);
  }

  .shadow-samples {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .shadow-option {
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 4px;
    padding: 2px;
  }

  .shadow-option.active {
    border-color: #409eff;
  }

  .shadow-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    width: 80px;
    height: 60px;
    font-size: 12px;
    color: var(--config-muted, #606266);
    background-color: #fff;
  }
</style>
