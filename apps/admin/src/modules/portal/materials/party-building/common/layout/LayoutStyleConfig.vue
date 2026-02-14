<template>
  <el-collapse-item title="容器样式" name="container">
    <el-form-item label="背景颜色">
      <div class="form-item-with-tip">
        <el-color-picker
          v-model="containerStyleData.containerBgColor"
          show-alpha
        />
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
          <div class="slider-value">
            {{ Math.floor(containerStyleData.containerBgOpacity * 100) }}%
          </div>
        </div>
        <div class="form-tip">
          调整背景透明度，0%为完全透明，100%为完全不透明
        </div>
      </div>
    </el-form-item>

    <el-form-item label="容器内边距">
      <div class="form-item-with-tip">
        <div class="padding-inputs">
          <div class="input-with-unit">
            <el-input-number
              v-model="containerStyleData.containerPaddingTop"
              :min="0"
              :max="50"
              controls-position="right"
              class="padding-input"
            >
              <template #suffix>
                <span class="suffix-unit-mini">上</span>
              </template>
            </el-input-number>
          </div>
          <div class="input-with-unit">
            <el-input-number
              v-model="containerStyleData.containerPaddingRight"
              :min="0"
              :max="50"
              controls-position="right"
              class="padding-input"
            >
              <template #suffix>
                <span class="suffix-unit-mini">右</span>
              </template>
            </el-input-number>
          </div>
          <div class="input-with-unit">
            <el-input-number
              v-model="containerStyleData.containerPaddingBottom"
              :min="0"
              :max="50"
              controls-position="right"
              class="padding-input"
            >
              <template #suffix>
                <span class="suffix-unit-mini">下</span>
              </template>
            </el-input-number>
          </div>
          <div class="input-with-unit">
            <el-input-number
              v-model="containerStyleData.containerPaddingLeft"
              :min="0"
              :max="50"
              controls-position="right"
              class="padding-input"
            >
              <template #suffix>
                <span class="suffix-unit-mini">左</span>
              </template>
            </el-input-number>
          </div>
        </div>
        <div class="form-tip">设置内容与容器边缘的距离，值越大间距越大</div>
      </div>
    </el-form-item>

    <el-form-item label="圆角">
      <div class="form-item-with-tip">
        <div class="corner-preview">
          <div class="input-with-unit">
            <el-input-number
              v-model="containerStyleData.containerBorderRadius"
              :min="0"
              :max="50"
              controls-position="right"
            >
              <template #suffix>
                <span class="suffix-unit">px</span>
              </template>
            </el-input-number>
          </div>
          <div class="corner-samples">
            <div
              class="corner-sample-option"
              :class="{
                active: containerStyleData.containerBorderRadius === 0
              }"
              @click="containerStyleData.containerBorderRadius = 0"
            >
              <div class="corner-sample" style="border-radius: 0" />
              <div class="corner-label">无圆角</div>
            </div>
            <div
              class="corner-sample-option"
              :class="{
                active: containerStyleData.containerBorderRadius === 4
              }"
              @click="containerStyleData.containerBorderRadius = 4"
            >
              <div class="corner-sample" style="border-radius: 4px" />
              <div class="corner-label">小圆角</div>
            </div>
          </div>
          <div class="corner-samples">
            <div
              class="corner-sample-option"
              :class="{
                active: containerStyleData.containerBorderRadius === 8
              }"
              @click="containerStyleData.containerBorderRadius = 8"
            >
              <div class="corner-sample" style="border-radius: 8px" />
              <div class="corner-label">中圆角</div>
            </div>
            <div
              class="corner-sample-option"
              :class="{
                active: containerStyleData.containerBorderRadius === 16
              }"
              @click="containerStyleData.containerBorderRadius = 16"
            >
              <div class="corner-sample" style="border-radius: 16px" />
              <div class="corner-label">大圆角</div>
            </div>
          </div>
        </div>
        <div class="form-tip">
          设置容器四角的圆角大小，0表示直角，值越大越圆
        </div>
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
            <div class="shadow-preview" style="box-shadow: none">
              <span>无阴影</span>
            </div>
          </div>
          <div
            class="shadow-option"
            :class="{
              active: containerStyleData.containerShadowPreset === 'light'
            }"
            @click="containerStyleData.containerShadowPreset = 'light'"
          >
            <div
              class="shadow-preview"
              style="box-shadow: 0 2px 4px rgb(0 0 0 / 10%)"
            >
              <span>浅阴影</span>
            </div>
          </div>
          <div
            class="shadow-option"
            :class="{
              active: containerStyleData.containerShadowPreset === 'medium'
            }"
            @click="containerStyleData.containerShadowPreset = 'medium'"
          >
            <div
              class="shadow-preview"
              style="box-shadow: 0 4px 8px rgb(0 0 0 / 10%)"
            >
              <span>中等阴影</span>
            </div>
          </div>
          <div
            class="shadow-option"
            :class="{
              active: containerStyleData.containerShadowPreset === 'heavy'
            }"
            @click="containerStyleData.containerShadowPreset = 'heavy'"
          >
            <div
              class="shadow-preview"
              style="box-shadow: 0 8px 16px rgb(0 0 0 / 15%)"
            >
              <span>深阴影</span>
            </div>
          </div>
        </div>
        <div class="form-tip">
          选择容器的阴影效果，阴影可以增强立体感和层次感
        </div>
      </div>
    </el-form-item>

    <el-form-item label="边框">
      <div class="form-item-with-tip">
        <div class="border-editor">
          <div class="border-styles">
            <div
              class="border-style-option"
              :class="{
                active:
                  containerStyleData.containerBorderStyle === 'none' &&
                  containerStyleData.containerBorderWidth === 0
              }"
              @click="containerStyleData.containerBorderStyle = 'none'"
            >
              <div class="border-preview" style="border: none">
                <span>无边框</span>
              </div>
            </div>
            <div
              class="border-style-option"
              :class="{
                active:
                  containerStyleData.containerBorderStyle === 'solid' &&
                  (containerStyleData.containerBorderWidth === 1 ||
                    containerStyleData.containerBorderWidth === 2)
              }"
              @click="containerStyleData.containerBorderStyle = 'solid'"
            >
              <div class="border-preview" style="border: 1px solid #606266">
                <span>实线</span>
              </div>
            </div>
            <div
              class="border-style-option"
              :class="{
                active:
                  containerStyleData.containerBorderStyle === 'dashed' &&
                  containerStyleData.containerBorderWidth === 1
              }"
              @click="containerStyleData.containerBorderStyle = 'dashed'"
            >
              <div class="border-preview" style="border: 1px dashed #606266">
                <span>虚线</span>
              </div>
            </div>
            <div
              class="border-style-option"
              :class="{
                active:
                  containerStyleData.containerBorderStyle === 'dotted' &&
                  containerStyleData.containerBorderWidth === 1
              }"
              @click="containerStyleData.containerBorderStyle = 'dotted'"
            >
              <div class="border-preview" style="border: 1px dotted #606266">
                <span>点线</span>
              </div>
            </div>
          </div>

          <div
            v-show="containerStyleData.containerBorderStyle !== 'none'"
            class="border-settings"
          >
            <div class="border-color">
              <div class="border-option-label">边框颜色：</div>
              <el-color-picker
                v-model="containerStyleData.containerBorderColor"
                show-alpha
              />
            </div>

            <div class="border-width">
              <div class="border-option-label">边框宽度：</div>
              <div class="input-with-unit">
                <el-input-number
                  v-model="containerStyleData.containerBorderWidth"
                  :min="1"
                  :max="10"
                  controls-position="right"
                >
                  <template #suffix>
                    <span class="suffix-unit">px</span>
                  </template>
                </el-input-number>
              </div>
            </div>
          </div>
        </div>
        <div class="form-tip">选择边框样式并设置颜色和宽度</div>
      </div>
    </el-form-item>
  </el-collapse-item>

  <el-collapse-item title="内容区域样式" name="content">
    <el-form-item label="背景颜色">
      <div class="form-item-with-tip">
        <el-color-picker
          v-model="containerStyleData.contentBgColor"
          show-alpha
        />
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
          <div class="slider-value">
            {{ Math.floor(containerStyleData.contentBgOpacity * 100) }}%
          </div>
        </div>
        <div class="form-tip">
          调整内容区域背景透明度，0%为完全透明，100%为完全不透明
        </div>
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
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">设置内容区域的圆角大小</div>
      </div>
    </el-form-item>

    <el-form-item label="内容边距">
      <div class="form-item-with-tip">
        <div class="padding-inputs">
          <div class="input-with-unit">
            <el-input-number
              v-model="containerStyleData.contentPaddingTop"
              :min="0"
              :max="50"
              controls-position="right"
              class="padding-input"
            >
              <template #suffix>
                <span class="suffix-unit-mini">上</span>
              </template>
            </el-input-number>
          </div>
          <div class="input-with-unit">
            <el-input-number
              v-model="containerStyleData.contentPaddingRight"
              :min="0"
              :max="50"
              controls-position="right"
              class="padding-input"
            >
              <template #suffix>
                <span class="suffix-unit-mini">右</span>
              </template>
            </el-input-number>
          </div>
          <div class="input-with-unit">
            <el-input-number
              v-model="containerStyleData.contentPaddingBottom"
              :min="0"
              :max="50"
              controls-position="right"
              class="padding-input"
            >
              <template #suffix>
                <span class="suffix-unit-mini">下</span>
              </template>
            </el-input-number>
          </div>
          <div class="input-with-unit">
            <el-input-number
              v-model="containerStyleData.contentPaddingLeft"
              :min="0"
              :max="50"
              controls-position="right"
              class="padding-input"
            >
              <template #suffix>
                <span class="suffix-unit-mini">左</span>
              </template>
            </el-input-number>
          </div>
        </div>
        <div class="form-tip">
          设置内容区域的内部边距，值越大内容与边缘的距离越大
        </div>
      </div>
    </el-form-item>
  </el-collapse-item>
