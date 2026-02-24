<template>
  <div class="layout-content-config">
    <el-form-item label="整体布局方式">
      <div class="form-item-with-tip">
        <!-- 隐藏的el-radio-group用于数据绑定 -->
        <el-radio-group v-model="layoutData.layout" class="hidden-radio-group">
          <el-radio
            v-for="option in layoutOptions"
            :key="option.value"
            :label="option.value"
          />
        </el-radio-group>

        <div class="layout-options-container">
          <div
            v-for="option in layoutOptions"
            :key="option.value"
            :class="[
              'layout-option',
              { active: layoutData.layout === option.value }
            ]"
            @click="layoutData.layout = option.value"
          >
            <div class="layout-preview" :class="option.value">
              <div class="layout-preview-title">
                <div class="title-line" />
              </div>
              <div class="layout-preview-image" />
              <div class="layout-preview-text">
                <div class="text-line" />
                <div class="text-line short" />
              </div>
            </div>
            <div class="layout-name">{{ option.label }}</div>
          </div>
        </div>
        <div class="form-tip">选择组件的整体布局方式</div>
      </div>
    </el-form-item>

    <!-- 图片上传，仅在选择了有图片的布局时显示 -->
    <el-form-item v-if="layoutData.layout !== 'no-image'" label="内容图片">
      <SelectImg v-model="contentImageId" />
      <div class="form-tip">上传用于展示的内容图片</div>
    </el-form-item>

    <!-- 图片高度设置，仅在选择了有图片的布局时显示 -->
    <el-form-item v-if="layoutData.layout !== 'no-image'" label="图片高度">
      <div class="input-with-unit">
        <el-input-number
          v-model="layoutData.imageHeight"
          :min="0"
          :step="10"
          controls-position="right"
          placeholder="请输入高度"
        />
        <span class="suffix-unit">px</span>
      </div>
      <div class="form-tip">不设置则为自适应高度</div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import SelectImg from '../../../SelectImg.vue';

// 定义模型类型接口
export interface LayoutConfigModelType {
  layout: string;
  contentGap?: number;
  imageHeight?: number;
  imageWidth?: number; // 添加图片宽度字段
  contentImage?: string; // 添加图片URL字段
}

// 从schema中获取layout数据的计算属性
const layoutData = defineModel<LayoutConfigModelType>({
  default: () => ({
    layout: 'no-image',
    contentGap: 0,
    imageHeight: 0,
    imageWidth: 0,
    contentImage: ''
  })
});

// 图片ID ref
const contentImageId = ref('');

// 初始化图片ID
if (layoutData.value?.contentImage) {
  contentImageId.value = layoutData.value.contentImage;
}

// 监听图片ID变化，更新contentImage
watch(contentImageId, newVal => {
  if (newVal) {
    // 更新布局数据中的图片URL
    layoutData.value.contentImage = newVal;
    // 简化图片处理，无需额外转换
  } else {
    // 图片被删除
    layoutData.value.contentImage = '';
  }
});

// 布局选项
const layoutOptions = [
  { label: '无图模式', value: 'no-image' },
  { label: '图片在上', value: 'image-top' },
  { label: '图片在下', value: 'image-bottom' }
];

defineOptions({
  name: 'pb-layout-config'
});
</script>

<style scoped>
.layout-content-config {
  --config-text: #0f172a;
  --config-muted: #64748b;

  width: 100%;
}

.layout-content-config :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--config-muted);
}

.form-item-with-tip {
  display: flex;
  flex-direction: column;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: var(--config-muted);
  line-height: 1.4;
}

/* 隐藏实际的radio组件 */
.hidden-radio-group {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.layout-options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

.layout-option {
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 8px;
  width: 90px;
  transition: all 0.3s;
  cursor: pointer;
}

.layout-option.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.layout-preview {
  position: relative;
  display: flex;
  overflow: hidden;
  margin-bottom: 5px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 5px;
  height: 80px;
  background-color: #f5f7fa;
  flex-direction: column;
}

.layout-preview-title {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  height: 10px;
}

.title-line {
  border-radius: 2px;
  width: 100%;
  height: 4px;
  background-color: #be0108;
}

.layout-preview-image {
  display: none;
  background-color: #dcdfe6;
}

.layout-preview-text {
  display: flex;
  justify-content: center;
  padding: 4px;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}

.text-line {
  border-radius: 2px;
  height: 4px;
  background-color: #dcdfe6;
}

.text-line.short {
  width: 60%;
}

/* 无图模式 */
.layout-preview.no-image .layout-preview-text {
  margin-top: 5px;
}

/* 图片在标题上方布局 */
.layout-preview.image-top .layout-preview-image {
  display: block;
  margin-bottom: 5px;
  width: 100%;
  height: 30px;
}

/* 图片在标题下方布局 */
.layout-preview.image-bottom .layout-preview-image {
  display: block;
  margin-top: 5px;
  width: 100%;
  height: 30px;
  order: 1;
}

.layout-name {
  font-size: 12px;
  text-align: center;
  color: var(--config-muted);
}

/* 样式工具类 */
.input-with-unit {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.suffix-unit {
  margin-right: 8px;
  font-size: 14px;
  color: var(--config-muted);
}

.slider-with-value {
  display: flex;
  align-items: center;
  width: 100%;
}

.slider-value {
  margin-left: 15px;
  min-width: 45px;
  color: var(--config-muted);
}
</style>
