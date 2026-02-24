<template>
  <div class="image-config">
    <el-form-item label="专栏图片">
      <SelectImg v-model="imageId" />
    </el-form-item>

    <el-form-item label="图片宽度">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.imageWidth"
          :min="80"
          :max="400"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-form-item label="图片高度">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.imageHeight"
          :min="120"
          :max="600"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-form-item label="图片圆角">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.imageBorderRadius"
          :min="0"
          :max="40"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-form-item label="图片平铺">
      <el-select v-model="modelValue.imageRepeat">
        <el-option label="不平铺" value="no-repeat" />
        <el-option label="平铺" value="repeat" />
        <el-option label="横向平铺" value="repeat-x" />
        <el-option label="纵向平铺" value="repeat-y" />
      </el-select>
    </el-form-item>

    <el-form-item label="图片适配">
      <el-select v-model="modelValue.imageSize">
        <el-option label="覆盖" value="cover" />
        <el-option label="包含" value="contain" />
        <el-option label="拉伸" value="100% 100%" />
        <el-option label="原始" value="auto" />
      </el-select>
    </el-form-item>

    <el-form-item label="图片背景位置">
      <el-select v-model="modelValue.imageBgPosition">
        <el-option label="居中" value="center" />
        <el-option label="左上" value="left top" />
        <el-option label="左中" value="left center" />
        <el-option label="左下" value="left bottom" />
        <el-option label="右上" value="right top" />
        <el-option label="右中" value="right center" />
        <el-option label="右下" value="right bottom" />
      </el-select>
    </el-form-item>

    <el-form-item label="图片位置">
      <el-radio-group v-model="modelValue.imagePosition">
        <el-radio label="left">左侧</el-radio>
        <el-radio label="right">右侧</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-divider content-position="left">更多按钮</el-divider>

    <el-form-item label="显示更多">
      <el-switch v-model="modelValue.showMore" />
    </el-form-item>

    <el-form-item v-if="modelValue.showMore" label="按钮文字">
      <el-input v-model="modelValue.moreText" placeholder="请输入按钮文字" />
    </el-form-item>

    <el-form-item v-if="modelValue.showMore" label="按钮文字颜色">
      <el-color-picker v-model="modelValue.moreTextColor" show-alpha />
    </el-form-item>

    <el-form-item v-if="modelValue.showMore" label="按钮字体大小">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.moreFontSize"
          :min="10"
          :max="24"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-form-item v-if="modelValue.showMore" label="按钮背景色">
      <el-color-picker v-model="modelValue.moreBgColor" show-alpha />
    </el-form-item>

    <el-form-item v-if="modelValue.showMore" label="按钮内边距">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.morePaddingX"
          :min="0"
          :max="24"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">左右</span>
          </template>
        </el-input-number>
        <el-input-number
          v-model="modelValue.morePaddingY"
          :min="0"
          :max="24"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">上下</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-form-item v-if="modelValue.showMore" label="按钮圆角">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.moreBorderRadius"
          :min="0"
          :max="24"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-form-item v-if="modelValue.showMore" label="按钮位置">
      <el-radio-group v-model="modelValue.moreAlign">
        <el-radio label="left">左下</el-radio>
        <el-radio label="right">右下</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="modelValue.showMore" label="按钮偏移">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.moreOffsetX"
          :min="0"
          :max="60"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">X</span>
          </template>
        </el-input-number>
        <el-input-number
          v-model="modelValue.moreOffsetY"
          :min="0"
          :max="60"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">Y</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-form-item v-if="modelValue.showMore" label="按钮跳转地址">
      <el-input v-model="modelValue.moreLink" placeholder="请输入链接地址" />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import SelectImg from '../../SelectImg.vue';

export interface ImageConfigModelType {
  imageUrl?: string;
  imageWidth: number;
  imageHeight: number;
  imageBorderRadius: number;
  imagePosition: 'left' | 'right';
  imageRepeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  imageSize: 'cover' | 'contain' | '100% 100%' | 'auto';
  imageBgPosition:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'left top'
    | 'left center'
    | 'left bottom'
    | 'right top'
    | 'right center'
    | 'right bottom';
  showMore: boolean;
  moreText: string;
  moreLink: string;
  moreTextColor: string;
  moreFontSize: number;
  moreBgColor: string;
  morePaddingX: number;
  morePaddingY: number;
  moreBorderRadius: number;
  moreAlign: 'left' | 'right';
  moreOffsetX: number;
  moreOffsetY: number;
}

const modelValue = defineModel<ImageConfigModelType>({
  default: () => ({
    imageUrl: '',
    imageWidth: 200,
    imageHeight: 240,
    imageBorderRadius: 0,
    imagePosition: 'left',
    imageRepeat: 'no-repeat',
    imageSize: 'cover',
    imageBgPosition: 'center',
    showMore: false,
    moreText: '更多',
    moreLink: '',
    moreTextColor: '#ffffff',
    moreFontSize: 14,
    moreBgColor: '#0f79e9',
    morePaddingX: 10,
    morePaddingY: 6,
    moreBorderRadius: 4,
    moreAlign: 'right',
    moreOffsetX: 0,
    moreOffsetY: 0
  })
});

const imageId = ref('');

if (modelValue.value?.imageUrl) {
  imageId.value = modelValue.value.imageUrl;
}

watch(imageId, newVal => {
  if (newVal) {
    modelValue.value.imageUrl = newVal;
  } else {
    modelValue.value.imageUrl = '';
  }
});

defineOptions({
  name: 'pb-image-text-column-image-config'
});
</script>

<style scoped>
.image-config {
  --config-border: #e2e8f0;
  --config-surface: #f8fafc;
  --config-surface-strong: #fff;
  --config-text: #0f172a;
  --config-muted: #64748b;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-config :deep(.el-divider__text) {
  font-weight: 600;
  color: var(--config-text);
  letter-spacing: 0.2px;
}

.image-config :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--config-muted);
}

.input-with-unit {
  display: flex;
  align-items: center;
}

.suffix-unit {
  margin-right: 8px;
  font-size: 14px;
  color: var(--config-muted);
}
</style>