</template>

<script setup lang="ts">
import { watch } from 'vue';

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
    contentPaddingLeft: 12
  })
});

// 根据预设更新实际阴影值
watch(
  () => containerStyleData.value.containerShadowPreset,
  newPreset => {
    if (newPreset === 'none') {
      containerStyleData.value.containerBoxShadow = 'none';
    } else if (newPreset === 'light') {
      containerStyleData.value.containerBoxShadow =
        '0 2px 4px rgba(0, 0, 0, 0.1)';
    } else if (newPreset === 'medium') {
      containerStyleData.value.containerBoxShadow =
        '0 4px 8px rgba(0, 0, 0, 0.1)';
    } else if (newPreset === 'heavy') {
      containerStyleData.value.containerBoxShadow =
        '0 8px 16px rgba(0, 0, 0, 0.15)';
    }
  }
);

defineOptions({
  name: 'pb-container-style-config'
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

.unit-label {
  margin-left: 8px;
  font-size: 14px;
  white-space: nowrap;
  color: var(--config-muted, #606266);
}

.unit-label.mini {
  margin-left: 4px;
  min-width: 20px;
  font-size: 12px;
}

.suffix-unit {
  margin-right: 8px;
  font-size: 14px;
  color: var(--config-muted, #909399);
}

.suffix-unit-mini {
  margin-right: 8px;
  min-width: 14px;
  font-size: 12px;
  text-align: center;
  color: var(--config-muted, #909399);
}

.padding-input {
  width: 110px;
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

.corner-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.corner-samples {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.corner-sample-option {
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 5px;
  text-align: center;
  cursor: pointer;
}

.corner-sample-option.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.corner-sample {
  margin-bottom: 5px;
  border: 1px solid #dcdfe6;
  width: 60px;
  height: 60px;
  background-color: #f0f2f5;
}

.corner-label {
  font-size: 12px;
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

.padding-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.border-editor {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.border-styles {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.border-style-option {
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 5px;
  text-align: center;
  cursor: pointer;
}

.border-style-option.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.border-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
  width: 80px;
  height: 40px;
  font-size: 12px;
  color: var(--config-muted, #606266);
  background-color: #f9f9f9;
}

.border-settings {
  display: flex;
  margin-top: 5px;
  border-radius: 4px;
  padding: 15px;
  background-color: #f9f9f9;
  gap: 20px;
  flex-wrap: wrap;
}

.border-color {
  display: flex;
  align-items: center;
  gap: 10px;
}

.border-width {
  display: flex;
  align-items: center;
  gap: 10px;
}

.border-option-label {
  font-size: 14px;
  white-space: nowrap;
  color: var(--config-muted, #606266);
}
</style>
